import React, {FC, useMemo, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import {IconButton, TextField, Tooltip, Typography} from "@material-ui/core";
import {Add, Cancel} from "@material-ui/icons";
import {useDispatch, useSelector} from "react-redux";
import {selectCharacterSourceState} from "../reducers";
import {groupBy, values} from 'lodash';
import {useFormik} from "formik";
import {createdAnime, createdCharacter, updatedAnime, updatedCharacter} from "../events/CharacterSourceEvents";
import {AnimeAsset, CharacterAsset, Gender} from "../types/AssetTypes";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(4),
  },
  sourceTree: {
    flexGrow: 1,
    maxWidth: 400,
  },
}));


const CharacterSubmission: FC<{ onSubmission: (newBestGirl: string) => void, anime: string }> = ({
                                                                                               onSubmission,
                                                                                               anime,
                                                                                             }) => {
  const {
    handleSubmit,
    values: formValues,
    handleChange
  } = useFormik({
    initialValues: {
      bestGirl: ''
    },
    onSubmit: ({bestGirl}, {resetForm}) => {
      onSubmission(bestGirl);
      resetForm()
    }
  })

  return <form onSubmit={handleSubmit} style={{margin: '1rem 0'}}>
    <TextField label={`Add ${anime} Character`}
               name={'bestGirl'}
               variant={'outlined'}
               placeholder={'Add a new best girl'}
               value={formValues.bestGirl}
               onChange={handleChange}
    />
    <IconButton component={'button'} type={'submit'}>
      <Add/>
    </IconButton>
  </form>
}

const EditableTreeItem: FC<{
  value: string;
  id: string;
  onUpdate: (updatedCharacter: string) => void
}> = ({
        value, onUpdate, id, children
      }) => {
  const [isUpdate, setIsUpdate] = useState(false);

  const {
    handleSubmit,
    values: formValues,
    handleChange,
  } = useFormik({
    initialValues: {
      value: value
    },
    enableReinitialize: true,
    onSubmit: ({value: newValue}, {resetForm}) => {
      onUpdate(newValue);
      resetForm();
      setIsUpdate(false);
    }
  });

  const discardChanges = () => {
    setIsUpdate(false);
  }

  return !isUpdate ?
    <TreeItem nodeId={id} label={
      <Tooltip title={'Click to edit'} placement={'top-start'}><span onClick={e => {
        setIsUpdate(prevState => !prevState);
        e.stopPropagation();
      }}>{value}</span></Tooltip>
    }>
      {children}
    </TreeItem>
    :
    <form onSubmit={handleSubmit} style={{margin: '1rem 0'}}>
      <TextField label={'Name'}
                 name={'value'}
                 variant={'outlined'}
                 placeholder={'Add a new best girl'}
                 value={formValues.value}
                 onChange={handleChange}
      />
      <IconButton component={'button'} type={'submit'}>
        <Add/>
      </IconButton>
      <IconButton component={'span'} onClick={discardChanges}>
        <Cancel/>
      </IconButton>
    </form>
}

const CharacterSources: FC = () => {
  const classes = useStyles();
  const {anime, characters} = useSelector(selectCharacterSourceState);
  const charactersByAnime = useMemo(() =>
      groupBy(values(characters), character => character.animeId),
    [characters]);

  const dispatch = useDispatch();
  const createCharacter = (anime: AnimeAsset) => (newBestGirl: string) => {
    dispatch(createdCharacter({
      id: new Date().valueOf().toString(32),
      name: newBestGirl,
      gender: Gender.FEMALE,
      animeId: anime.id,
    }));
  };

  const updateCharacter = (characterToUpdate: CharacterAsset) => (newCharacterName: string) => {
    dispatch(updatedCharacter({
      ...characterToUpdate,
      name: newCharacterName,
    }));
  };

  const updateAnime = (animeToUpdate: AnimeAsset) => (newAnimeName: string) => {
    dispatch(updatedAnime({
      ...animeToUpdate,
      name: newAnimeName,
    }));
  };

  const {
    handleSubmit,
    values: formValues,
    handleChange
  } = useFormik({
    initialValues: {
      anime: ''
    },
    onSubmit: (newAnime, {resetForm}) => {
      dispatch(createdAnime({
        name: newAnime.anime,
        id: new Date().valueOf().toString(32),
      }));
      resetForm();
    }
  });

  return (
    <div className={classes.root}>
      <Typography variant={'h5'} paragraph>
        Character Sources
      </Typography>
      <TreeView
        className={classes.sourceTree}
        defaultCollapseIcon={<ExpandMoreIcon/>}
        defaultExpandIcon={<ChevronRightIcon/>}
      >
        {
          values(anime).map(dasAnime =>
            (
              <EditableTreeItem
                key={dasAnime.id}
                id={dasAnime.id}
                value={dasAnime.name}
                onUpdate={updateAnime(dasAnime)}
              >
                {
                  charactersByAnime[dasAnime.id]?.map(character => (
                    <EditableTreeItem key={character.id}
                                      value={character.name}
                                      id={character.id}
                                      onUpdate={updateCharacter(character)}/>
                  ))
                }
                <CharacterSubmission onSubmission={createCharacter(dasAnime)} anime={dasAnime.name}/>
              </EditableTreeItem>
            ))
        }
      </TreeView>
      <div>
        <form onSubmit={handleSubmit} style={{margin: '1rem 0'}}>
          <TextField label={'Anime'}
                     name={'anime'}
                     variant={'outlined'}
                     placeholder={'Add an Anime'}
                     value={formValues.anime}
                     onChange={handleChange}
          />
          <IconButton component={'button'} type={'submit'}>
            <Add/>
          </IconButton>
        </form>
      </div>
    </div>
  );
};
export default CharacterSources
