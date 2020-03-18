sopia.modules.getMelonCaption = sopia.require(getPath('./sopia/bundles/get-melon-caption')).getMelonCaption;

sopia.var.cpation = sopia.modules.getMelonCaption();

sopia.on('message', (e) => {
	if ( e.isCmd || isCmd(e) ) {
		if ( e.cmd === "현재곡" ) {
			const caption = sopia.modules.getMelonCaption().trim();

			if ( caption === "" ) {
				sopia.send("현재 곡 정보를 가져올 수 없습니다.");
				return;
			}

			const delMelonCaption = caption.replace(/melon$/i, '').trim();
			const title = delMelonCaption.replace(/-$/, '').trim();

			sopia.send(`🔊현재 곡 정보🎶\n${title}`);
		}
	}
});