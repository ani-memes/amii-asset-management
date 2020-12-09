import {all, call, fork, put, select, takeEvery} from 'redux-saga/effects';
import {INITIALIZED_APPLICATION, REQUESTED_SYNC_CHANGES, syncedChanges} from "../events/ApplicationLifecycleEvents";
import {selectAudibleAssetState} from "../reducers";
import {AssetGroupKeys, Assets} from "../types/AssetTypes";
import {createReceivedAudibleAssetList} from "../events/AudibleAssetEvents";
import {AudibleAssetDefinition, AudibleAssetState, LocalAudibleAssetDefinition} from "../reducers/AudibleAssetReducer";
import {apiGet, apiPost, extractAddedAssets, syncSaga, uploadAssetsSaga} from "./CommonSagas";
import pick from "lodash/pick";

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

const AUDIBLE_ASSET_WHITELIST = [
  'id',
  'path',
]

// todo: this is just for dropped assets
function* attemptToSyncAudibleAssets() {
  try {
    const {unsyncedAssets}: AudibleAssetState = yield select(selectAudibleAssetState);
    const addedAudibleAssets = extractAddedAssets<LocalAudibleAssetDefinition>(unsyncedAssets);

    yield call(uploadAssetsSaga, AssetGroupKeys.AUDIBLE, addedAudibleAssets);

    const newAudibleAssets = addedAudibleAssets.map(asset =>
      pick(asset, AUDIBLE_ASSET_WHITELIST) as AudibleAssetDefinition);

    yield call(apiPost, '/assets/audible', newAudibleAssets);
    yield put(syncedChanges(Assets.AUDIBLE));
  } catch (e) {
    console.warn("unable to sync audio for raisins", e)
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
