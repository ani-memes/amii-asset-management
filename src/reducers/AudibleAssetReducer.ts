import {LOGGED_OFF} from '../events/SecurityEvents';
import {Assets, AudibleMemeAsset, LocalAsset} from "../types/AssetTypes";
import {CREATED_AUDIBLE_ASSET, RECEIVED_AUDIBLE_ASSET_LIST} from "../events/AudibleAssetEvents";
import {StringDictionary, SyncType, UnsyncedAsset} from "../types/SupportTypes";
import {SYNCED_ASSET} from "../events/ApplicationLifecycleEvents";

export type AudibleAssetDefinition = AudibleMemeAsset

export interface LocalAudibleAssetDefinition extends AudibleAssetDefinition, LocalAsset {
}

export type AudibleAssetState = {
  assets: AudibleAssetDefinition[];
  unsyncedAssets: StringDictionary<UnsyncedAsset<LocalAudibleAssetDefinition>>
};

export const INITIAL_AUDIBLE_ASSET_STATE: AudibleAssetState = {
  assets: [],
  unsyncedAssets: {}
};

// eslint-disable-next-line
const audibleAssetReducer = (state: AudibleAssetState = INITIAL_AUDIBLE_ASSET_STATE, action: any) => {
  switch (action.type) {
    case RECEIVED_AUDIBLE_ASSET_LIST:
      return {
        ...state,
        assets: action.payload,
      };

    case SYNCED_ASSET: {
      if(action.payload === Assets.AUDIBLE) {
        return {
          ...state,
          unsyncedAssets: {},
        }
      } else {
        return state
      }
    }

    case CREATED_AUDIBLE_ASSET: {
      return {
        ...state,
        assets: [
          ...state.assets,
          action.payload,
        ],
        unsyncedAssets: {
          ...state.unsyncedAssets,

          // todo: what about duplicate file names?
          [action.payload.path]: {
            syncType: SyncType.CREATE,
            asset: action.payload,
          } as UnsyncedAsset<LocalAudibleAssetDefinition>
        }
      };
    }
    case LOGGED_OFF:
      return INITIAL_AUDIBLE_ASSET_STATE;
    default:
      return state;
  }
};

export default audibleAssetReducer;
