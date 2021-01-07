import {LOGGED_OFF} from '../events/SecurityEvents';
import {Assets, LocalAsset, VisualMemeAsset} from "../types/AssetTypes";
import {
  CREATED_VISUAL_ASSET,
  FILTERED_VISUAL_ASSETS,
  RECEIVED_VISUAL_ASSET_LIST,
  RECEIVED_VISUAL_MEME_LIST,
  UPDATED_VISUAL_ASSET_LIST,
} from "../events/VisualAssetEvents";
import {StringDictionary, SyncType, UnsyncedAsset} from "../types/SupportTypes";
import {SYNCED_ASSET} from "../events/ApplicationLifecycleEvents";

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
  MOCKING = 11,
  SHOCKED = 12,
  DISAPPOINTMENT = 13,
  ALERT = 14,
  BORED = 15,
  TIRED = 16,
  PATIENTLY_WAITING = 17,
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
    case SYNCED_ASSET: {
      if (action.payload === Assets.VISUAL) {
        return {
          ...state,
          unsyncedAssets: {},
        }
      } else {
        return state
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
