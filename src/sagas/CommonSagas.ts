import {API, Auth, Storage} from "aws-amplify";
import {AssetDefinition, AssetGroupKeys, Assets, LocalAsset} from "../types/AssetTypes";
import {MotivationAssetState} from "../reducers/MotivationAssetReducer";
import {call, put, select} from "redux-saga/effects";
import {selectMotivationAssetState} from "../reducers";
import {StringDictionary, SyncType, UnsyncedAsset} from "../types/SupportTypes";
import {values} from "lodash";
import {readFile} from "../components/Upload";
import md5 from "js-md5";
import {completedSyncAttempt, startedSyncAttempt} from "../events/ApplicationLifecycleEvents";
import {AWSConfig} from "../config/AwsConfig";
// import axios from "axios";
// import AWS from 'aws-sdk';

API.configure(AWSConfig);

// eslint-disable-next-line
export function* syncSaga(asset: Assets, sagaToRun: () => void) {
  const {unsyncedAssets}: MotivationAssetState = yield select(selectMotivationAssetState);
  if (unsyncedAssets[asset]) {
    yield put(startedSyncAttempt(asset));
    try {
      yield call(sagaToRun);
    } catch (e) {
    }
    yield put(completedSyncAttempt(asset));
  }
}

export enum ContentType {
  JSON = "application/json",
  TEXT = "text/plain",
}

// const s3Client = new AWS.S3({
//   credentials: {
//     accessKeyId: 'ayy',
//     secretAccessKey: 'lmao',
//   },
//   region: 'us-east-1',
//   endpoint: `http://localhost:4566`,
//   s3ForcePathStyle: true,
// });
const assetUpload = <T>(assetKey: string, asset: T, type: ContentType | string): Promise<any> =>
  // new Promise<any>((res, rej) =>
  //   s3Client.upload({
  //     Bucket: 'demo-bucket',
  //     Key: assetKey,
  //     Body: asset,
  //     ACL: 'public-read',
  //     ContentType: type
  //   }, (err, resp) => {
  //     console.log(resp)
  //     err ? rej(err) : res(resp);
  //   })
  // )
  Storage.put(assetKey, asset, {
    contentType: type,
    level: 'public',
  });

/**
 * Good for uploading a single asset (such as list metadata)
 * @param assetGroup
 * @param assetKey
 * @param asset
 * @param type
 */
export function* uploadAssetSaga(assetGroup: AssetGroupKeys,
                                 assetKey: string,
                                 asset: string,
                                 type: ContentType): Generator {
  yield call(() =>
    uploadChecksum(assetGroup, assetKey, asset)
  );
  yield call(() =>
    assetUpload(`${assetGroup}/${assetKey}`, asset, type) // todo: consolidate string literals
  );
}

export function extractAddedAssets<T>(unSyncedAnime: StringDictionary<UnsyncedAsset<T>>): T[] {
  return values(unSyncedAnime)
    .filter(unsyncedAsset => unsyncedAsset.syncType === SyncType.CREATE)
    .map(unsyncedAsset => unsyncedAsset.asset);
}

function uploadChecksum(assetGroupKey: string, path: string, result: ArrayBuffer | string) {
  return assetUpload(
    `${assetGroupKey}/${path}.checksum.txt`,
    md5(result),
    ContentType.TEXT
  );
}

export function* uploadAssetsSaga<T extends (AssetDefinition & LocalAsset)>(
  assetGroupKey: string,
  assetsToUpload: T[]
): Generator {
  yield call(() => assetsToUpload
    .filter(assetToUpload => !!assetToUpload.file)
    .reduce((accum, assetToUpload) => {
      return accum.then(() => readFile(assetToUpload.file!))
        .then(({result}) =>
          uploadChecksum(assetGroupKey, assetToUpload.path, result)
        );
    }, Promise.resolve()))

  yield call(() =>
    assetsToUpload
      .filter(asset => !!asset.file)
      .reduce(
        (accum, assetToUpload) => {
          return accum.then(() =>
            assetUpload(
              `${assetGroupKey}/${assetToUpload.path}`,
              assetToUpload.file,
              assetToUpload.file?.type || ''
            ));
        },
        Promise.resolve()
      )
  );
}


export const apiGet = <T>(path: string): Promise<T> =>
  Auth.currentSession()
    .then(res => res.getIdToken().getJwtToken())
    .then(token => API.get('amiiassetadmiiapi', path, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    )
    // .catch(()=>API.get('amiiassetapipublic', `/public${path}`, {}))
    .then((res: any) => res.data)
// axios.get(`http://localhost:4000${path}`)
//   .then(res => res.data)

export const apiPost = <T>(path: string, payload: T): Promise<void> =>
  API.post('amiiassetadmiiapi', path, {
    body: payload
  })
    .then((res: any) => res.data)

// axios.post(`http://localhost:4000${path}`, payload)
