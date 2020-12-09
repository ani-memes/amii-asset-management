import {all, call, put, select, take, takeEvery} from 'redux-saga/effects';
import {
  selectAudibleAssetState,
  selectMotivationAssetState,
  selectVisualAssetState
} from "../reducers";
import {
  createdVisualAsset,
  createFilteredVisualS3List,
  RECEIVED_VISUAL_ASSET_LIST,
  UPDATED_VISUAL_S3_LIST
} from "../events/VisualAssetEvents";
import {VisualAssetState} from "../reducers/VisualAssetReducer";
import {
  createCurrentMotivationAssetEvent,
  createdMotivationAsset,
  SEARCHED_FOR_ASSET,
  UPDATED_MOTIVATION_ASSET,
  VIEWED_EXISTING_ASSET,
  VIEWED_UPLOADED_ASSET
} from "../events/MotivationAssetEvents";
import {PayloadEvent} from "../events/Event";
import {LocalMotivationAsset, MotivationAsset, MotivationAssetState} from "../reducers/MotivationAssetReducer";
import {buildS3ObjectLink} from "../util/AWSTools";
import {AssetGroupKeys, VisualMemeAsset} from "../types/AssetTypes";
import {AudibleAssetDefinition, AudibleAssetState} from "../reducers/AudibleAssetReducer";
import {createdAudibleAsset, RECEIVED_AUDIBLE_ASSET_LIST} from "../events/AudibleAssetEvents";
import {v4 as uuid} from 'uuid';
import {flatten, isEmpty, omit, values} from 'lodash';
import {StringDictionary} from "../types/SupportTypes";
import {push} from "connected-react-router";
import md5 from "js-md5";

function* motivationAssetViewSaga({payload: assetId}: PayloadEvent<string>) {
  const motivationAsset = yield call(fetchAssetForEtag, assetId);
  yield put(createCurrentMotivationAssetEvent(motivationAsset));
}

function* localMotivationAssetViewSaga({payload: checkSum}: PayloadEvent<string>) {
  const motivationAsset = yield call(fetchAssetForChecksum, checkSum);
  yield put(createCurrentMotivationAssetEvent(motivationAsset));
}

function* fetchAssetForEtag(assetId: string) {
  const assetKey = assetId;
  const {assets}: MotivationAssetState = yield select(selectMotivationAssetState)
  const cachedAsset = assets[assetKey];
  if (cachedAsset)
    return cachedAsset;

  const {assets: visualAssetDefinitions}: VisualAssetState = yield select(selectVisualAssetState);
  if (!visualAssetDefinitions.length) {
    const {payload: freshVisualAssetDefinitions}: PayloadEvent<VisualMemeAsset[]> =
      yield take(RECEIVED_VISUAL_ASSET_LIST);
    return yield call(motivationAssetAssembly, assetKey, freshVisualAssetDefinitions)
  } else {
    return yield call(motivationAssetAssembly, assetKey, visualAssetDefinitions);
  }
}

function* fetchAssetForChecksum(checkSum: string) {
  const {assets}: MotivationAssetState = yield select(selectMotivationAssetState)
  const cachedAsset = values(assets).find(asset => asset.imageChecksum === checkSum);
  if (cachedAsset)
    return cachedAsset;
}

// todo: this
function getAudibleMotivationAssets(audibleAssets: AudibleAssetDefinition[], groupId: string) {
  const relevantAudibleAsset = audibleAssets.find(asset => asset.id === groupId);
  if (relevantAudibleAsset) {
    return {
      audio: relevantAudibleAsset,
      audioHref: buildS3ObjectLink(`${AssetGroupKeys.AUDIBLE}/${relevantAudibleAsset.path}`)
    }
  }

  return {};
}

function* resolveGroupedAudibleAsset(audibleAssetId: string) {
  const {assets: cachedAssets, unsyncedAssets}: AudibleAssetState = yield select(selectAudibleAssetState)
  if (cachedAssets.length) {
    // todo: viewing unsynced grouped assetsTemp
    const assetFromCache = getAudibleMotivationAssets(cachedAssets, audibleAssetId);
    return assetFromCache || getAudibleMotivationAssets(
      values(unsyncedAssets)
        .map(cachedAsset => cachedAsset.asset)
      , audibleAssetId);
  }

  const {payload: audibleAssets}: PayloadEvent<AudibleAssetDefinition[]> = yield take(RECEIVED_AUDIBLE_ASSET_LIST);
  return getAudibleMotivationAssets(audibleAssets, audibleAssetId);

}

function* yieldGroupedAssets(visualAssetDefinition: VisualMemeAsset) {
  const audibleAssetId = visualAssetDefinition.aud;
  if (audibleAssetId) {
    return yield call(resolveGroupedAudibleAsset, audibleAssetId)
  }

  return {};
}

function getTrimmedKey(assetKey: string) {
  return assetKey.substring(`${AssetGroupKeys.VISUAL}/`.length);
}

function* motivationAssetAssembly(
  assetKey: string,
  assets: VisualMemeAsset[],
) {
  const trimmedKey = getTrimmedKey(assetKey);
  const visualAssetDefinition = assets.find(assetDef => assetDef.path === trimmedKey);
  if (visualAssetDefinition) {
    const groupedAssets = yield call(yieldGroupedAssets, visualAssetDefinition);
    const motivationAsset: MotivationAsset = {
      ...groupedAssets,
      visuals: visualAssetDefinition,
      imageHref: buildS3ObjectLink(assetKey),
    };

    yield put(createdMotivationAsset(motivationAsset));
    return motivationAsset;
  }
}

function getPath(visualAsset: VisualMemeAsset) {
  const directory = visualAsset.path.split("/")[0];
  return directory.indexOf('.') < 0 && !!directory ? directory : '';
}

function* motivationAssetUpdateSaga({payload: motivationAsset}: PayloadEvent<LocalMotivationAsset>) {
  const visualAsset = motivationAsset.visuals;
  // todo: revisit this
  const groupId = visualAsset.aud;
  if (motivationAsset.audioFile) {
    yield put(createdAudibleAsset({
      id: 'bleh', // todo this
      file: motivationAsset.audioFile,
      path: `${getPath(visualAsset)}${motivationAsset.audioFile.name}`
    }));
  }
  yield put(createdVisualAsset({
    ...omit(visualAsset, 'groupId'),
    file: motivationAsset.imageFile,
    imageChecksum: motivationAsset.imageChecksum,
    ...(!!motivationAsset.audioFile ? {aud: visualAsset.aud} : {}),
  }))
}

const SEARCH_KEYS = [
  "path", "imageAlt"
]

function containsKeyword(
  asset: VisualMemeAsset,
  searchKeyword: string
): boolean {
  // @ts-ignore
  return !!SEARCH_KEYS.map(key => asset[key])
    .map(field => field + '')
    .find(fieldValue => fieldValue.indexOf(searchKeyword) > -1)
}

function* filterAssets(keyword: string, s3List: VisualMemeAsset[]) {
  if (!keyword) {
    yield put(createFilteredVisualS3List(s3List))
  } else {
    const searchKeyword = keyword.toLowerCase();
    yield put(createFilteredVisualS3List(
      s3List.filter(asset => containsKeyword(asset, searchKeyword))
        .filter(Boolean) as VisualMemeAsset[]
    ))
  }
}

function* updateSearch({payload: s3List}: PayloadEvent<VisualMemeAsset[]>) {
  const {searchTerm}: MotivationAssetState = yield select(selectMotivationAssetState);
  yield call(filterAssets, searchTerm || '', s3List);
}

function* motivationAssetSearchSaga({payload: keyword}: PayloadEvent<string>) {
  const {assets}: VisualAssetState = yield select(selectVisualAssetState);
  yield call(filterAssets, keyword, assets);
  yield put(push("/"));
}

function* motivationAssetSagas() {
  yield takeEvery(VIEWED_EXISTING_ASSET, motivationAssetViewSaga);
  yield takeEvery(VIEWED_UPLOADED_ASSET, localMotivationAssetViewSaga);
  yield takeEvery(UPDATED_MOTIVATION_ASSET, motivationAssetUpdateSaga);
  yield takeEvery(SEARCHED_FOR_ASSET, motivationAssetSearchSaga);
  yield takeEvery(UPDATED_VISUAL_S3_LIST, updateSearch);
}

export default function* (): Generator {
  yield all([motivationAssetSagas()]);
}
