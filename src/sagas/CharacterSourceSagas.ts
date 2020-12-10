import {all, call, fork, put, select, takeEvery} from 'redux-saga/effects';
import {INITIALIZED_APPLICATION, REQUESTED_SYNC_CHANGES, syncedChanges} from "../events/ApplicationLifecycleEvents";
import {selectCharacterSourceState} from "../reducers";
import {Anime, Waifu} from "../reducers/VisualAssetReducer";
import {createReceivedAnimeList, createReceivedCharacterList} from "../events/CharacterSourceEvents";
import {CharacterSourceState} from "../reducers/CharacterSourceReducer";
import {isEmpty} from "lodash";
import {Assets, CharacterAsset} from "../types/AssetTypes";
import {apiGet, apiPost, extractAddedAssets, syncSaga} from "./CommonSagas";

function* characterSourceAssetFetchSaga() {
  const {anime, characters}: CharacterSourceState = yield select(selectCharacterSourceState)
  if (!(isEmpty(anime) || isEmpty(characters))) return;

  yield fork(loadCharacterDefinitions);
  yield fork(loadAnimeDefinitions);
}

function* loadCharacterDefinitions() {
  const characterList: Waifu[] | undefined = yield call(getCharacterDefinitions);
  if (characterList) {
    yield put(createReceivedCharacterList(characterList));
  }
}


function* getCharacterDefinitions() {
  try {
    const allCharacterAssets: CharacterAsset[] = yield call(() =>
      apiGet('/assets/characters')
    );
    return allCharacterAssets;
  } catch (e) {
    console.warn("Unable to get characters", e)
  }
}

function* loadAnimeDefinitions() {
  const myAnimeList: Anime[] | undefined = yield call(getAnimeDefinitions);
  if (myAnimeList) {
    yield put(createReceivedAnimeList(myAnimeList));
  }
}

function* getAnimeDefinitions() {
  try {
    const myAnimeList: Anime[] = yield call(() =>
      apiGet('/assets/anime')
    );
    return myAnimeList;
  } catch (e) {
    console.warn("Unable to get anime 囧", e)
  }
}


function* attemptCharacterSync() {
  try {
    const {unSyncedCharacters}: CharacterSourceState = yield select(selectCharacterSourceState);
    const addedCharacters = extractAddedAssets(unSyncedCharacters);
    yield call(apiPost, '/assets/characters', addedCharacters);
    yield put(syncedChanges(Assets.WAIFU));
  } catch (e) {
    console.warn("unable to sync characters for raisins", e)
  }
}

function* attemptAnimeSync() {
  try {
    const {unSyncedAnime}: CharacterSourceState = yield select(selectCharacterSourceState);
    const addedAnime = extractAddedAssets(unSyncedAnime);
    yield call(apiPost, '/assets/anime', addedAnime);
    yield put(syncedChanges(Assets.ANIME));
  } catch (e) {
    console.warn("unable to sync anime for raisins", e)
  }
}

function* characterSourceSyncSaga() {
  yield fork(syncSaga, Assets.WAIFU, attemptCharacterSync);
  yield fork(syncSaga, Assets.ANIME, attemptAnimeSync);
}

function* characterSourceSagas() {
  yield takeEvery(INITIALIZED_APPLICATION, characterSourceAssetFetchSaga);
  yield takeEvery(REQUESTED_SYNC_CHANGES, characterSourceSyncSaga);
}

export default function* (): Generator {
  yield all([characterSourceSagas()]);
}
