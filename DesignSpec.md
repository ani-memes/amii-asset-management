# API

## Definitions

#### VisualMemeAsset
```ts
interface VisualMemeAsset {
  id: string; // MD5 checksum
  path: string;
  alt: string;
  cat: number[]; // assetCategories
  char: string[]; // characters appearing asset
  aud?: string; // ID of audible asset
}
```
#### AudibleMemeAsset
```ts
interface AudibleMemeAsset {
  id: string; // MD5 checksum
  path: string;
}
```
#### AnimeAsset
```ts
interface AnimeAsset {
  id: string; // UUID
  name: string;
  season: string;
}
```
#### CharacterAsset
```ts
interface CharacterAsset {
  id: string; // UUID
  animeId: string; // UUID
  name: string;
  gender: string;
}
```

---

## Public API

`GET` `/public/assets/visuals?changedSince=<epochSecond>`

Response Payload [VisualMemeAsset[]](#visualmemeasset)

`GET` `/public/assets/audible?changedSince=<epochSecond>`

Response Payload [AudibleMemeAsset[]](#audiblememeasset)

`GET` `/public/assets/anime?changedSince=<epochSecond>`

Response Payload [AnimeAsset[]](#animeasset)

`GET` `/public/assets/characters?changedSince=<epochSecond>`

Response Payload [CharacterAsset[]](#characterasset)

---

## Admin API

`GET` `/assets/visuals/{id}`

Response Payload [VisualMemeAsset](#visualmemeasset)


`POST` `/assets/visuals`

Response Payload [VisualMemeAsset[]](#visualmemeasset)


`POST` `/assets/audible`

Request Payload [AudibleMemeAsset[]](#audiblememeasset)


`GET` `/assets/anime`

Response Payload [AnimeAsset[]](#animeasset)

`POST` `/assets/anime`

Request Payload [AnimeAsset[]](#animeasset)


`GET` `/assets/characters`

Response Payload [CharacterAsset[]](#characterasset)


`POST` `/assets/characters`

Request Payload [CharacterAsset[]](#characterasset)

---
