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
			window.editor.addCommand(monaco.KeyCode.F5, () => {
				if ( sopia.isLoading === true ) {
					loadScript(() => {
						noti.success('리로딩', '코드가 적용되었습니다.');
					});
				} else {
					noti.success('리로딩', '방송에 입장하면 저장된 코드가 적용됩니다.')
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
	* display는 none으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#setting', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'setting');
		
		
		
		// 설정 값 로딩
		
		//SOPIA 설정
		document.querySelector('#autoManagerStart').checked = sopia.config.sopia.autostart;
		document.querySelector('#onlymanager').checked = sopia.config.sopia.onlymanager;
		document.querySelector('#default-url').value = sopia.config.sopia['default-url'];

		const webview = window.webview || document.querySelector('#webview');
		webview.src = sopia.config.sopia['default-url'];
		
		//자동 로그인 설정
		document.querySelector('#autoLoginEnable').checked = sopia.config.autologin.enable;
		document.querySelector('#autoLoginId').value = sopia.config.autologin.id;
		document.querySelector('#autoLoginPw').value = sopia.config.autologin.passwd;
		document.querySelector(`#altItems>li[data-type="${sopia.config.autologin.type}"]>a`).click();
	});

	/**
	* bundle을 controls에 import 시킨다.
	* display는 none으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#bundle', (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'bundle');
		
		const apeendCardItem = (name, bundle, isUsing) => {
			if ( !bundle ) return;

			const parentItem = document.createElement('div');
			parentItem.className = "uk-margin-small-bottom";

			const item = document.createElement('div');
			item.className = "uk-card uk-card-default uk-card-hover spoor-card";

			const body = document.createElement('div');
			body.className = "uk-card-body";
			body.style = "min-height: 150px";

			const permission = document.createElement('div');

			if ( bundle.permission === "all" ) {
				permission.className = "uk-card-badge uk-label uk-label-spoon";
				permission.innerText = "청취자";
			} else if ( bundle.permission === "manager" ) {
				permission.className = "uk-card-badge uk-label uk-label-danger";
				permission.innerText = "매니저";
			} else if ( bundle.permission === "admin" ) {
				permission.className = "uk-card-badge uk-label uk-label-black";
				permission.innerText = "관리자";
			}
			
			
			const title = document.createElement('h3');
			title.className = "uk-card-title";
			title.innerText = bundle.cmd;

			const desc = document.createElement('p');
			desc.innerText = bundle.desc;

			const footer = document.createElement('div');
			footer.className = "uk-card-footer uk-text-right";
			footer.style = "padding-right: 27px";

			const maker = document.createElement('span');
			maker.className = "uk-margin-small-right";
			maker.innerText = bundle.maker;

			const useButton = document.createElement('button');

			const uninstall = (evt) => {
				if ( bundle.href ) {
					if ( fs.existsSync(getPath(`sopia/bundles/${name}.js`)) ) {
						fs.unlinkSync(getPath(`sopia/bundles/${name}.js`));
					}
					useButton.className = "uk-button uk-button-small uk-button-primary";
					useButton.innerText = "사용";
					useButton.removeEventListener('click', uninstall);
					useButton.addEventListener('click', install);

					delete sopia.config.bundle[name];
					AllSettingSave(sopia.config, () => {
						noti.success(name, "번들 삭제.");
						if ( sopia.isLoading ) {
							loadScript();
						}
					});
				}
			};

			const install = (evt) => {
				if ( bundle.reqVer ) {
					if ( verCompaire(sopia.config.version, bundle.reqVer) < 0 ) {
						let msg = '버전 정보가 맞지 않습니다.\n';
						msg += `프로그램을 업데이트 해주시기 바랍니다.\n\n`;
						msg += `현재 버전: ${sopia.config.version}\n`;
						msg += `요구 버전: ${bundle.reqVer}`;
						alertModal('알림', msg);
						return;
					}
				}

				if ( bundle.href ) {
					axios({
						url: bundle.href,
						method: 'get'
					}).then(res => {
						const data = res.data;
						const bundlePath = `sopia/bundles/${name}.js`;
						const target = getPath(bundlePath);
						sopia.debug(target, data);
						if ( !fs.existsSync(path.dirname(target)) ) {
							sopia.debug("no exist target");
							fs.mkdirSync(path.dirname(target));
						}
						fs.writeFileSync(target, data, {encoding: 'utf8'});
						useButton.innerText = "삭제";
						useButton.className = "uk-button uk-button-small uk-button-danger uk-button";
						useButton.removeEventListener('click', install);
						useButton.addEventListener('click', uninstall);

						if ( typeof sopia.config.bundle !== "object" ) {
							sopia.config.bundle = {};
						}

						sopia.config.bundle[name] = bundlePath;
						AllSettingSave(sopia.config, () => {
							noti.success(name, "번들 추가.");
							if ( sopia.isLoading ) {
								loadScript();
							}
						});
					});


					// download dependency
					if ( bundle.dep ) {
						const deps = bundle.dep[process.arch];
						if ( Array.isArray(deps) ) {
							deps.forEach((d) => {
								const depPath = `sopia/bundles/${d.name}`;
								const target = getPath(depPath);
									
								sopia.debug(target);
								if ( !fs.existsSync(path.dirname(target)) ) {
									sopia.debug("no exist target");
									fs.mkdirSync(path.dirname(target));
								}

								const file = fs.createWriteStream(target);
								https.get(d.href, (res) => {
									res.pipe(file);
								});
							});
						}
					}
				} else {
					noti.error('다운로드 정보가 없습니다.');
				}
			};
			if ( isUsing ) {
				useButton.className = "uk-button uk-button-small uk-button-danger uk-button";
				useButton.innerText = "삭제";
				useButton.addEventListener('click', uninstall);
			} else {
				useButton.className = "uk-button uk-button-small uk-button-primary";
				useButton.innerText = "사용";
				useButton.addEventListener('click', install);
			}

			body.appendChild(permission);
			body.appendChild(title);
			body.appendChild(desc);

			footer.appendChild(maker);
			footer.appendChild(useButton);

			item.appendChild(body);
			item.appendChild(footer);
			parentItem.appendChild(item);

			document.querySelector('#bundleList').appendChild(parentItem);
		};
		
		// 번들 리스트 로딩

		const bundleURL = sopia.config['api-url'] + '/bundle.json';
		axios({
			url: bundleURL,
			method: 'get',
		}).then((res) => {
			const data = res.data;
			const keys = Object.keys(data);
			keys.forEach(k => {
				const bundle = data[k];
				const isUsing = sopia.config.bundle[k] ? true : false;
				apeendCardItem(k, bundle, isUsing);
			})
		});

		// 번들 리스트 로딩

		const bundleDebugURL = sopia.config['api-url'] + '/debug-server/bundle.json';
		axios({
			url: bundleDebugURL,
			method: 'get',
		}).then((res) => {
			const data = res.data;
			const keys = Object.keys(data);
			keys.forEach(k => {
				const bundle = data[k];
				const isUsing = sopia.config.bundle[k] ? true : false;
				apeendCardItem(k, bundle, isUsing);
			})
		});
	});
	
	
	/*               E: IMPORT               */
	
	/*               S: MENU CLICK               */
	document.querySelectorAll('ul.uk-navbar-nav>li>a').forEach(element => {
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
					if ( import_.getAttribute('data-target') && e.target.getAttribute('value') &&
					import_.getAttribute('data-target').toLowerCase && e.target.getAttribute('value').toLowerCase ) {
						if ( import_.getAttribute('data-target').toLowerCase() === e.target.getAttribute('value').toLowerCase() ) {
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
					document.querySelectorAll('ul.uk-navbar-nav>li>a').forEach(a => {
						let li = a.parentNode;
						if ( e.target.getAttribute('value') === a.getAttribute('value') ) {
							li.classList.add("uk-active");
						} else {
							li.classList.remove("uk-active");
						}
					});
				});
			}
		});
	});

	/*               E: MENU CLICK               */

	document.querySelector('#home-tab').click();

	if ( sopia.config ) {
		if ( sopia.config.version ) {
			document.title = `SOPIA - ${sopia.config.version}`;
		}
	}
});
