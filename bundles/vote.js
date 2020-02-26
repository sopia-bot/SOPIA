sopia.var.VoteListener = {
    "title": null,
    "vote": [],
    "user": {},
};

sopia.var.onVoteMessage = (e) => {
    const data = e.data;

    if ( sopia.var.VoteListener.user[e.author.id] ) {
        return;
    }

    console.log(e);
    if ( e.isCmd || isCmd(e) ) {
        const msg = e.message;

        if ( msg.match(/투표\ [0-9]+/) ) {
            const num = parseInt(msg.match(/[0-9]+/g)[0], 10);
            if ( sopia.var.VoteListener.vote[num-1] ) {
                sopia.var.VoteListener.vote[num-1].v += 1;
                sopia.var.VoteListener.user[e.author.id] = true;
            }
        }
    }
};

sopia.on('message', (e) => {
    if ( e.isCmd || isCmd(e) ) {
        if ( !isAdmin(e.author) ) return;

        let entry = e.message.split('\n');
        let title = entry[0].split(' ');
        let s = title.splice(0, 2);
        title = title.join(' ');
        
        let str = "";
        
        if ( s[1] === "등록" ) {
            if ( sopia.var.VoteListener["title"] !== null ) {
                sopia.send(`이미 ${sopia.var.VoteListener.title} 투표가 진행중입니다. 투표를 마감 후 다시 등록해 주세요.`);
                return;
            }
            
            if ( entry.length <= 2 ) {
                sopia.send(`투표 항목을 2개 이상 만들어 주세요.`);
                return;
            }
            
            str += title + " 투표가 등록되었습니다.\n\n";
            
            sopia.var.VoteListener.title = title;
            sopia.var.VoteListener.vote = new Array();
            sopia.var.VoteListener.user = new Object();
            
            for ( let i = 1;i < entry.length;i++ ) {
                if ( entry[i].trim().length > 0 ) {
                    sopia.var.VoteListener.vote.push({
                        n: entry[i],
                        v: 0
                    });
                    str += `${i}. ${entry[i]}\n`;
                }
            }
            
            str += "\n해당 번호를 붙여 다음과 같이 투표할 수 있습니다.\n!투표 1";
            sopia.on('message', sopia.var.onVoteMessage);
        } else if ( s[1] === "마감" ) {
            sopia.removeListener('message', sopia.var.onVoteMessage);
            
            for (let i=0;i < sopia.var.VoteListener.vote.length;i++) {
                sopia.var.VoteListener.vote.sort((a, b) => b.v - a.v);

                str += sopia.var.VoteListener.title + " 투표 결과\n\n";
                sopia.var.VoteListener.vote.forEach((element, idx) => {
                    str += `${idx+1} 위 - ${element.n} (${element.v} 표)\n`;
                });
                
                sopia.var.VoteListener.title = null;
                sopia.var.VoteListener.vote = []
                sopia.var.VoteListener.user = {};
            }
        }
        sopia.send(str);
    }
});
