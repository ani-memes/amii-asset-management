import {LOGGED_OFF} from '../events/SecurityEvents';
import {
  CREATED_ANIME,
  CREATED_CHARACTER,
  RECEIVED_ANIME_LIST,
  RECEIVED_CHARACTER_LIST,
  UPDATED_ANIME,
  UPDATED_CHARACTER
} from "../events/CharacterSourceEvents";
import {StringDictionary, SyncType, UnsyncedAsset} from "../types/SupportTypes";
import {dictionaryReducer} from "../util/FunctionalTools";
import {SYNCED_ASSET} from "../events/ApplicationLifecycleEvents";
import {AnimeAsset, Assets, CharacterAsset} from "../types/AssetTypes";


export interface CharacterSourceState {
  anime: StringDictionary<AnimeAsset>;
  characters: StringDictionary<CharacterAsset>;
  unSyncedCharacters: StringDictionary<UnsyncedAsset<CharacterAsset>>;
  unSyncedAnime: StringDictionary<UnsyncedAsset<AnimeAsset>>;
}

export const INITIAL_SOURCE_STATE: CharacterSourceState = {
  anime: {},
  characters: {},
  unSyncedCharacters: {},
  unSyncedAnime: {},
};

// eslint-disable-next-line
const characterSourceReducer = (state: CharacterSourceState = INITIAL_SOURCE_STATE, action: any) => {
  switch (action.type) {
    case RECEIVED_CHARACTER_LIST:
      return {
        ...state,
        characters: action.payload.reduce(dictionaryReducer, {}),
      };
    case RECEIVED_ANIME_LIST:
      return {
        ...state,
        anime: action.payload.reduce(dictionaryReducer, {}),
      };
    case CREATED_ANIME:
    case UPDATED_ANIME:
      return {
        ...state,
        anime: {
          ...state.anime,
          [action.payload.id]: action.payload
        },
        unSyncedAnime: {
          ...state.unSyncedAnime,
          [action.payload.id]: {
            syncType: SyncType.CREATE,
            asset: action.payload,
          } as UnsyncedAsset<AnimeAsset>
        },
      };

    case CREATED_CHARACTER:
    case UPDATED_CHARACTER:
      return {
        ...state,
        characters: {
          ...state.characters,
          [action.payload.id]: action.payload
        },
        unSyncedCharacters: {
          ...state.unSyncedCharacters,
          [action.payload.id]: {
            syncType: SyncType.CREATE,
            asset: action.payload,
          } as UnsyncedAsset<CharacterAsset>
        },
      };

    case SYNCED_ASSET : {
      switch (action.payload) {
        case Assets.CHARACTERS: {
          return {
            ...state,
            unSyncedCharacters: {},
          }
        }
        case Assets.ANIME: {
          return {
            ...state,
            unSyncedAnime: {},
          }
        }
        default:
          return state;
      }
    }
    case LOGGED_OFF:
      return INITIAL_SOURCE_STATE;
    default:
      return state;
  }
};

export default characterSourceReducer;
