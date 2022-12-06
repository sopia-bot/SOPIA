import {
	SpoonClient,
	SnsType,
	User,
} from '../src/';
import assert from 'assert';
import { expect } from 'chai';

const id = process.env['phone'] as string;
const pw = process.env['pw'] as string;
const phone = parseInt(id, 10);

function makeid(length: number) {
	var result           = [];
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
	}
	return result.join('');
}

describe('📌  Env Check', () => {
	it('id check', () => phone && typeof phone === 'number');
	it('pw check', () => pw && typeof pw === 'string');
});

describe('📌  Web Api Test', () => {
	const targetId = 6111198;
	let sopia = new SpoonClient('deviceUUID');

	it('Client Init', async () => {
		await sopia.init();
	});


	describe('📌  Login user', () => {
		it('User is not void', async () => {
			await sopia.login(phone, pw, SnsType.PHONE);
			return !!sopia.logonUser;
		});

		it('User id must be number over zero', () => {
			if ( typeof sopia.logonUser.id === 'number' && sopia.logonUser.id > 0 ) {
				return true;
			}
		});

		it('Client has got user token?', () => {
			if ( sopia.token ) {
				return true;
			}
		});
	});

	describe('📌 User Api Test', () => {

		it('Get User Info', async () => {
			const req = await sopia.api.users.info(sopia.logonUser);
			const user = req.res.results[0];
			assert.equal(user.id, sopia.logonUser.id);
		});

		describe('🔯  User Follow', () => {

			it('Follow Test Account', async () => {
				const req = await sopia.api.users.follow(targetId);
				const user = req.res.results[0];
				assert.equal(user.id, targetId);
			});

			it('Check Success Follow', async () => {
				const req = await sopia.api.users.followers(targetId);
				const followers = req.res.results;
				const user = followers.find((u: User) => u.id === sopia.logonUser.id) as User;
				assert.equal(user.id, sopia.logonUser.id);
			});

			it('Check Followings', async () => {
				//const req = await sopia.api.users.followings(sopia.logonUser);
				const req = await sopia.logonUser.followings();
				const followings = req.res.results;
				const user = followings.find((u: User) => u.id === targetId) as User;
				assert.equal(user.id, targetId);
			});

		});

		describe('🔯  Tag Exist Check', () => {

			it('Exist Tag Check', async () => {
				const req = await sopia.api.users.username({
					'params': {
						'username': 'test',
					},
				});
				assert.equal(req.res.results[0].is_exist, true);
			});

			it('Not Exist Tag Check', async () => {
				const req = await sopia.api.users.username({
					'params': {
						'username': 'T.' + makeid(6),
					},
				});
				assert.equal(req.res.results[0].is_exist, false);
			});

		});

		describe('🔯  Fan Message Test', () => {

			let msg_parent_id = 0;
			let msg_sub_id = 0;

			it('Write New Fan Message', async () => {
				const req = await sopia.api.users.writeFanmessages(targetId, {
					'data': {
						'contents': 'WriteNewMessage',
					},
				});
				msg_parent_id = req.res.results[0].id;
				assert.equal(req.res.results[0].contents, 'WriteNewMessage');
			});

			it('Modify Fan Message', async () => {
				const req = await sopia.api.fancomments.modify(msg_parent_id, {
					'data': {
						'contents': 'ModifiedMessage',
						'is_parent': true,
					},
				});
				assert.equal(req.res.status_code, 200);
			});

			it('Write Sub Fan Message', async () => {
				const req = await sopia.api.fancomments.writeMessages(msg_parent_id, {
					'data': {
						'contents': 'WriteSubMessage',
					},
				});
				msg_sub_id = req.res.results[0].id;
				assert.equal(req.res.results[0].contents, 'WriteSubMessage');
			});

			it('Modify Sub Fan Message', async () => {
				const req = await sopia.api.fancomments.modifyMessages(msg_parent_id, {
					'data': {
						'contents': 'ModifiedSubMessage',
						'fanmsg_id': msg_sub_id,
						'is_parent': false,
					},
				});
				assert.equal(req.res.status_code, 200);
			});

			it('Get Fan Messages', async () => {
				const req = await sopia.api.users.fanmessages(targetId);
				const msg: any = req.res.results.find(r => r.id === msg_parent_id);
				assert.equal(msg.contents, 'ModifiedMessage');
			});

			it('Get Fan Comment Messages', async () => {
				const req = await sopia.api.fancomments.messages(msg_parent_id);
				const msg: any = req.res.results.find(r => r.id === msg_sub_id);
				assert.equal(msg.contents, 'ModifiedSubMessage');
			});

			it('Remove Fan Comment Message', async () => {
				const req = await sopia.api.fancomments.removeMessages(msg_parent_id, {
					'params': {
						'fanmsg_id': msg_sub_id,
						'is_parent': false,
					},
				});
				assert.equal(req.res.status_code, 200);
			});

			it('Remove Fan Message', async () => {
				const req = await sopia.api.fancomments.remove(msg_parent_id);
				assert.equal(req.res.status_code, 200);
			});

		});

	});

	describe('📌  User UnFollow', async () => {

		it('UnFollow Test Account', async () => {
			const req = await sopia.api.users.unfollow(targetId);
			const user = req.res.results[0];
			assert.equal(user.id, targetId);
		});

		it('Check Success UnFollow', async () => {
			const req = await sopia.api.users.followers(targetId);
			const followers = req.res.results;
			const user = followers.find((u: User) => u.id === sopia.logonUser.id) as User;
			assert.equal(user, null);
		});

		it('Check Followings', async () => {
			const req = await sopia.api.users.followings(sopia.logonUser.id);
			const followings = req.res.results;
			const user = followings.find((u: User) => u.id === targetId) as User;
			assert.equal(user, null);
		});

	});

	describe('📌  User Block & Unblock', () => {

		it('Block Test Account', async () => {
			const req = await sopia.api.users.block(targetId);
			assert.equal(req.res.status_code, 200);
		});

		it('UnBlock Test Accout', async () => {
			const req = await sopia.api.users.unblock(targetId);
			assert.equal(req.res.status_code, 200);
		});

	});

});
