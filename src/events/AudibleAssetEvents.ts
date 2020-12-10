import {PayloadEvent} from './Event';
import {AudibleAssetDefinition, LocalAudibleAssetDefinition} from "../reducers/AudibleAssetReducer";

export const RECEIVED_AUDIBLE_ASSET_LIST = 'RECEIVED_AUDIBLE_ASSET_LIST';
export const CREATED_AUDIBLE_ASSET = 'CREATED_AUDIBLE_ASSET';


export const createReceivedAudibleAssetList = (
  audibleAssets: AudibleAssetDefinition[],
): PayloadEvent<AudibleAssetDefinition[]> => ({
  type: RECEIVED_AUDIBLE_ASSET_LIST,
  payload: audibleAssets,
});

export const createdAudibleAsset = (
  audibleAssets: LocalAudibleAssetDefinition,
): PayloadEvent<LocalAudibleAssetDefinition> => ({
  type: CREATED_AUDIBLE_ASSET,
  payload: audibleAssets,
});
