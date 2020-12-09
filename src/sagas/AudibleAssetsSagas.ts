import {all, call, fork, put, select, takeEvery} from 'redux-saga/effects';
import {INITIALIZED_APPLICATION, REQUESTED_SYNC_CHANGES, syncedChanges} from "../events/ApplicationLifecycleEvents";
import {selectAudibleAssetState} from "../reducers";
import {AssetGroupKeys, Assets} from "../types/AssetTypes";
import {createReceivedAudibleAssetList} from "../events/AudibleAssetEvents";
import {AudibleAssetDefinition, AudibleAssetState, LocalAudibleAssetDefinition} from "../reducers/AudibleAssetReducer";
import {
  apiGet,
  ContentType,
  downloadAsset,
  extractAddedAssets,
  syncSaga,
  uploadAssetSaga,
  uploadAssetsSaga
} from "./CommonSagas";
import {omit, values} from "lodash";

function* fetchAudibleAssetList() {
  const allAudibleAssets: AudibleAssetDefinition[] = yield call(() =>
    apiGet('/assets/audible')
  );
  return allAudibleAssets;
}


function* audibleAssetFetchSaga() {
  const {assets}: AudibleAssetState = yield select(selectAudibleAssetState)
  if (assets.length) return;

  try {
    const assetJson: AudibleAssetDefinition[] = yield call(fetchAudibleAssetList);
    yield put(createReceivedAudibleAssetList(assetJson));
  } catch (e) {
    console.warn("Unable to get audible asset list", e)
  }
}

const AUDIBLE_ASSET_LIST_KEY = `${AssetGroupKeys.AUDIBLE}/assets.json`;

const AUDIBLE_ASSET_BLACKLIST = [
  "file"
]

function* attemptToSyncAudibleAssets() {
  try {
    const freshAudibleList: AudibleAssetDefinition[] | undefined = yield call(getAudibleAssetDefinitions);
    const definedAudibleList = freshAudibleList || [];
    const {unsyncedAssets}: AudibleAssetState = yield select(selectAudibleAssetState);
    const addedAudibleAssets = extractAddedAssets<LocalAudibleAssetDefinition>(unsyncedAssets);

    yield call(uploadAssetsSaga, AssetGroupKeys.AUDIBLE, addedAudibleAssets);

    const newAudibleAssets = values(
      definedAudibleList.concat(addedAudibleAssets)
        .map(asset => omit(asset, AUDIBLE_ASSET_BLACKLIST) as AudibleAssetDefinition)
        .reduce((accum, asset) => ({
          ...accum,
          [asset.path]: asset
        }), {}),
    );
    yield call(uploadAssetSaga,
      AssetGroupKeys.AUDIBLE, 'assets.json', // todo: consolidate string literal
      JSON.stringify(newAudibleAssets), ContentType.JSON
    );
    yield put(syncedChanges(Assets.AUDIBLE));
  } catch (e) {
    console.warn("unable to sync audio for raisins", e)
  }
}

function* getAudibleAssetDefinitions() {
  try {
    const audibleAssetDefinitions: AudibleAssetDefinition[] = yield call(() =>
      downloadAsset(AUDIBLE_ASSET_LIST_KEY, true));
    return audibleAssetDefinitions;
  } catch (e) {
    console.warn("Unable to get to get audible assets 囧", e)
  }
}

function* audibleAssetSyncSaga() {
  yield fork(syncSaga, Assets.AUDIBLE, attemptToSyncAudibleAssets);
}

function* audibleAssetSagas() {
  yield takeEvery(INITIALIZED_APPLICATION, audibleAssetFetchSaga);
  yield takeEvery(REQUESTED_SYNC_CHANGES, audibleAssetSyncSaga);
}

export default function* (): Generator {
  yield all([audibleAssetSagas()]);
}
