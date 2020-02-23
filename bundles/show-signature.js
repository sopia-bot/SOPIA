sopia.on('message', (e) => {
    if ( e.isCmd || isCmd(e) ) {
        const command = e.cmd;
        
        if ( command === "시그니처" ) {
            if ( sopia.config.spoor.signature ) {
                const signatures = Object.keys(sopia.config.spoor.signature);
                sopia.send(signatures.join(', '));
            }
        }
    }
});