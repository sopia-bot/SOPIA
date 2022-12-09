/*
 * upload.test.ts
 * Created on Mon May 03 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import {
	SpoonClient,
	ApiSetUsersInfo,
	LoginType,
	User
} from '../src/';
import assert from 'assert';
import { expect } from 'chai';
import fs from 'fs';

const id = process.env['phone'] as string;
const pw = process.env['pw'] as string;
const target = process.env['target'] as string;
const phone = parseInt(id, 10);

describe('📌  Env Check', () => {
	it('id check', () => phone && typeof phone === 'number');
	it('pw check', () => pw && typeof pw === 'string');
});

describe('📌  Upload Api Test', () => {

	let sopia = new SpoonClient('deviceUUID');

	it('Client Init', async () => {
		await sopia.init();
	});

	describe('📌  Login user', () => {
		it('User is not void', async () => {
			await sopia.login(phone, pw, LoginType.PHONE);
			return !!sopia.logonUser;
		});

		it('User id must be number over zero', () => {
			if ( typeof sopia.logonUser.id === 'number' && sopia.logonUser.id > 0 ) {
				return true;
			}
		});

		it('Client has got user token?', () => {
			if ( sopia.Token ) {
				return true;
			}
		});
	});

	describe('📌  Upload', () => {
		it('Profile Image Upload Test', async () => {

			const key = await sopia.profileImgUpload(fs.readFileSync(target));
			const req = await sopia.ApiReq<User, ApiSetUsersInfo.Request>(ApiSetUsersInfo, sopia.logonUser.id, {
				data: {
					profile_key: key,
				},
			});

			const [ user ] = req.res.results;

			assert.equal(user.id, sopia.logonUser.id);

		});
	});

});
