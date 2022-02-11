/*
 * utils.js
 * Created on Fri Feb 11 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */

exports.charWrapper =
	(str) => str.toString()
		.replace(/\\/g, '')
		.replace(/\./g, '')
		.replace(/\+/g, '+')
		.replace(/\n/g, ' ')
		.replace(/\ /, '');
