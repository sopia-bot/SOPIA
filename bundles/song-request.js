sopia.var.songReq = [];

sopia.on('message', (e) => {
    if ( e.isCmd || isCmd(e) ) {
        if ( !isAdmin(e.author) ) return;
        
        const cmd = e.message.trim();
        if ( e.cmd === "신청곡" ) {
            if ( cmd === "신청곡" ) {
                if ( sopia.var.songReq.length === 0 ) {
                    sopia.send("현재 신청곡이 없습니다.");
                } else {
                    let rtn = "";
                    sopia.var.songReq.forEach((s, idx) => {
                        rtn += `${parseInt(idx,10)+1}. ${s}`;
                        if ( idx < sopia.var.songReq.length - 1 ) {
                            rtn += '\n';
                        }
                    });
                    sopia.debug(rtn);
                    sopia.send(rtn);
                }
            } else {
                const song = cmd.replace("신청곡 ", "");
                if ( song.match(/^(제거|삭제)/) ) {
                    if ( song.match(/^(제거|삭제)\ +[0-9]+/) ) {
                        const num = parseInt(song.match(/[0-9]+/)[0], 10);
                        const deleted = sopia.var.songReq.splice(num-1, 1);
                        sopia.send(`리스트에서 ${num} 번째인 [${deleted}](이)가 신청곡 리스트에서 삭제되었습니다.`);
                    } else {
                        const deleted = sopia.var.songReq.pop();
                        sopia.send(`[${deleted}](이)가 신청곡 리스트에서 삭제되었습니다.`);
                    }
                } else {
                    sopia.var.songReq.push(song);
                    sopia.send(`[${song}](이)가 신청곡 리스트에 추가되었습니다.`);
                }
            }
        }
    }
});