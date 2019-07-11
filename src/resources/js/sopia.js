////////////////////////////////////////////////////////////////
//  파일 : sopia.js                                           //
//  작성자 : mobbing                                          //
//  주석 : sopia 객체를 생성하는 스크립트                       //
///////////////////////////////////////////////////////////////

/**
 * @sopia 의 객체를 생성한다.
 * 기본적으로 EventEmitter을 사용하여 스푼에서 받은 이벤트를 처리한다.
 * sopia.var 에선 sopia.var.save 함수를 사용하지 않는 한, sopia 재시작시 수정된 변수값을 초기화한다.
 */
const sopia = new EventEmitter();
sopia.var = new Object();
sopia.intval = new Object();
sopia.require = require;

/**
 * @function import
 * @param {String} path_
 * sopia 프로젝트 폴더 안에 있는 모듈을 로딩할 때 사용한다.
 */
sopia.import = (path_) => {
	return sopia.require(getPath(path.join(window.code.sopiaPath,path_)));
};
/**
 * @function include
 * @param {String} path_
 * sopia 프로젝트 폴더 안에 있는 스크립트 파일을 실행할 때 사용한다.
 */
sopia.include = (path_) => {
	let file = getPath(path.join(window.code.sopiaPath, path_));
	if ( fs.existsSync(file) ) {
		let source = fs.readFileSync(file, {encoding: 'utf8'});
		eval(source);
	} else {
        // file not exists
    }
};

//설정파일 로딩
sopia.config = require(getPath('./config.json'));



/**
* @function sopia.error
* @param {UserException} obj
* try ... catch 로 받은 error 을 출력한다.
*/
sopia.error = (obj) => {
    logging(`${obj.name} : ${obj.message}`);
};

/**
* @function sopia.log
* @param {*} obj
* @param {String} cmd
* console.log 와 비슷한 기능
*/
sopia.log = (obj, cmd = null) => {
    let code = "";
    let flag = true;
    let lang = "javascript";
    if ( typeof obj === "object" ) {
        code += JSON.stringify(obj, null, '\t');
        flag = false;
    } else if ( typeof obj === "string") {
        if ( cmd ) {
            if ( obj.match(/\[object \w+\]/) ) {
                let s = obj.replace(/\W+\[object\ /, "").replace(/\]$/, "");
                switch (s.toLowerCase()) {
                    case "object": {
                        code += eval(`JSON.stringify(${cmd}, null, '\t');`);
                        flag = false;
                    } break;
                }
                if ( s.toLowerCase().match(/html.*element/)) {
                    code += eval(cmd).outerHTML;
                    flag = false;
                    lang = "html";
                }
                
                if ( flag ) {
                    //예외처리 안 된 항목
                    console.log(s);
                }
            }
        }
    }
    
    if ( flag ) {
        code += obj + "";
    }
    
    logging(code, lang);
};

sopia.send = (data) => {
    webview.executeJavaScript(`SendChat(\`${data.replace(/\`/g, "\\\`").replace(/\$/g, "\\$")}\`);`);
};

module.exports = sopia;