import {PayloadEvent} from './Event';
import {AnimeAsset, CharacterAsset} from "../types/AssetTypes";

export const RECEIVED_CHARACTER_LIST = 'RECEIVED_CHARACTER_LIST';
export const RECEIVED_ANIME_LIST = 'RECEIVED_ANIME_LIST';
export const CREATED_ANIME = 'CREATED_ANIME';
export const CREATED_CHARACTER = 'CREATED_CHARACTER';
export const UPDATED_CHARACTER = 'UPDATED_CHARACTER';
export const UPDATED_ANIME = 'UPDATED_ANIME';

export const createReceivedCharacterList = (
  characters: CharacterAsset[],
): PayloadEvent<CharacterAsset[]> => ({
  type: RECEIVED_CHARACTER_LIST,
  payload: characters,
});

export const createReceivedAnimeList = (
  anime: AnimeAsset[],
): PayloadEvent<AnimeAsset[]> => ({
  type: RECEIVED_ANIME_LIST,
  payload: anime,
});

export const createdAnime = (
  anime: AnimeAsset,
): PayloadEvent<AnimeAsset> => ({
  type: CREATED_ANIME,
  payload: anime,
});

export const createdCharacter = (
  character: CharacterAsset,
): PayloadEvent<CharacterAsset> => ({
  type: CREATED_CHARACTER,
  payload: character,
});

export const updatedCharacter = (
  character: CharacterAsset,
): PayloadEvent<CharacterAsset> => ({
  type: UPDATED_CHARACTER,
  payload: character,
});

export const updatedAnime = (
  anime: AnimeAsset,
): PayloadEvent<AnimeAsset> => ({
  type: UPDATED_ANIME,
  payload: anime,
});

