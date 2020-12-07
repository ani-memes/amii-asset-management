# API

`/public/assets/visuals?changedSince=<epochSecond>`

Payload `VisualMemeAsset[]`
```ts
interface VisualMemeAsset {
  id: string; // MD5 checksum
  path: string;
  alt: string;
  cat: number[]; // assetCategories
  char: string[]; // characters appearing asset
}
```

---

`/public/assets/audible?changedSince=<epochSecond>`

Payload `AudibleMemeAsset[]`
```ts
interface AudibleMemeAsset {
  id: string; // MD5 checksum
  path: string;
  rel: string[]; // ids of related visual assets
}
```

---

`/public/assets/anime?changedSince=<epochSecond>`

Payload `AnimeAsset[]`
```ts
interface AnimeAsset {
  id: string; // UUID
  name: string;
  season: string;
  chars: string[]; // UUID of characters
}
```

---

`/public/assets/characters?changedSince=<epochSecond>`

Payload `CharacterAsset[]`
```ts
interface CharacterAsset {
  id: string; // UUID
  name: string;
  gender: string;
}
```
