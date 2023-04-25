import { useRecoilState } from 'recoil';
import { liveContextStates } from '../../store';
import './index.css';
import { useState } from 'react';
import { getNode } from '@sopia-bot/bridge';
import { LiveEvent, LiveEventStruct, LiveSocket, LiveUpdateSocket } from '@sopia-bot/core';
import { useSpoon } from '../../plugins/spoon';
import ChatMessage from './chat-message';

const { electron } = getNode();
const { ipcRenderer } = electron;

const IgnoreEvent = [
  LiveEvent.LIVE_STATE,
  LiveEvent.LIVE_HEALTH,
  LiveEvent.LIVE_FAILOVER,
  LiveEvent.LIVE_RANK,
  LiveEvent.LIVE_RANKLIST,
  LiveEvent.LIVE_LAZY_UPDATE,
];


// https://github.com/sopia-bot/SOPIA/blob/sopia-v3/src/views/Live/Player.vue#L119
export default function LivePlayer() {
  const [liveContextStat, setLiveContextStat] = useRecoilState(liveContextStates);
  const [liveEventList, setLiveEventList] = useState<any[]>([]);
  const [managerIds, setManagerIds] = useState<number[]>([]);
  const spoon = useSpoon();

  if ( liveContextStat !== 'processing' ) {
    return <></>;
  }

  function onLiveEvent(i: any, evt: any) {
    console.log('Receive live socket event', evt);

    if ( (evt as LiveUpdateSocket)?.data?.live?.manager_ids ) {
      setManagerIds((evt as LiveUpdateSocket)?.data?.live?.manager_ids);
    }

    if ( evt.event === LiveEvent.LIVE_JOIN && evt?.data?.author.id === spoon.logonUser.id ) {
      // Joined logon account event ignore
      return;
    }

    if ( IgnoreEvent.includes(evt.event) ) {
      return;
    }

    liveEventList.push(evt);
    if ( liveEventList.length > 100 ) {
      liveEventList.shift();
    }
    setLiveEventList([...liveEventList]);

  }

  ipcRenderer.off(`live/sock/${LiveEvent.LIVE_EVENT_ALL}`, onLiveEvent);
  ipcRenderer.on(`live/sock/${LiveEvent.LIVE_EVENT_ALL}`, onLiveEvent);


  return (
    <div className='live-player'>
      {
        liveEventList.map(evt => <ChatMessage value={evt}></ChatMessage>)
      }
    </div>
  );
}