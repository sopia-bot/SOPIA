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
            monaco.editor.create(target.querySelector('div'), {
                value: "",
                language: 'javascript',
                theme: 'vs',
                automaticLayout: true
            });
            // window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
            //     fs.writeFile(getPath("s-bot/main.js"), window.editor.getValue(), {encoding: 'utf8'}, (err) => {
            //         if ( err ) {
            //             throw err;
            //         }
            //         window.save_variable = window.ObjClone(sbot.variable);
            //         window.code = window.editor.getValue();
            //         sbotInit();
            //         loadScript();
            //     });
            // });
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