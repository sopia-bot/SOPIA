# @sopia-bot/core
Spoon radio api wrapper https://www.spooncast.net/.

# Install

```sh
npm install @sopia-bot/core
```

or

```sh
yarn add @sopia-bot/core
```

# Usage
```typescript
import {
  SpoonClient,
  Country,
  SnsType,
  LiveEvent,
} from '@sopia-bot/core';

(async () => {
  const spoon = new SpoonClinet('DeviceUUID');
  spoon.country = Country.KOREA;
    
  await spoon.init();
  await spoon.login('Your ID', 'Your Password', SnsType.PHONE);
    
  const socket = await spoon.api.lives.join(#Live);
    
  socket.on(LiveEvent.LIVE_JOIN, (e) => {
    // do something.
    ...
    socket.message('Message');
  });
    
  socket.on(LiveEvent.LIVE_MESSAGE, (e) => {
    // sender = e.author
  });
})();
```
