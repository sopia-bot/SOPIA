////////////////////////////////////////////////////////////////
//  파일 : elementLoad.js                                     //
//  작성자 : mobbing                                          //
//  주석 : 처음 뷰가 로딩될 때 이벤트 등 세팅이 될 곳이다.       //
////////////////////////////////////////////////////////////////


/** 
 * 2분할 된 메인창의 gutter가,
 * Panel1(왼쪽) 의 offset이 @minOffset 이하이면 Navbar의 텍스트가 깨지는 현상으로,
 * @minOffset 이하가 되면 offset을 @minOffset 으로 맞춘다.
 */
window.addEventListener('resize', () => {
    let minOffset = 400;
    if ( window.ContainerPanel.pairs[0].gutter.offsetLeft < minOffset ) {
        //minOffset 은 현재 창 가로길이 중 몇 %인가.
        let p = minOffset * 100 / document.body.offsetWidth;
        window.ContainerPanel.setSizes([p, 100 - p]);
    } else {
    }
    refreshNavSize();
});


/**
 * 메인창을 2분할 한다.
 */
window.ContainerPanel = Split(['#ContainerPanel>div[name="panel1"]', '#ContainerPanel>div[name="panel2"]'], {
    //기본적으로 50%를 나눈다.
    sizes: [50, 50],
    //webview 쪽의 사이즈는 전부 줄을 수 있게, control view 쪽은 Navbar의 메뉴가 전부 보이도록 설정한다.
    minSize: [400, -50],
    gutterStyle: (dimension, gutterSize) => {
        return {
            //분할자를 가로 3px로 고정시킨다.
            'width': '3px',
            'z-index': '1001'
        }
    },
});

/** 
* 위에서 제스쳐가 끝난 후 마우스 오른쪽 버튼을 떼면,
* @gesture 에 맞는 동작을 실행한다.
*/
document.querySelector('.gutter').addEventListener('mousemove', (e) => {
    refreshNavSize();
});

/**
 * 서버에서 app 관련 설정, 정보를 가져온다.
 * sopia config 가 불리지 않았으면 1초 뒤 다시 실행한다.
 * 제대로 로딩이 됐으면, 1분마다 받아온다.
 */
let completeLoading = false;
let callAppTime = 1;
let loadingInterval = setInterval(() => {
    if ( completeLoading === true ) {
        clearInterval(loadingInterval);
		callAppTime = 60;
    }

    if ( typeof sopia === "object" && sopia.config && sopia.config["api-url"] ) {
        axios({
            url: `${sopia.config["api-url"]}/app.json`,
            method: 'get'
        }).then(res => {
            sopia.app = res.data;
            const controls = document.querySelector('#controls');
            controls.style.backgroundImage = `url("${sopia.app["main-bg"]}")`;
            completeLoading = true;
        });
    }
}, 1000);

// 2020. 02. 15 잘 사용하지 않는 제스쳐 사용을 지운다.
// input range 가 동작하지 않기 때문.
if ( 0 ) {
/**
 * @region 에 마우스클릭 후 제스쳐했을 때의 이벤트를 추가한다.
 * @evt 의 @buttons 가 2면 오른쪽 클릭이므로, 그 때만 @gesture 를 등록한다.
 */
window.region = new ZingTouch.Region(document.body);
window.gesture = null;

document.querySelectorAll('*').forEach(e => {
    if ( e.tagName.toLowerCase() === "input" ) {
    } else {
        window.region.bind(e, 'pan', (e) => {
            let evt = e.detail.events[0].originalEvent;
            if ( evt.buttons === 2 ) {
                let ddata = e.detail.data[0];
                if ( ddata.currentDirection === 180 ) {
                    //왼쪽으로 제스쳐를 했을 때,
                    window.gesture = "left";
                } else if ( ddata.currentDirection === 360 ) {
                    //오른쪽으로 제스쳐를 했을 때
                    window.gesture = "right";
                }
            } else {
                refreshNavSize();
            }
        });
        /** 
        * 위에서 제스쳐가 끝난 후 마우스 오른쪽 버튼을 떼면,
        * @gesture 에 맞는 동작을 실행한다.
        */
        e.addEventListener('mouseup', (e) => {
            if ( e.button === 2 ) {
                if ( window.gesture ) {
                    if ( window.gesture === "left" ) {
                        //webview panel 을 50,50으로 맞춘다.
                        document.querySelector('#ContainerPanel>div[name="panel1"]').setAttribute('style', 'width:calc(50%);');
                        document.querySelector('#ContainerPanel>div[name="panel2"]').setAttribute('style', 'width:calc(50%);');
                    } else if ( window.gesture === "right" ) {
                        //webview panel 을 0으로 맞춘다.
                        window.ContainerPanel.setSizes([101, -1]);
                    }
                    window.gesture = null;
                    refreshNavSize();
                }
            }
        });
    }
});
} // if ( 0 )

refreshNavSize();
