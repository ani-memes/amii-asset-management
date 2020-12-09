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
  createUpdatedVisualS3List,
  DROPPED_WAIFU
} from "../events/VisualAssetEvents";
import {LocalVisualAssetDefinition, VisualAssetState} from "../reducers/VisualAssetReducer";
import {apiGet, ContentType, extractAddedAssets, syncSaga, uploadAssetSaga, uploadAssetsSaga} from "./CommonSagas";
import {omit, values} from "lodash";
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
    yield put(createReceivedVisualMemeList(visualAssets));
  } catch (e) {
    console.warn("Unable to get visual asset s3 list", e)
  }
}

const VISUAL_ASSET_BLACKLIST = [
  "file"
]


function* attemptToSyncVisualAssets() {
  try {
    // todo: this
    const freshVisualList: VisualMemeAsset[] | undefined = [];
    const definedVisualList = freshVisualList || [];
    const {unsyncedAssets}: VisualAssetState = yield select(selectVisualAssetState);
    const addedVisualAssets = extractAddedAssets<LocalVisualAssetDefinition>(unsyncedAssets);

    yield call(uploadAssetsSaga, AssetGroupKeys.VISUAL, addedVisualAssets);

    const newVisualAssets = values(
      definedVisualList.concat(addedVisualAssets)
        .map(asset => omit(asset, VISUAL_ASSET_BLACKLIST) as VisualMemeAsset)
        .reduce((accum, asset) => ({
          ...accum,
          [asset.path]: asset
        }), {} as StringDictionary<VisualMemeAsset>),
    );

    yield put(createUpdatedVisualAssetList(newVisualAssets));
    yield call(uploadAssetSaga,
      AssetGroupKeys.VISUAL, 'assets.json', // todo: consolidate string literals2
      JSON.stringify(newVisualAssets), ContentType.JSON
    );
    yield put(syncedChanges(Assets.VISUAL));
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
    const newAssetList = yield call(fetchVisualAssetList);
    yield put(createUpdatedVisualS3List(newAssetList))
  }
}

function* visualAssetSyncSaga() {
  yield fork(syncSaga, Assets.VISUAL, attemptToSyncVisualAssets);
}

function* visualAssetSagas() {
  yield takeEvery(INITIALIZED_APPLICATION, visualAssetFetchSaga);
  yield takeEvery(DROPPED_WAIFU, visualAssetExtractionSaga);
  yield takeEvery(REQUESTED_SYNC_CHANGES, visualAssetSyncSaga);
  yield takeEvery(SYNCED_ASSET, localAssetCleanupSaga);
}

export default function* (): Generator {
  yield all([visualAssetSagas()]);
}
