import {LOGGED_OFF} from '../events/SecurityEvents';
import {LocalAsset, VisualMemeAsset} from "../types/AssetTypes";
import {
  CREATED_VISUAL_ASSET,
  FILTERED_VISUAL_ASSETS,
  RECEIVED_VISUAL_ASSET_LIST,
  RECEIVED_VISUAL_MEME_LIST,
  UPDATED_VISUAL_ASSET_LIST,
} from "../events/VisualAssetEvents";
import {HasId, StringDictionary, SyncType, UnsyncedAsset} from "../types/SupportTypes";

export enum MemeAssetCategory {
  ACKNOWLEDGEMENT = 0,
  FRUSTRATION = 1,
  ENRAGED = 2,
  CELEBRATION = 3,
  HAPPY = 4,
  SMUG = 5,
  WAITING = 6,
  MOTIVATION = 7,
  WELCOMING = 8,
  DEPARTURE = 9,
  ENCOURAGEMENT = 10,
  TSUNDERE = 11,
  MOCKING = 12,
  SHOCKED = 13,
  DISAPPOINTMENT = 14 // you don't want to disappoint your waifu now do you?
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface Anime extends HasId {
  name: string;
}

export interface Waifu extends HasId {
  name: string;
  animeId: string;
}


export interface LocalVisualAssetDefinition extends VisualMemeAsset, LocalAsset {
  imageChecksum?: string;
}

export type VisualAssetState = {
  assets: VisualMemeAsset[];
  displayAssetList: VisualMemeAsset[];
  unsyncedAssets: StringDictionary<UnsyncedAsset<LocalVisualAssetDefinition>>
};

export const INITIAL_VISUAL_ASSET_STATE: VisualAssetState = {
  assets: [],
  displayAssetList: [],
  unsyncedAssets: {},
};


// eslint-disable-next-line
const visualAssetReducer = (state: VisualAssetState = INITIAL_VISUAL_ASSET_STATE, action: any) => {
  switch (action.type) {
    case RECEIVED_VISUAL_MEME_LIST:
      return {
        ...state,
        assets: action.payload,
        displayAssetList: action.payload,
      };
    case UPDATED_VISUAL_ASSET_LIST:
    case RECEIVED_VISUAL_ASSET_LIST:
      return {
        ...state,
        assets: action.payload,
      };

    case FILTERED_VISUAL_ASSETS: {
      return {
        ...state,
        displayAssetList: action.payload
      }
    }
    case CREATED_VISUAL_ASSET: {
      return {
        ...state,
        assets: [
          ...state.assets,
          action.payload,
        ],
        unsyncedAssets: {
          ...state.unsyncedAssets,
          [action.payload.imageChecksum || action.payload.path]: {
            syncType: SyncType.CREATE,
            asset: action.payload,
          } as UnsyncedAsset<LocalVisualAssetDefinition>
        }
      };
    }
    case LOGGED_OFF:
      return INITIAL_VISUAL_ASSET_STATE;
    default:
      return state;
  }
};

export default visualAssetReducer;
