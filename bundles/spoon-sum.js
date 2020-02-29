if ( typeof sopia.spoon !== "object" ) {
    sopia.spoon = new Object();
    sopia.spoon.list = {
		"sticker_like": "하트",
		"sticker_juice": "쥬스",
		"sticker_icecream": "아이스크림",
		"sticker_coke": "콜라",
		"sticker_rose": "장미",
		"sticker_clap": "박수",
		"sticker_bubbletea": "버블티",
		"sticker_snack11": "빼빼로",
		"sticker_potatochip": "감자튀김",
		"sticker_hotdog": "핫도그",
		"sticker_hamburger": "햄버거",
		"sticker_lip": "입술",
		"sticker_coffee_donut": "커피도넛",
		"sticker_chicken": "치킨",
		"sticker_cake": "케이크",
		"sticker_crown": "왕관",
		"sticker_pizza": "피자",
		"sticker_bearflower": "곰꽃",
		"sticker_vday": "발렌타인",
		"sticker_clover": "클로버",
		"sticker_ohohoh": "555",
		"sticker_jackpot": "잭팟",
		"sticker_angel": "천사",
		"sticker_santa": "산타",
        "sticker_airplane": "비행기",
		"sticker_myheart": "선물상자",
        "default": "Unkown"
    };
    sopia.spoon.sum = {
        "전체": 0,
    };
}

sopia.on('present', (e) => {
    const key = sopia.spoon.list[e.sticker] ? e.sticker : "default";
    const name = sopia.spoon.list[key];
    const num = (e.combo * e.amount);

    if ( typeof sopia.spoon.sum[name] !== "number" ) {
        sopia.spoon.sum[name] = e.combo;
    } else {
        sopia.spoon.sum[name] += e.combo;
    }

    sopia.spoon.sum["전체"] += num;
});

sopia.on('message', (e) => {
    if ( e.isCmd || isCmd(e) ) {
        if ( !isAdmin(e.author) ) return;

        if ( e.cmd === "스푼스푼" ) {
            sopia.send(`현재 받은 스푼은 ${sopia.spoon.sum["전체"]} 개 입니다.`);
        } else if ( e.cmd === "스푼통계" ) {
            let rtn = "";
            const skeys = Object.keys(sopia.spoon.sum);
            skeys.forEach(k => {
                rtn += `${k}: ${sopia.spoon.sum[k]} 개\n`;
            });
            sopia.send(rtn);
        }
    }
});