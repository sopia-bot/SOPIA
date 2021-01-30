////////////////////////////////////////////////////////////////
//  파일 : DOMContentLoaded.js                                //
//  작성자 : mobbing                                          //
//  주석 : onload 이벤트 때 동작할 것들.                       //
///////////////////////////////////////////////////////////////


const dcheck = (d1, d2) => {
	if ( parseInt(d1[0], 10) < parseInt(d2[0], 10) ) {
		return false;
	} else if ( parseInt(d1[0], 10) === parseInt(d2[0], 10) ) {
		if ( parseInt(d1[1], 10) < parseInt(d2[1], 10) ) {
			return false;
		} else if ( parseInt(d1[1], 10) === parseInt(d2[1], 10) ) {
			if ( parseInt(d1[2], 10) < parseInt(d2[2], 10) ) {
				return false;
			}
		}
	}

	return true;
};

const notiCheck = async () => {
	const res = await axios.get('https://sopia-bot.firebaseio.com/app/notice.json');
	const notices = res.data;
    const d = new Date(), now = new Date();
    const config = orgRequire(getPath('config.json'));
	d.setDate(d.getDate() - 7);

	let lastNotiIdx = parseInt(config['noti-idx'], 10);
	if ( Number.isNaN(lastNotiIdx) ) {
		lastNotiIdx = -1;
	}

	if ( !notices ) {
		return;
	}

	if ( notices.length >= lastNotiIdx ) {
		for ( let i = lastNotiIdx+1;i < notices.length;i++ ) {
			const noti = notices[i];
			const pd = d.yyyymmdd('-').split('-');
			const nd = noti.date.split('-');
			if ( dcheck(nd, pd) ) {
				await newAlertModal(noti.title, noti.content);
			}
			config['noti-idx'] = i;
        }
        AllSettingSave(config, null, true);
	}
};


const loadInit = async (config = {}) => {
	loadCustomPage();
	await notiCheck();
};

document.addEventListener('DOMContentLoaded', (evt) => {
	const config = orgRequire(getPath('/config.json'));
	loadInit(config);

	/*               S: IMPORT               */

	/**
	* dashboard를 controls에 import 시킨다.
	* display: block으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#home', (parent, target) => {
		target.setAttribute('data-target', 'home');
	});

	/**
	* ez-cmd를 controls에 import 시킨다.
	* display: block으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#ez-cmd', (parent, target) => {
		target.setAttribute('data-target', 'ez-cmd');
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
			});
			window.editor = monaco.editor.create(target.querySelector('#codeDiv'), {
				value: "",
				language: 'javascript',
				theme: sopia.config.sopia['dark-editor'] ? 'vs-dark' : 'vs',
				automaticLayout: true
			});
			window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
				if ( window.code.viewPath ) {
					const codeVal = window.editor.getValue();
					const ext = path.extname(window.code.viewPath);
					const rtn = jsSyntax(codeVal, ext === '.json');
					if ( !rtn.result ) {
						const modal = document.querySelector('#code-modal');
						if ( modal ) {
							document.querySelector('#err-title').innerText = rtn.msg;
							document.querySelector('#message').innerHTML =
								`${rtn.line} 번째 줄에서 에러가 발생했습니다!<br>` +
								`${rtn.syntax}`;
							UIkit.modal(modal).show();
						}
						return;
					}

					fs.writeFile(window.code.viewPath, codeVal, {encoding: 'utf8'}, (err) => {
						if ( err ) {
							throw err;
						}
						window.code.viewCode = window.editor.getValue();
						if ( noti ) {
							noti.success('파일 저장에 성공했습니다.', path.basename(window.code.viewPath));
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
					noti.success('리로딩', '방송에 입장하면 저장된 코드가 적용됩니다.');
				}
			});
			refreshTree(path.join(window.code.sopiaPath, "main.js"));
		});
	});

	/**
	 * spoorchat을 controls에 import 시킨다.
	 * display는 nonde으로 둔다.
	 */
	document.querySelector('#controls').appendImport('#spoorchat', async (parent, target) => {
		target.style.display = "none";
		target.setAttribute('data-target', 'spoorchat');



		// 설정값 로딩

		document.querySelector('#enableSpoorChat').checked = sopia.config.spoor.enable;
		document.querySelector('#minimumSpoon').value = sopia.config.spoor.minspoon;
		document.querySelector('#effectVolume').value = sopia.config.spoor.effectvolume;
		document.querySelector('#ttsVolume').value = sopia.config.spoor.ttsvolume;
		document.querySelector('#toutSpoor').value = sopia.config.spoor.toutspoor;


		if ( sopia.config.spoor.typecast && sopia.config.spoor.typecast.use ) {
			const email = sopia.config.spoor.typecast.email;
			const password = sopia.config.spoor.typecast.password;
			const user = await TC.initLogin(email, password);
	
			if ( user ) {
				noti.success('로그인 성공', user.email);
			}
			window.TCVoices = await TC.getVoiceList();
		}
	
		const tcidx = sopia.config.spoor.tcidx;
		const type = sopia.config.spoor.type;

		const vtype = document.querySelector('#voiceType');
		vtype.dataset.type = type;
		if ( typeof tcidx === 'number' ) {
			vtype.dataset.tcidx = tcidx;
		}
		if ( type === 'typecast' ) {
			vtype.innerText = 'T: ' + TCVoices[sopia.config.spoor.tcidx].name.ko
		} else {
			if ( speech.voices[type] ) {
				vtype.innerText = speech.voices[type].label;
			} else {
				vtype.innerText = type;
			}
		}

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

		loaded['spoor'] = true;
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
		document.querySelector('#dark-editor').checked = sopia.config.sopia['dark-editor'];
        document.querySelector('#default-url').value = sopia.config.sopia['default-url'];
        if ( sopia.config['version-fix'] ) {
            document.querySelector('#version-select').innerText = sopia.config.version;
        }

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
	document.querySelector('#controls').appendImport('#bundle', async (parent, target) => {
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
					if ( fs.existsSync(getPath(sopia.config.bundle[name])) ) {
						rimraf.sync(getPath(sopia.config.bundle[name]));
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

			const install = async (evt) => {
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
					const res = await axios.get(bundle.href);
					const data = res.data;

					const bdir = `sopia/${bundle.type || 'bundles'}/${name}`;
					const bundlePath = getPath(bdir);
					const bundleDir = path.dirname(bundlePath);
					if ( !fs.existsSync(bundleDir) ) {
						fs.mkdirSync(bundleDir);
					}

					sopia.debug(bundlePath, data);
					if ( !fs.existsSync(bundlePath) ) {
						sopia.debug("no exist bundle");
						fs.mkdirSync(bundlePath);
					}

					const target = path.join(bundlePath, 'index.js');
					fs.writeFileSync(target, data, {encoding: 'utf8'});

					useButton.innerText = "삭제";
					useButton.className = "uk-button uk-button-small uk-button-danger uk-button";
					useButton.removeEventListener('click', install);
					useButton.addEventListener('click', uninstall);

					if ( typeof sopia.config.bundle !== "object" ) {
						sopia.config.bundle = {};
					}

					sopia.config.bundle[name] = bdir;
					AllSettingSave(sopia.config, () => {
						noti.success(name, "번들 추가.");
						if ( sopia.isLoading ) {
							loadScript();
						}
					});

					// download dependency
					if ( bundle.dep ) {
						const deps = bundle.dep[process.arch];
						if ( Array.isArray(deps) ) {
							for ( const d of deps ) {
								const depPath = path.join(bundlePath, d.name);

								if ( !fs.existsSync(path.dirname(depPath)) ) {
									fs.mkdirSync(path.dirname(depPath));
								}

								const file = fs.createWriteStream(depPath);
								https.get(d.href, (res) => {
									res.pipe(file);
								});
							}
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
		let res = await axios.get(bundleURL);
		let data = res.data;
		let keys = Object.keys(data);
		keys.forEach(k => {
			const bundle = data[k];
			const isUsing = sopia.config.bundle[k] ? true : false;
			apeendCardItem(k, bundle, isUsing);
		});

		// 번들 리스트 로딩

		if ( window.DEBUG_MODE ) {
			const bundleDebugURL = sopia.config['api-url'] + '/debug-server/bundle.json';
			res = await axios.get(bundleDebugURL);
			data = res.data;
			if ( data ) {
				keys = Object.keys(data);
				keys.forEach(k => {
					const bundle = data[k];
					const isUsing = sopia.config.bundle[k] ? true : false;
					apeendCardItem(k, bundle, isUsing);
				});
			}
		}

		{
			// 다른 작업 카드 추가
			const parentItem = document.createElement('div');
			parentItem.className = "uk-margin-small-bottom";

			const item = document.createElement('div');
			item.className = "uk-card uk-card-default uk-card-hover spoor-card";
			item.style.display = "flex";

			const body = document.createElement('div');
			body.className = "uk-card-body";
			body.style = "height: 211px; align-items: center; display: flex; width: 100%;";

			const title = document.createElement('button');
			title.className = "uk-card-title uk-button uk-button-text uk-text-lead";
			title.style = "margin: auto;";
			title.innerText = "다른 작업";
			title.addEventListener('click', (evt) => {
				UIkit.modal(document.querySelector('#other-job')).show();
			});

			body.appendChild(title);
			item.appendChild(body);
			parentItem.appendChild(item);
			document.querySelector('#bundleList').appendChild(parentItem);
		}
	});
	/*               E: IMPORT               */

	/*               S: MENU CLICK               */
	document.querySelectorAll('div.uk-navbar-left>ul.uk-navbar-nav>li>a').forEach(element => {
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
				routingPage(e.target);
			}
		});
	});

	/**
	* dashboard를 controls에 import 시킨다.
	* display: block으로 둔다.
	*/
	document.querySelector('#controls').appendImport('#other', (parent, target) => {
		target.setAttribute('data-target', 'other');
	});

	/*               E: MENU CLICK               */

	document.querySelector('#home-tab').click();

	if ( sopia.config ) {
		if ( sopia.config.version ) {
			document.title = `SOPIA - ${sopia.config.version}`;
			if ( window.DEBUG_MODE ) {
				document.title = 'Chrome';
			}
		}
	}

	INJECTORS.forEach((injector) => injector.complete());
	sopia.wlog('SUCCESS', 'DOMContentLoad complete');
});
