/*
 * index.ts
 * Created on Fri Nov 27 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

export default {
	'join-desc': '청취자가 입장했을 때 반응할 문장을 설정합니다.<br>공란일 경우, 반응하지 않습니다.<br>',
	'join-ex': '예약어 목록<br>닉네임: <span class="indigo--text text--darken-3">[[name]]</span><br>태그: <span class="indigo--text text--darken-3">[[tag]]</span><br><br> Ex)<span class="indigo--text text--darken-3"> [[name]]([[tag]])님 안녕하세요.</span>',
	'like-desc': '청취자가 방송에 좋아요를 눌렀을 때 반응할 문장을 설정합니다.<br>공란일 경우, 반응하지 않습니다.<br>',
	'like-ex': '예약어 목록<br>닉네임: <span class="indigo--text text--darken-3">[[name]]</span><br>태그: <span class="indigo--text text--darken-3">[[tag]]</span><br><br>Ex)<span class="indigo--text text--darken-3"> [[name]]([[tag]]) 님 좋아요 감사합니다.</span>',
	'present-desc': '청취자가 방송에 스푼을 선물했을 때 반응을 설정합니다.<br>스티커 버튼을 클릭하면 반응할 스푼을 설정할 수 있습니다.<br>공란일 경우, 반응하지 않습니다.<br>',
	'present-ex': '예약어 목록<br>닉네임: <span class="indigo--text text--darken-3">[[name]]</span><br>태그: <span class="indigo--text text--darken-3">[[tag]]</span><br>스푼 콤보: <span class="indigo--text text--darken-3">[[combo]]</span><br>1콤보당 스푼 개수: <span class="indigo--text text--darken-3">[[amount]]</span><br>총 스푼 개수: <span class="indigo--text text--darken-3">[[count]]</span><br>스푼 이름: <span class="indigo--text text--darken-3">[[sticker]]</span><br><br>Ex)<span class="indigo--text text--darken-3"> [[name]]([[tag]]) 님 [[sticker]] [[count]] 개 감사합니다.</span>',
	'message-desc': '특정 명령어를 설정합니다.<br>공란일 경우, 반응하지 않습니다.<br>권한을 관리자로 선택하면 매니저 이상만 명령어를 인식합니다.<br>',
	'message-ex': '예약어 목록<br>닉네임: <span class="indigo--text text--darken-3">[[name]]</span><br>태그: <span class="indigo--text text--darken-3">[[tag]]</span><br>',
	'sticker': {
		'list': '스티커 목록',
		'exists': '이미 존재하는 스티커입니다.',
	},
	'command': '명령어',
	'reply': '응답',
	'permit': {
		'all': '전체',
		'manager': '관리자',
	},
};
