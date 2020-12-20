import React, {FC, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Container, Grid, Link as MUILink, Typography} from "@material-ui/core";
import {useSelector} from "react-redux";
import {selectVisualAssetState} from "../reducers";
import InfiniteScroll from "./util/InfiniteScroll";
import {Link} from 'react-router-dom';
import {buildS3ObjectLink} from "../util/AWSTools";
import MemeDisplay from "./MemeDisplay";

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeight: {
    height: 240,
  },
}));

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <MUILink color="inherit" href="https://unthrottled.io">
        Unthrottled
      </MUILink>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const memesPerPage = 10;

const Dashboard: FC = () => {
  const classes = useStyles();

  const {displayAssetList} = useSelector(selectVisualAssetState);
  const [assetIndex, setAssetIndex] = useState(memesPerPage);

  const viewedVisualAssets = displayAssetList.slice(0, assetIndex)
  const hasMore = displayAssetList.length > viewedVisualAssets.length;
  const fetchData = () => {
    if (hasMore) {
      setAssetIndex(prevState => {
        const nextIndex = prevState + memesPerPage;
        return nextIndex > displayAssetList.length ? displayAssetList.length : nextIndex;
      })
    }

  };

  return !displayAssetList.length ? (<></>) : (
    <Container className={classes.container}>
      <InfiniteScroll
        loadMore={fetchData}
        hasMore={hasMore}
        loadMoreDisplay={<h3 style={{margin: '2rem auto'}}>Hang tight Senpai...</h3>}
      >
        <Grid container spacing={3}>
          {
            viewedVisualAssets.map(visualMemeAsset => (
              <Grid item key={visualMemeAsset.id} >
                <Link style={{textDecoration: 'none', color: 'inherit'}} to={`/assets/view/${visualMemeAsset.id}`}>
                  <MemeDisplay href={buildS3ObjectLink(
                    // todo: consolidate
                    `visuals/${visualMemeAsset.path}`
                  )}/>
                </Link>
              </Grid>
            ))
          }
        </Grid>
      </InfiniteScroll>
      <Box pt={4}>
        <Copyright/>
      </Box>
    </Container>
  );
};

export default Dashboard;
