

sopia.on('message', (e) => {
    if ( e.isCmd || isCmd(e) ) {
        if ( e.cmd === "추첨" ) {
            if ( !isAdmin(e.author) ) return;

            sopia.api.getMembers()
                .then(members => {
                    const num = sopia.api.rand(members.length);
                    sopia.send(`당첨된 사람: ${members[num].nickname}`);
                });
        }
    }
})