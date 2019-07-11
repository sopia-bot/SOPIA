////////////////////////////////////////////////////////////////
//  파일 : DOMContentLoaded.js                                //
//  작성자 : mobbing                                          //
//  주석 : onload 이벤트 때 동작할 것들.                       //
///////////////////////////////////////////////////////////////


document.addEventListener('DOMContentLoaded', (evt) => {
	
	/*               S: IMPORT               */
	
	/**
	* dashboard를 controls에 import 시킨다.
	* display: block으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#home', (parent, target) => {
		target.setAttribute('data-target', 'home');
	});
	
	/**
	* code를 controls에 import 시킨다.
	* 그와 동시에 monaco editor를 세팅한다.
	* display는 nonde으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#code', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'code');
		require(['vs/editor/editor.main'], () => {
			require.config({
				paths: {
					'vs': getPath('vs')
				}
			})
			window.editor = monaco.editor.create(target.querySelector('#codeDiv'), {
				value: "",
				language: 'javascript',
				theme: 'vs',
				automaticLayout: true
			});
			window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
				if ( window.code.viewPath ) {
					fs.writeFile(window.code.viewPath, window.editor.getValue(), {encoding: 'utf8'}, (err) => {
						if ( err ) {
							throw err;
						}
						window.code.viewCode = window.editor.getValue();
					});
				}
			});
			refreshTree(path.join(window.code.sopiaPath, "main.js"));
		});
	});
	
	
	/**
	* live를 controls에 import 시킨다.
	* display는 nonde으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#live', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'live');
	});
	
	/**
	* setting을 controls에 import 시킨다.
	* display는 nonde으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#setting', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'setting');
		
		
		
		// 설정 값 로딩
		
		//웹서버 설정
		document.querySelector('#wsPort').value = sopia.config.server.port;
		document.querySelector('#wsFrameSize').value = sopia.config.server.maxReceivedFrameSize;
		document.querySelector('#wsMessageSize').value = sopia.config.server.maxReceivedMessageSize;
		
		//SOPIA 설정
		document.querySelector('#autoManagerStart').checked = sopia.config.sopia.autostart;
		document.querySelector('#detectMe').checked = sopia.config.sopia.detectme;
		document.querySelector('#onlymanager').checked = sopia.config.sopia.onlymanager;
		
		//자동 로그인 설정
		document.querySelector('#autoLoginEnable').checked = sopia.config.autologin.enable;
		document.querySelector('#autoLoginId').value = sopia.config.autologin.id;
		document.querySelector('#autoLoginPw').value = sopia.config.autologin.pw;
		document.querySelector(`#altItems>li[data-type="${sopia.config.autologin.type}"]>a`).click();
	});
	
	
	/*               E: IMPORT               */
	
	/*               S: MENU CLICK               */
	document.querySelectorAll('ul.uk-navbar-nav>li').forEach(element => {
		element.addEventListener('click', (evt) => {
			//e.target이 a 태그가 아닐 경우, 그 부모를 탐색하여 a 태그를 찾는다.
			let checkAtag = true;
			let e = {target: evt.target};
			while ( e.target.tagName.toLowerCase() !== "a" ) {
				if ( e.target.parentElement ) {
					if ( e.target.parentElement.tagName.toLowerCase() === "body" ) {
						checkAtag = false;
						break;
					}
					e.target = e.target.parentNode;
				}
			}
			
			if ( checkAtag ) {
				document.querySelectorAll('#controls>div').forEach(import_ => {
					//보일 것은 display: table 로, 아닌 것은 숨긴다.
					if ( import_.getAttribute('data-target') && e.target.innerText &&
					import_.getAttribute('data-target').toLowerCase && e.target.innerText.toLowerCase ) {
						if ( import_.getAttribute('data-target').toLowerCase() === e.target.innerText.toLowerCase() ) {
							if ( import_.getAttribute('data-target').toLowerCase() === "code" ) {
								import_.style.overflow = "hidden";
								document.querySelector('#controls').style.overflow = "hidden";
							} else {
								import_.style.overflow = "auto";
								document.querySelector('#controls').style.overflow = "auto";
							}
							import_.style.display = "table";
						} else {
							import_.style.display = "none";
						}
					}
					
					//active class 설정
					document.querySelectorAll('ul.uk-navbar-nav>li').forEach(li => {
						if ( e.target.innerText === li.innerText ) {
							li.className = "uk-active";
						} else {
							li.className = "";
						}
					});
				});
			}
		});
	});
	/*               E: MENU CLICK               */
});