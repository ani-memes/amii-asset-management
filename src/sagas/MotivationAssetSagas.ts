import {all, call, put, select, take, takeEvery} from 'redux-saga/effects';
import {selectAudibleAssetState, selectMotivationAssetState, selectVisualAssetState} from "../reducers";
import {
  createdVisualAsset,
  createFilteredVisualAssetList,
  RECEIVED_VISUAL_MEME_LIST, UPDATED_VISUAL_ASSET_LIST,
} from "../events/VisualAssetEvents";
import {MemeAssetCategory, VisualAssetState} from "../reducers/VisualAssetReducer";
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
import {omit, values} from 'lodash';
import {push} from "connected-react-router";

function* motivationAssetViewSaga({payload: assetId}: PayloadEvent<string>) {
  const motivationAsset: MotivationAsset = yield call(fetchAssetById, assetId);
  yield put(createCurrentMotivationAssetEvent(motivationAsset));
}

function* localMotivationAssetViewSaga({payload: checkSum}: PayloadEvent<string>) {
  const motivationAsset: MotivationAsset = yield call(fetchAssetForChecksum, checkSum);
  yield put(createCurrentMotivationAssetEvent(motivationAsset));
}

function* fetchAssetById(assetId: string) {
  const {assets}: MotivationAssetState = yield select(selectMotivationAssetState)
  const cachedAsset = assets[assetId];
  if (cachedAsset)
    return cachedAsset;

  const {assets: visualAssetDefinitions}: VisualAssetState = yield select(selectVisualAssetState);
  if (!visualAssetDefinitions.length) {
    const {payload: freshVisualAssetDefinitions}: PayloadEvent<VisualMemeAsset[]> =
      yield take(RECEIVED_VISUAL_MEME_LIST);
    const motivationAsset: MotivationAsset = yield call(motivationAssetAssembly, assetId, freshVisualAssetDefinitions);
    return motivationAsset
  } else {
    const motivationAsset: MotivationAsset = yield call(motivationAssetAssembly, assetId, visualAssetDefinitions);
    return motivationAsset;
  }
}

function* fetchAssetForChecksum(checkSum: string) {
  const {assets}: MotivationAssetState = yield select(selectMotivationAssetState)
  const cachedAsset = values(assets).find(asset => asset.imageChecksum === checkSum);
  if (cachedAsset)
    return cachedAsset;
}

function getAudibleMotivationAssets(
  audibleAssets: AudibleAssetDefinition[],
  audibleAssetId: string
) {
  const relevantAudibleAsset = audibleAssets.find(asset => asset.id === audibleAssetId);
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
    const groupedAssets: MotivationAsset = yield call(resolveGroupedAudibleAsset, audibleAssetId);
    return groupedAssets
  }

  return {};
}

function* motivationAssetAssembly(
  assetId: string,
  assets: VisualMemeAsset[],
) {
  const visualAssetDefinition = assets.find(assetDef => assetDef.id === assetId);
  if (visualAssetDefinition) {
    const groupedAssets: MotivationAsset = yield call(yieldGroupedAssets, visualAssetDefinition);
    const motivationAsset: MotivationAsset = {
      ...groupedAssets,
      visuals: visualAssetDefinition,
      imageHref: buildS3ObjectLink(
        // todo: consolidate path
        `visuals/${visualAssetDefinition.path}`
      ),
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
  const audioFile = motivationAsset.audioFile;
  const audioChecksum = motivationAsset.audioChecksum;
  if (audioFile && audioChecksum) {
    yield put(createdAudibleAsset({
      id: audioChecksum,
      file: audioFile,
      path: `${getPath(visualAsset)}${audioFile.name}`
    }));
  }
  yield put(createdVisualAsset({
    ...omit(visualAsset, 'groupId'),
    file: motivationAsset.imageFile,
    imageChecksum: motivationAsset.imageChecksum,
    ...(!!(audioFile && audioChecksum) ? {aud: audioChecksum} : {}),
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

export const memeAssetCategories = [
  {title: 'Acknowledgement', value: MemeAssetCategory.ACKNOWLEDGEMENT},
  {title: 'Frustration', value: MemeAssetCategory.FRUSTRATION},
  {title: 'Enraged', value: MemeAssetCategory.ENRAGED},
  {title: 'Celebration', value: MemeAssetCategory.CELEBRATION},
  {title: 'Happy', value: MemeAssetCategory.HAPPY},
  {title: 'Smug', value: MemeAssetCategory.SMUG},
  {title: 'Waiting', value: MemeAssetCategory.WAITING},
  {title: 'Motivation', value: MemeAssetCategory.MOTIVATION},
  {title: 'Welcoming', value: MemeAssetCategory.WELCOMING},
  {title: 'Departure', value: MemeAssetCategory.DEPARTURE},
  {title: 'Encouragement', value: MemeAssetCategory.ENCOURAGEMENT},
  {title: 'Mocking', value: MemeAssetCategory.MOCKING},
  {title: 'Shocked', value: MemeAssetCategory.SHOCKED},
  {title: 'Disappointment', value: MemeAssetCategory.DISAPPOINTMENT},
  {title: 'Alert', value: MemeAssetCategory.ALERT},
  {title: 'Bored', value: MemeAssetCategory.BORED},
  {title: 'Tired', value: MemeAssetCategory.TIRED},
  {title: 'Patiently Waiting', value: MemeAssetCategory.PATIENTLY_WAITING},
  {title: 'Pouting', value: MemeAssetCategory.POUTING},
].sort((a,b)=> a.title.localeCompare(b.title));

const assetMappings = memeAssetCategories.reduce(
  (accum, next) => ({
    ...accum,
    [next.value] : next.title
  }), {})


function categoryContainsKeyword(
  asset: MemeAssetCategory[],
  searchKeyword: string
): boolean {
  // @ts-ignore
  return !!asset.map(cat => assetMappings[cat])
    .map(field => field + '')
    .find(fieldValue => fieldValue.toLowerCase().indexOf(searchKeyword) > -1)
}

function* filterAssets(keyword: string, visualMemeAssets: VisualMemeAsset[]) {
  if (!keyword) {
    yield put(createFilteredVisualAssetList(visualMemeAssets))
  } else {
    const searchKeyword = keyword.toLowerCase();
    yield put(createFilteredVisualAssetList(
      visualMemeAssets.filter(asset => containsKeyword(asset, searchKeyword) ||
        categoryContainsKeyword(asset.cat, searchKeyword))
        .filter(Boolean) as VisualMemeAsset[]
    ))
  }
}

function* updateSearch({payload: visualMemeAssets}: PayloadEvent<VisualMemeAsset[]>) {
  const {searchTerm}: MotivationAssetState = yield select(selectMotivationAssetState);
  yield call(filterAssets, searchTerm || '', visualMemeAssets);
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
  yield takeEvery(UPDATED_VISUAL_ASSET_LIST, updateSearch);
}

export default function* (): Generator {
  yield all([motivationAssetSagas()]);
}
