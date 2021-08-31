//variable initi
sopia.var.created = null;                   //방송 만들어진 시간
sopia.var.global_stack = [];				//신청곡
sopia.var.global_hello_stack = {};			//한 번 인사한 사람.
sopia.var._send_ = sopia.send;					//send함수 백업

String.prototype.replaceAt=function(index, replacement) {
	return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
};

String.prototype.sprintf = function() {
	let format = this;

	for (let i = 0;i < arguments.length;i++) {
		let element = arguments[i];
		format = format.replace(`{${i}}`, element);
	};
	return format;
};

//초 단위
window.s2hms = (s) => {
	let h = (parseInt(s/3600)).toString();
	let m = (parseInt((s - (h*3600)) / 60)).toString();
	let sc = (parseInt((s - (h*3600) - (m*60)))).toString();

	if ( h.length < 2 ) {
		h = '0' + h;
	}
	if ( m.length < 2 ) {
		m = '0' + m;
	}
	if ( sc.length < 2 ) {
		sc = '0' + sc;
	}

	return {
		h: h,
		m: m,
		s: sc
	};
};

window.makePlaybar = (current, max) => {
	const playbar =
	'{0} {1} {2}\n'+
	'     ㅤㅤㅤㅤㅤ ◁ㅤㅤ❚❚ㅤㅤ▷ㅤㅤㅤㅤㅤ↻ ⇆';
	const bar = '────────────';
	const parseCurrent = s2hms(current);
	const parseMax = s2hms(max);

	const per = parseInt(current / max * 100);
	const idx = parseInt(bar.length * per / 100);

	return playbar.sprintf(`${parseCurrent.h}:${parseCurrent.m}:${parseCurrent.s}`,
	bar.replaceAt(idx, '●'),
	`${parseMax.h}:${parseMax.m}:${parseMax.s}`);
};

window.updateProps = () => {
	document.querySelector('#webview').executeJavaScript('getProps()')
	.then(d => {
		sopia.var.props = d;
	});
};



const presentPath = getPath('sopia/storages/present.json');
if ( fs.existsSync(presentPath) ) {
    const present = file2JSON(presentPath).default;
    axios.get(`https://static.spooncast.net/kr/stickers/index.json`)
        .then((res) => {
            const result = res.data;
            const categories = result.categories;

            const stickers = {};
            categories.forEach((category) => {
                if ( !category.is_used ) return;

                for ( const sticker of category.stickers ) {
                    if ( !sticker.is_used ) continue;
                    stickers[sticker.name] = null;
                }
            });
            const mergedSticker = stickers;
            for( const [key, react] of Object.entries(present) ) {
                if ( typeof react !== 'undefined' ) {
                    mergedSticker[key] = react;
                }
            }

            const rtn = {
                'default': mergedSticker,
            };
            fs.writeFileSync(presentPath, fullStringify(rtn), {encoding: 'utf8'});
        });
}

window.updateProps = () => {
	document.querySelector('#webview').executeJavaScript('getProps()')
	.then(d => {
		sopia.var.props = d;
	});
};