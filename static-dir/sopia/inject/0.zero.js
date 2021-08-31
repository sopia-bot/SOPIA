/*
 * 0.zero.js
 * Created on Thu Aug 13 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

exports.preload = () => {
	console.log(__filename, 'preload');
};

exports.loading = () => {
	console.log(__filename, 'loading');
};

exports.complete = () => {
	console.log(__filename, 'complete');
};
