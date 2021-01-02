import {all, call, fork, put, select, takeEvery} from 'redux-saga/effects';
import {
  INITIALIZED_APPLICATION,
  REQUESTED_SYNC_CHANGES,
  SYNCED_ASSET,
  syncedChanges
} from "../events/ApplicationLifecycleEvents";
import {selectMotivationAssetState, selectVisualAssetState} from "../reducers";
import {AssetGroupKeys, Assets, VisualMemeAsset} from "../types/AssetTypes";
import {
  createdVisualAsset,
  createReceivedVisualMemeList,
  createUpdatedVisualAssetList,
  DROPPED_MEME
} from "../events/VisualAssetEvents";
import {LocalVisualAssetDefinition, VisualAssetState} from "../reducers/VisualAssetReducer";
import {apiGet, apiPost, extractAddedAssets, syncSaga, uploadAssetsSaga} from "./CommonSagas";
import {pick, values} from "lodash";
import {PayloadEvent} from "../events/Event";
import {LocalMotivationAsset, MotivationAssetState} from "../reducers/MotivationAssetReducer";
import {cleanedUpMotivationAssets} from "../events/MotivationAssetEvents";
import {StringDictionary} from "../types/SupportTypes";

function* fetchVisualAssetList() {
  const allVisualAssets: VisualMemeAsset[] = yield call(() =>
    apiGet('/assets/visuals')
  );
  return allVisualAssets;
}


function* visualAssetFetchSaga() {
  const {assets}: VisualAssetState = yield select(selectVisualAssetState)
  if (assets.length) return;

  try {
    const visualAssets = yield call(fetchVisualAssetList);
    yield put(createReceivedVisualMemeList(
      visualAssets.reverse()
    ));
  } catch (e) {
    console.warn("Unable to get visual asset list", e)
  }
}

const VISUAL_ASSET_WHITELIST = [
  'id',
  'path',
  'alt',
  'cat',
  'char',
  'aud',
]

// todo: this is just for dropped assets
function* attemptToSyncVisualAssets() {
  try {
    const {assets, unsyncedAssets}: VisualAssetState = yield select(selectVisualAssetState);
    const addedVisualAssets = extractAddedAssets<LocalVisualAssetDefinition>(unsyncedAssets);

    yield call(uploadAssetsSaga, AssetGroupKeys.VISUAL, addedVisualAssets);

    const newVisualAssets = addedVisualAssets.map((asset =>
      pick(asset, VISUAL_ASSET_WHITELIST) as VisualMemeAsset));

    yield call(apiPost, '/assets/visuals', newVisualAssets);
    yield put(syncedChanges(Assets.VISUAL));
    yield put(createUpdatedVisualAssetList(values(
      assets.concat(addedVisualAssets)
        .reduce((accum, asset) => ({
          ...accum,
          [asset.path]: asset
        }), {} as StringDictionary<VisualMemeAsset>),
    )));
  } catch (e) {
    console.warn("unable to sync images for raisins", e)
  }
}

function* visualAssetExtractionSaga({payload}: PayloadEvent<LocalMotivationAsset[]>) {
  yield all(
    payload.filter(asset => !!asset.visuals)
      .map(asset => put(createdVisualAsset({
        ...asset.visuals,
        imageChecksum: asset.imageChecksum,
        file: asset.imageFile
      })))
  );
}

function* localAssetCleanupSaga({payload: syncedAsset}: PayloadEvent<Assets>) {
  if (syncedAsset === Assets.VISUAL) {
    // todo: move to motivation asset sagas
    const {assets}: MotivationAssetState = yield select(selectMotivationAssetState);
    yield put(cleanedUpMotivationAssets(
      values(assets)
        .filter(asset => !asset.imageChecksum)
    ));
    // todo: why dis?
    const newAssetList = yield call(fetchVisualAssetList);
    yield put(createUpdatedVisualAssetList(newAssetList))
  }
}

function* visualAssetSyncSaga() {
  yield fork(syncSaga, Assets.VISUAL, attemptToSyncVisualAssets);
}

function* visualAssetSagas() {
  yield takeEvery(INITIALIZED_APPLICATION, visualAssetFetchSaga);
  yield takeEvery(DROPPED_MEME, visualAssetExtractionSaga);
  yield takeEvery(REQUESTED_SYNC_CHANGES, visualAssetSyncSaga);
  yield takeEvery(SYNCED_ASSET, localAssetCleanupSaga);
}

export default function* (): Generator {
  yield all([visualAssetSagas()]);
}
