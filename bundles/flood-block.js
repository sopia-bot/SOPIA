sopia.var.stack = [];
sopia.var.kickedStack = [];

updateProps();
sopia.api.blockUser = (userId) => {
	sopia.modules.axios({
		url: `https://kr-api.spooncast.net/lives/${sopia.live.id}/block/`,
		headers: {
			'authorization': sopia.var.props.authKey,
		},
        method: 'post',
		data: {
			block_user_id: Number(userId),
		},
	});
}

checkFlood = (stack) => {
    let lastMessage = stack[0].message;
    let lastId = stack[0].id;
    let result = stack.findIndex(e => {
        if ( e.message === lastMessage && e.id === lastId ) {
        } else {
            return true;
        }
    });
    return result === -1;
};

sopia.on('message', (e) => {
    if ( sopia.var.stack.length === 10 ) {
        sopia.var.stack.shift();
    }

    sopia.var.stack.push({
        id: e.author.id,
        message: e.message,
        nickname: e.author.nickname
    });

    if ( sopia.var.stack.length >= 10 ) {
        if ( isAdmin(sopia.me) ) {
            let copy = JSON.parse(JSON.stringify(sopia.var.stack));
            if ( sopia.var.kickedStack.includes(copy[0].id) ) {
                // do nothing
            } else {
                if ( checkFlood(copy) === true ) {
                    sopia.var.kickedStack.push(copy[0].id);
                    sopia.api.blockUser(copy[0].id);
                    sopia.send(`${copy[0].nickname} 님을 강퇴합니다.`);
                }
            }
        }
    }
})

sopia.on('like', (e) => {
    if ( sopia.var.stack.length === 10 ) {
        sopia.var.stack.shift();
    }

    sopia.var.stack.push({
        id: e.author.id,
        message: 'like',
        nickname: e.author.nickname
    });

    if ( sopia.var.stack.length >= 10 ) {
        if ( isAdmin(sopia.me) ) {
            let copy = JSON.parse(JSON.stringify(sopia.var.stack));
            if ( sopia.var.kickedStack.includes(copy[0].id) ) {
                // do nothing
            } else {
                if ( checkFlood(copy) === true ) {
                    sopia.var.kickedStack.push(copy[0].id);
                    sopia.api.blockUser(copy[0].id);
                    sopia.send(`${copy[0].nickname} 님을 강퇴합니다.`);
                }
            }
        }
    }
})
