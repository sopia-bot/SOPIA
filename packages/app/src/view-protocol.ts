import { app, protocol } from 'electron';
import { uncompress } from '@sopia-bot/archive';
import axios, { AxiosRequestConfig } from 'axios';
import path from 'path';
import { existsSync } from 'fs';
import { versionCompare, setBundleDir, downloadFile } from './utils';
import CfgLite from 'cfg-lite';
import mime from 'mime-types';
import { readFile } from 'fs/promises';
import qs from 'querystring';
setBundleDir();

const viewTarget = path.join(app.getPath('userData'), 'sopia.view');
const appTarget = path.join(app.getPath('userData'), 'app.cfg');
const S3VIEW_PREFIX = `https://sopia-v3.s3.ap-northeast-2.amazonaws.com/views`;

async function s3get(url: string, data: AxiosRequestConfig = {}) {
  return axios.get(`${S3VIEW_PREFIX}/${url.replace(/^\//, '')}`, data);
}

async function checkNeedUpdate(): Promise<boolean> {
  if ( !existsSync(viewTarget) ) {
    return true;
  }
  
  const cfg = new CfgLite(appTarget);
  const currentVersion = cfg.get('view-version');
  const { data:latest } = await s3get('latest.json');
  const compare = versionCompare(currentVersion, latest.version);
  console.log('cur', currentVersion, 'latest', latest.version, 'compare', compare);
  if ( compare === undefined || compare === -1 ) {
    return true;
  }
  return false;
}

async function viewUpdate() {
  const { data:latest } = await s3get('latest.json');
  await downloadFile(`${S3VIEW_PREFIX}/sopia-view-${latest.version}.zip`, viewTarget);
  const cfg = new CfgLite(appTarget);
  cfg.set('view-version', latest.version);
  cfg.save();
}

export async function registerProtocol() {
  if ( await checkNeedUpdate() ) {
    await viewUpdate();
  }
  
  console.log('view target', viewTarget);
  const buffer = await readFile(viewTarget);
  return protocol.registerBufferProtocol('sopia', async (request, callback) => {
    const url = path.join(
      qs.unescape(request.url) // decoding URL cjk language
      .replace(/^sopia:\/\//, '') // remove protocol prefix
      .replace(/[#?].*$/, '') // remove hash router path
    )
    .replace(/\\/g, '/'); // windows path slashes is '\' but uncompress function are only receive '/'
    const entry = await uncompress(buffer, url);
    if ( entry ) {
      const mimeType = mime.lookup(path.extname(url)) || 'text/plain';
      const data = entry;
      callback({
        mimeType,
        data,
      });
    } else {
      console.log('404???', url);
      callback({});
    }
  });
}