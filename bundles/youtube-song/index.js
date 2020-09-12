/*
* index.js
* Created on Thu Sep 10 2020
*
* Copyright (c) Tree Some. Licensed under the MIT License.
*/

sopia.playQueue = [];
sopia.playReQ = {};

sopia.on('message', async (e) => {
	if ( e.isCmd || isCmd(e) ) {
		
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
				sopia.send("선택 #번호 명령어로 신청할 곡을 선택해 주세요.");
				items.forEach((item, idx) => {
					sopia.send(`${idx+1}. ${item.snippet.title}`);
				});
				sopia.playReQ[e.author.tag] = items;
			}
		} else if ( e.cmd === "선택" ) {
			let num = parseInt(e.content.match(/[0-9]+/)[0], 10);
			if ( num < 0 || num > 5 ) {
				sopia.send('1번 ~ 3번 사이에서 선택해 주세요');
				return;
			}
			num--;
			
			const data = sopia.playReQ[e.author.tag][num];
			const song = {
				title: data.snippet.title,
				id: data.id.videoId,
			};
			sopia.playQueue.push(song);
			sopia.send(`[${song.title}](이)가 신청곡 리스트에 추가되었습니다.`);
			delete sopia.playReQ[e.author.tag];

			const videoData = player.getVideoData();
			if ( player.getPlayerState() <= 0 || (videoData.author === '' && videoData.title === '') ) {
				playNextSong();
			}
		} else if ( e.cmd === "재생목록" ) {
			if ( sopia.playQueue.length === 0 ) {
				sopia.send("현재 재생 대기중인 곡이 없습니다.");
			} else {
				let rtn = "";
				sopia.playQueue.forEach((s, idx) => {
					rtn += `${idx+1}. ${s.title}`;
					if ( idx < sopia.playQueue.length - 1 ) {
						rtn += '\n';
					}
				});
				sopia.send(rtn);
			}
		} else if ( e.cmd === "현재곡" ) {
			const videoData = player.getVideoData();
			const { author, title } = videoData;

			const playBar = makePlaybar(player.getCurrentTime(), player.getDuration());

			sopia.send(`현재 곡: ${title}\n아티스트: ${author}`);
			sopia.send(playBar);
		}
	}
});
