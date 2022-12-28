import Axios from "axios";
import { app, ipcMain } from "electron";
import { createWriteStream } from "node:fs";
import path from "node:path";

export const setBundleDir = () => app.setPath('userData', path.join(app.getPath('appData'), 'sopia-v3'));

export function parseVersion(ver: string) {
  if ( typeof ver !== "string" ) return false;
  
  const sVer = ver.split('.');
  if ( sVer.length === 3 ) {
    return {
      app:   parseInt(sVer[0], 10),
      major: parseInt(sVer[1], 10),
      minor: parseInt(sVer[2], 10),
    };
  }
  return false;
};

/** 
* @function versionCompaire
* @param {String} ver1
* @param {String} ver2
* @returns -1: ver1 < ver2 0: ver1 = ver2 1: ver1 > ver2
*/
export function versionCompare(ver1: string, ver2: string) {
  const v1 = parseVersion(ver1);
  const v2 = parseVersion(ver2);
  
  if ( v1 === false || v2 === false ) return;
  
  if ( v1.app === v2.app ) {
    if ( v1.major === v2.major ) {
      if ( v1.minor === v2.minor ) {
        return 0;
      } else {
        return (v1.minor < v2.minor ? -1 : 1);
      }
    } else {
      return (v1.major < v2.major ? -1 : 1);
    }
  } else {
    return (v1.app < v2.app ? -1 : 1);
  }
};

export const isDevelopment = process.env.NODE_ENV !== 'production';

export async function downloadFile(fileUrl: string, outputLocationPath: string) {
  const writer = createWriteStream(outputLocationPath);
  
  return Axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    
    //ensure that the user can call `then()` only when the file has
    //been downloaded entirely.
    
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = false;
      writer.on('error', err => {
        error = true;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
      });
    });
  });
}