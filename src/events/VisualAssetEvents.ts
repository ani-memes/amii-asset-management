import {PayloadEvent} from './Event';
import {VisualMemeAsset} from "../types/AssetTypes";
import {LocalMotivationAsset} from "../reducers/MotivationAssetReducer";
import {LocalVisualAssetDefinition} from "../reducers/VisualAssetReducer";

export const RECEIVED_VISUAL_MEME_LIST = 'RECEIVED_VISUAL_MEME_LIST';
export const RECEIVED_VISUAL_ASSET_LIST = 'RECEIVED_VISUAL_ASSET_LIST';
export const UPDATED_VISUAL_ASSET_LIST = 'UPDATED_VISUAL_ASSET_LIST';
export const DROPPED_MEME = 'DROPPED_MEME';
export const CREATED_VISUAL_ASSET = 'CREATED_VISUAL_ASSET';
export const FILTERED_VISUAL_ASSETS = 'FILTERED_VISUAL_ASSETS';

export const createReceivedVisualMemeList = (
  visualAssets: VisualMemeAsset[],
): PayloadEvent<VisualMemeAsset[]> => ({
  type: RECEIVED_VISUAL_MEME_LIST,
  payload: visualAssets,
});

export const createFilteredVisualAssetList = (
  searchForAssets: VisualMemeAsset[],
): PayloadEvent<VisualMemeAsset[]> => ({
  type: FILTERED_VISUAL_ASSETS,
  payload: searchForAssets,
});

export const createUpdatedVisualAssetList = (
  visualAssets: VisualMemeAsset[],
): PayloadEvent<VisualMemeAsset[]> => ({
  type: UPDATED_VISUAL_ASSET_LIST,
  payload: visualAssets,
});

export const droppedMeme = (
  localMotivationAssets: LocalMotivationAsset[],
): PayloadEvent<LocalMotivationAsset[]> => ({
  type: DROPPED_MEME,
  payload: localMotivationAssets,
});

export const createdVisualAsset = (
  visualAsset: LocalVisualAssetDefinition,
): PayloadEvent<LocalVisualAssetDefinition> => ({
  type: CREATED_VISUAL_ASSET,
  payload: visualAsset,
});
