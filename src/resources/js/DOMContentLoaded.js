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
	* display는 none으로 둔다.
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
						try {
							file2JSON(window.code.viewPath);
							if ( noti ) {
								noti.success('파일 저장에 성공했습니다.', path.basename(window.code.viewPath));
							}
						} catch(err) {
							const modal = document.querySelector('#code-modal');
							if ( modal ) {
								document.querySelector('#message').innerText = err.toString();
								UIkit.modal(modal).show();
							}
						}
					});
				}
			});
			refreshTree(path.join(window.code.sopiaPath, "main.js"));
		});
	});
	
	/**
	 * spoorchat을 controls에 import 시킨다.
	 * display는 nonde으로 둔다.
	 */
	document.querySelector('#controls').appendImport('#spoorchat', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'spoorchat');


		// 설정값 로딩

		document.querySelector('#enableSpoorChat').checked = sopia.config.spoor.enable;
		document.querySelector('#minimumSpoon').value = sopia.config.spoor.minspoon;
		document.querySelector(`#voiceTypeItem>li[data-type="${sopia.config.spoor.type}"]`).click();
		document.querySelector('#effectVolume').value = sopia.config.spoor.effectvolume;
		document.querySelector('#ttsVolume').value = sopia.config.spoor.ttsvolume;
		document.querySelector('#toutSpoor').value = sopia.config.spoor.toutspoor;

		// button event setting
		document.getElementsByName('toggle-body').forEach((element) => {
			element.addEventListener('click', (evt) => {
				let aButton = evt.target;
				if ( aButton.tagName.toLowerCase() !== "a" ) {
					aButton = aButton.parentElement;
				}
				if ( aButton.tagName.toLowerCase() !== "a" ) {
					aButton = aButton.parentElement;
				}
				const targetBody = document.querySelector(aButton.dataset.target);
				const visible = aButton.dataset.view;

				console.log(targetBody, visible, evt, aButton.dataset);
				if ( targetBody ) {
					if ( visible === "true" ) {
						// hide body
						aButton.setAttribute('uk-icon', 'icon: triangle-left; ratio: 1.5');
						aButton.dataset.view = "false";
						targetBody.className = "uk-card-body uk-animation-slide-bottom-small";
						targetBody.style.display = "none";
					} else {
						// show body
						aButton.setAttribute('uk-icon', 'icon: triangle-down; ratio: 1.5');
						aButton.dataset.view = "true";
						targetBody.className = "uk-card-body uk-animation-slide-top-small";
						targetBody.style.display = "block";
					}
				}
			});
		});

		const sigKeys = Object.keys(sopia.config.spoor.signature);
		sigKeys.forEach(k => {
			appendSignature(k, sopia.config.spoor.signature[k]);
		});

	});

	/**
	* setting을 controls에 import 시킨다.
	* display는 nonde으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#setting', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'setting');
		
		
		
		// 설정 값 로딩
		
		//SOPIA 설정
		document.querySelector('#autoManagerStart').checked = sopia.config.sopia.autostart;
		document.querySelector('#onlymanager').checked = sopia.config.sopia.onlymanager;
		
		//자동 로그인 설정
		document.querySelector('#autoLoginEnable').checked = sopia.config.autologin.enable;
		document.querySelector('#autoLoginId').value = sopia.config.autologin.id;
		document.querySelector('#autoLoginPw').value = sopia.config.autologin.passwd;
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

	document.querySelector('#home-tab').click();1
});
