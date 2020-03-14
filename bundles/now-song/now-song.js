sopia.modules.getMelonCaption = require('./get-melon-caption').getMelonCaption;

sopia.var.cpation = sopia.modules.getMelonCaption();

sopia.on('message', (e) => {
	if ( e.isCmd || isCmd(e) ) {
		const caption = sopia.modules.getMelonCaption();
		const delMelonCaption = caption.replace(/melon$/i, '').trim();
		const title = delMelonCaption.replace(/-$/, '').trim();

		sopia.send(`🔊현재 곡 정보🎶\n${title}`);
	}
});