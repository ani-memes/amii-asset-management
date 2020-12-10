import {MemeAssetCategory} from "../reducers/VisualAssetReducer";

export enum AssetGroupKeys {
  VISUAL = 'visuals',
  AUDIBLE = 'audible',
  TEXT = 'text',
  WAIFU = 'waifu',
  ANIME = 'anime',
}

export enum Assets {
  ANIME = 'ANIME',
  WAIFU = 'WAIFU',
  VISUAL = 'VISUAL',
  TEXT = 'TEXT',
  AUDIBLE = 'AUDIBLE'
}

export interface AssetDefinition {
  id: string; // MD5 checksum
  path: string;
}

export interface LocalAsset {
  file?: File;
}

export interface VisualMemeAsset extends AssetDefinition {
  alt: string;
  cat: MemeAssetCategory[]; // assetCategories
  char: string[]; // characters appearing asset
  aud?: string; // ID of audible asset
}

export interface AudibleMemeAsset {
  id: string; // MD5 checksum
  path: string;
}

export interface AnimeAsset {
  id: string; // UUID
  name: string;
}


export enum Gender {
  FEMALE,
  MALE,
  YES,
  APACHE_ATTACK_HELICOPTER,
}
export interface CharacterAsset {
  id: string; // UUID
  animeId: string; // UUID
  name: string;
  gender: Gender;
}
