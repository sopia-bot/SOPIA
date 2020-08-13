/*
 * index.js
 * Created on Thu Aug 13 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

exports.preload = () => {
	console.log('preload');
};

exports.loading = () => {
	console.log('loading');
};

exports.complete = () => {
	console.log('complete');
};
