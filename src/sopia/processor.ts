/*
 * processor.ts
 * Created on Wed Oct 14 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import { SpoonSocketEvent } from 'sopia-core';
import logger from '@/plugins/logger';
import Script from './script';

const fs = window.require('fs');
const path = window.require('path');
const { remote } = window.require('electron');
const { app } = remote;

const $path = (type: any, ...args: any) => {
	return path.resolve(app.getPath(type), ...args);
};

Script.add($path('userData', 'sopia/'));
const bundlePath = $path('userData', 'bundles');
const bundles = fs.readdirSync(bundlePath);
for ( const bundle of bundles ) {
	Script.add(path.join(bundlePath, bundle));
}

const processor = async (evt: SpoonSocketEvent) => {
	logger.debug('sopia', `receive event [${evt.event}]`, evt);

	Script.run(evt);
};

export default processor;
