if ( typeof sopia.spoon !== "object" ) {
    sopia.spoon = new Object();
    sopia.spoon.list = {};
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

axios.get(`https://static.spooncast.net/kr/stickers/index.json`)
    .then((res) => {
        const result = res.data;
        const categories = result.categories;

        const stickers = {};
        categories.forEach((category) => {
            if ( !category.is_used ) return;

            for ( sticker of category.stickers ) {
                if ( !sticker.is_used ) continue;
                if ( !sticker.title ) continue;

                stickers[sticker.name] = sticker.title;
            }
        });
        sopia.spoon.list = stickers;
    });