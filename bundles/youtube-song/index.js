/*
 * index.js
 * Created on Thu Sep 10 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */

sopia.playQueue = [];
sopia.playReQ = {};
const YT_API_KEY='AIzaSyDivm3vdNwk6uPo6lYWLaam9rnp9aYPrDQ';
const YT_URL='https://www.googleapis.com/youtube/v3/search';

sopia.on('message', async (e) => {
    if ( e.isCmd || isCmd(e) ) {
        if ( !isAdmin(e.author) ) return;
        
        const cmd = e.message.trim();
        if ( e.cmd === "신청곡" ) {
			const song = cmd.replace("신청곡 ", "");
			if ( song.match(/^(제거|삭제)/) ) {
				if ( song.match(/^(제거|삭제)\ +[0-9]+/) ) {
					const num = parseInt(song.match(/[0-9]+/)[0], 10);
					const deleted = sopia.playQueue.splice(num-1, 1);
					sopia.send(`리스트에서 ${num} 번째인 [${deleted.title}](이)가 신청곡 리스트에서 삭제되었습니다.`);
				} else {
					const deleted = sopia.var.songReq.pop();
					sopia.send(`[${deleted.title}](이)가 신청곡 리스트에서 삭제되었습니다.`);
				}
			} else {
				const items = await YT.search(song);
				sopia.send(`[${song}](이)가 신청곡 리스트에 추가되었습니다.`);
			}
		} else if ( e.cmd === "신청" ) {
			const num = parseInt(e.content.match(/[0-9]+/)[0], 10);
			if ( num < 0 || num > 5 ) {
				sopia.send('1번 ~ 5번 사이에서 선택해 주세요');
				return;
			}

			const data = sopia.playReQ[e.author.tag][num];
			const song = {
				title: data.snippet.title,
				id: data.id.videoId,
			};
			sopia.playQueue.push(song);
			sopia.send(`[${song.title}](이)가 신청곡 리스트에 추가되었습니다.`);
		} else if ( e.cmd === "재생목록" ) {
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
		}
        }
    }
});
