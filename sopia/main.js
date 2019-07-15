sopia.include('./preload.js');
sopia.api = sopia.import('./api.js');
sopia.storage.load('messages', './storages/messages.json');

sopia.on('message', (e) => {
	let msg = e.message;
	if ( msg.indexOf("!") === 0 ) {
		//![command]
		msg = msg.replace("!", ""); // ! 삭제
		e.message = msg;
		let command = msg.split(' ')[0];
		let str = null;

	}
});

sopia.on('all', (e) => {
	console.log(e);
});