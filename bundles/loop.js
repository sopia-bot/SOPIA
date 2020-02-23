sopia.var.intvCnt = 0;

sopia.on('message', (e) => {
	if ( e.isCmd || isCmd(e) ) {
		if ( e.message.match(/반복\ (삭제|제거)/g) ) {
			if ( sopia.var.intvCnt > 0 ) {
				sopia.itv.clear('intv' + (sopia.var.intvCnt - 1));
				sopia.send("가장 마지막 반복 작업을 제거했습니다.");
			} else {
				sopia.send("제거할 반복 작업이 없습니다.");
			}
		} else if ( e.message.match(/^반복/) ) {
			let msg = e.message.replace("반복 ", "");
			let time = parseInt(msg.match(/^[0-9]+/g)[0], 10);
			msg = msg.replace(time.toString()+" ", "");
	

			const key = 'intv' + (sopia.var.intvCnt++);
			sopia.itv.add(key, () => {
				sopia.send(msg);
			}, (time * 1000));
			sopia.send(`앞으로 ${(time)}초 마다 반복 채팅을 입력합니다.`);
		}	
	}
});