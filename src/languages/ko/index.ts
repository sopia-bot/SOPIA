/*
 * index.ts
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
 */
import app from './app/';
import home from './home/';
import code from './code/';
import lives from './lives/';
import users from './users/';
import cmd from './cmd/';
import bundle from './bundle/';

export default {
	app,
	home,
	code,
	lives,
	users,
	cmd,
	bundle,
	// common
	'msg': {
		alert: '알림',
	},
	'send': '전송',
	'spoon': '스푼',
	'confirm': '확인',
	'cancel': '취소',
	'enable': '사용',
	'apply': '적용',
	'add': '추가',
	'save-success': '저장에 성공했습니다.',
	'login': '로그인',
	'error': '오류',
	'errors': {
		'file-not-found': '$0 파일을 찾을 수 없습니다.',
	},
	'install': '설치',
	'uninstall': '제거',
	'yes': '예',
	'no': '아니오',
};
