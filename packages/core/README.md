# sopia-core
Spoon radio core API https://www.spooncast.net/

# Install

```sh
npm install sopia-core
```

or

```sh
yarn add sopia-core
```

# Usage
```javascript
import * as spoon from 'sopia-core';

(async () => {
    const sopia = new spoon.Client('DeviceUUID');
    await sopia.login('Your ID', 'Password', spoon.LoginType.PHONE);
    
    
    const socket = await sopia.liveManager.liveJoin(#Live);
    
    socket.on(spoon.LiveEvent.LIVE_JOIN, (e) => {
        // do something.
        ...
        socket.message('Message');
    });
    
    socket.on(spoon.LiveEvent.LIVE_MESSAGE, (e) => {
        // sender = e.author
    });
})();
```
