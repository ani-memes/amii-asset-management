import {PayloadEvent} from './Event';
import {Anime} from "../reducers/VisualAssetReducer";
import {CharacterAsset} from "../types/AssetTypes";

export const RECEIVED_WAIFU_LIST = 'RECEIVED_WAIFU_LIST';
export const RECEIVED_ANIME_LIST = 'RECEIVED_ANIME_LIST';
export const CREATED_ANIME = 'CREATED_ANIME';
export const CREATED_WAIFU = 'CREATED_WAIFU';
export const UPDATED_WAIFU = 'UPDATED_WAIFU';
export const UPDATED_ANIME = 'UPDATED_ANIME';

export const createReceivedCharacterList = (
  characters: CharacterAsset[],
): PayloadEvent<CharacterAsset[]> => ({
  type: RECEIVED_WAIFU_LIST,
  payload: characters,
});

export const createReceivedAnimeList = (
  anime: Anime[],
): PayloadEvent<Anime[]> => ({
  type: RECEIVED_ANIME_LIST,
  payload: anime,
});

export const createdAnime = (
  anime: Anime,
): PayloadEvent<Anime> => ({
  type: CREATED_ANIME,
  payload: anime,
});

export const createdCharacter = (
  character: CharacterAsset,
): PayloadEvent<CharacterAsset> => ({
  type: CREATED_WAIFU,
  payload: character,
});

export const updatedCharacter = (
  character: CharacterAsset,
): PayloadEvent<CharacterAsset> => ({
  type: UPDATED_WAIFU,
  payload: character,
});

export const updatedAnime = (
  anime: Anime,
): PayloadEvent<Anime> => ({
  type: UPDATED_ANIME,
  payload: anime,
});

