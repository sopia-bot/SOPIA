////////////////////////////////////////////////////////////////
//  파일 : preload.js                                         //
//  작성자 : mobbing                                          //
//  주석 : DOM이 로드되기 전 처리할 스크립트                    //
///////////////////////////////////////////////////////////////

const path = require('path');
const fs = require('fs');
const app = require('electron').remote.app;
const { clipboard } = require('electron');
const EventEmitter = require('events');

/**
 * @sopia 의 객체를 생성한다.
 * 기본적으로 EventEmitter을 사용하여 스푼에서 받은 이벤트를 처리한다.
 * sopia.var 에선 sopia.var.save 함수를 사용하지 않는 한, sopia 재시작시 수정된 변수값을 초기화한다.
 */
const sopia = new EventEmitter();
sopia.var = new Object();
sopia.intval = new Object();

/**
 * @function getPath
 * @param {string} path_ 
 * 현재 프로그램이 시작된 경로를 기준으로,
 * @path_ 의 절대 경로를 반환한다.
 */
const getPath = (path_) => {
	return path.join(app.getAppPath(), path_);
};

/**
 * @function readFolder
 * @param {string} path_
 * path_가 폴더라면 하위 폴더에 있는 내용까지 전부 탐색하여,
 * 결과값을 반환한다.
 */
const readFolder = (path_ = app.getAppPath()) => {
	let dir = fs.lstatSync(path_);
	let rtn = {files: [], folders: {}};
	if ( dir && dir.isDirectory() ) {
		let dirInfo = fs.readdirSync(path_);
		dirInfo.forEach(f => {
			let p = path.join(path_,f);
			let d = fs.lstatSync(p);
			if ( d && d.isDirectory() ) {
				rtn.folders[p] = readFolder(p);
			} else {
				rtn.files.push(p);
			}
		});
	}
	return rtn;
};

/**
 * @function copyAtag
 * @param {HTMLElement} element 
 * @param {boolean} skipFlag
 * A Tag의 텍스트를 복사한다.
 * skipFlag가 true면 왼쪽 아래의 메시지를 띄우지 않는다.
 */
const copyAtag = (element, skipFlag = false) => {
	let text = element.innerText;
	if ( text ) {
		clipboard.writeText(text);
		if ( !skipFlag ) {
			UIkit.notification({
				message: '<span uk-icon="icon: check"></span>&nbsp;'+
				'<label class="uk-text-small">복사되었습니다. <span class="uk-text-spoon">' + text + '</span></label>',
				pos: 'bottom-left'
			});
		}
	}
};

/**
 * NavBar의 사이즈를 panel의 크기에 맞게 재정비한다.
 * +++ codeDiv 의 사이즈도 맞춘다.
 */
const refreshNavSize = () => {
	let nav = document.querySelector('nav');
	let panel = document.querySelector('#ContainerPanel>div[name="panel1"]');

	if ( nav && panel ) {
		nav.style.width = panel.offsetWidth+"px";
	}

	let codeDiv = document.querySelector('#codeDiv');
	if ( codeDiv ) {
		codeDiv.style.width = (panel.offsetWidth - 200)+"px";
	}
};

/**
 * appendImport 는 부모가 될 HTMLElement에,
 * @target 으로 넘겨준 선택자 또는 HTMLElement 를 이용하여, import 태그를 찾는다.
 * 찾으면, 해당 태그 안 import-child div 를 부모 노드에 appendChild로 추가한다.
 */
HTMLElement.prototype.appendImport = function(target, query, cb) {
	if ( typeof query === "function" ) {
		cb = query;
	}

	if ( typeof query !== "string" ) {
		query = 'div[name="import-child"]';
	}

	let t = target;
	if ( typeof target === "string" ) {
		t = document.querySelector(target);
	}
	
	let child = null;
	if ( t.import instanceof Document ) {
		child = t.import.querySelector(query);
		if ( child ) {
			//child = child.cloneNode(true);
			this.appendChild(child);
		}
	}

	if ( typeof cb === "function" ) {
		cb(this, child);
	}
};