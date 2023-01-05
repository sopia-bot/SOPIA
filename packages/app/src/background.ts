/*
* background.ts
* Created on Sat Jul 18 2020
*
* Copyright (c) TreeSome. Licensed under the MIT License.
*/
'use strict';

import { app, session, BrowserWindow, nativeTheme } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import path from 'node:path';
import { registerProtocol } from './view-protocol';
import './init';

import { USER_AGENT } from './ipc-handler';
import { ipcHanger } from './utils/ipcHanger';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { IpcTransporter } from './utils/ipc-transporter';
import { AppModule } from './app.module';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// https://pratikpc.medium.com/bypassing-cors-with-electron-ab7eaf331605
function UpsertKeyValue(obj: Record<string, string|string[]>|undefined, keyToChange: string, value: string[]) {
  const keyToChangeLower = keyToChange.toLowerCase();
  if ( !obj ) {
    return;
  }
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      // Done
      return;
    }
  }
  // Insert at end instead
  obj[keyToChange] = value;
}

const createWindow = async () => {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new IpcTransporter(),
    },
  );
  await app.listen();


  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: true,
      //contextIsolation: false,
      webviewTag: true,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  //nativeTheme.themeSource = 'dark';
  
  ipcHanger.on('app:minimize', () => {
    win?.minimize();
  });
  
  ipcHanger.on('app:maximize', () => {
    win?.maximize();
  });

  ipcHanger.on('app:toggleMaximize', () => {
    if ( win?.isMaximized() ) {
      win?.unmaximize();
    } else {
      win?.maximize();
    }
  });
  
  ipcHanger.on('open-dev-tools', () => {
    win?.webContents.openDevTools();
  });
  
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      const { url, resourceType, requestHeaders } = details;
      if ( !!url.match(/^wss:\/\/.{2}-ssm.spooncast.net\//) ) {
      requestHeaders['Origin'] = 'https://www.spooncast.net';
    } else if ( !!url.match(/googlevideo\.com\/videoplayback/) ) {
      requestHeaders['Origin'] = 'https://www.youtube.com';
    }
    UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*']);
    callback({
      requestHeaders,
    });
  },
  );
  
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const { url, responseHeaders } = details;
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
    UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
    if ( !!url.match(/googlevideo\.com\/videoplayback/) ) {
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['https://www.youtube.com']);
    }
    callback({
      responseHeaders,
    });
  });
  
  session.defaultSession.cookies.set({
    url: 'https://youtube.com',
    name: 'VISITOR_INFO1_LIVE',
    value: 'jVdvrRqAjLg',
  });
  
  
  if (process.env.NODE_ENV === 'development') {
    // Load the url of the dev server if in development mode
    win.loadURL('http://localhost:9912');
    win.webContents.openDevTools();	
  } else {
    registerProtocol()
    .then(() => {
      if ( win ) {
        win.loadURL('sopia://./index.html');
      }
    });
  }
  
  win.on('closed', () => {
    win = null;
  });
  
  if ( process.env.NODE_ENV === 'deveopment' ) {
    win.once('ready-to-show', () => {
      win?.show();
    });
  } else {
  }
};

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

app.userAgentFallback = USER_AGENT;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Accept-Encoding'] = 'gzip, deflate, br';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  session.defaultSession.setUserAgent(USER_AGENT);
  
  if (process.env.NODE_ENV === 'development' && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(REACT_DEVELOPER_TOOLS);
    } catch (e: any) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});


// Exit cleanly on request from parent process in development mode.
if (process.env.NODE_ENV === 'development') {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
