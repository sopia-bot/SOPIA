import { ApiLivesInfo, HttpRequest, Live, User } from "@sopia-bot/core";
import { useEffect, useState } from "react";
import { useSpoon } from "../../plugins/spoon";
import { useQuery } from '@tanstack/react-query';
import './index.css';
import Track from "./track";
import { TrackFileOption, TrackInputOption, TrackItem, TrackOption, useLiveContext } from "../../plugins/live-context";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { addTrack, deleteTrack, getTrackList, setTrack } from "@sopia-bot/bridge";
import { Tooltip } from "primereact/tooltip";

type TrackType = {
  class: string;
  icon: string;
  text: string;
  type: 'file'|'input'|'output';
}

export default function Home() {
	const liveContext = useLiveContext();
  const [trackList, setTrackList] = useState<TrackItem[]>(liveContext.toArray());
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  const { status, isLoading, data } = useQuery({
    queryKey: ['getTrackLIst'],
    queryFn: async () => (await getTrackList()) || [],
  });

  useEffect(() => {
    if ( status === 'success' && data && data.length > 0 ) {
      (async () => {
        for ( const track of data ) {
          await liveContext.setTrack(track.uid, track as TrackOption);
        }
        setTrackList(liveContext.toArray());
      })();
    }
  }, [status, data]);

  if ( isLoading ) return <>Loading...</>;

  const onChangeTrackState = async (id: string, option: TrackOption) => {
    await liveContext.setTrack(id, option);
    await setTrack({
      uid: id,
      ...option
    });
    setTrackList(liveContext.toArray());
  }

  const trackTypeList: TrackType[] = [
    {
      class: 'text-pink-500',
      icon: 'pi pi-file',
      text: t('home.track_type.file'),
      type: 'file',
    },
    {
      class: 'text-cyan-500',
      icon: 'pi pi-microphone',
      text: t('home.track_type.input'),
      type: 'input',
    },
    {
      class: 'text-green-500',
      icon: 'pi pi-megaphone',
      text: t('home.track_type.output'),
      type: 'output',
    },
  ];

  const addNewTrack = async (type: TrackType['type']) => {
    let item;
    switch (type) {
      case 'file':
        item = await liveContext.addTrack({
          type,
          trackName: '',
          filePath: '',
          mute: false,
        });
    
        await addTrack({
          uid: item.uid,
          type: item.option.type,
          trackName: item.option.trackName,
          filePath: (item.option as TrackFileOption).filePath,
          mute: item.option.mute,
        });
        break;
      case 'input':
        item = await liveContext.addTrack({
          type,
          trackName: '',
          mute: false,
          deviceId: 'default',
        });

        await addTrack({
          uid: item.uid,
          type: item.option.type,
          trackName: item.option.trackName,
          deviceId: (item.option as TrackInputOption).deviceId,
          mute: item.option.mute,
        });
        break;
      default:
        const _exhaustiveCheck: never = type;
        throw new Error('Unknown track type: ' + type);
    }
    setTrackList(liveContext.toArray());
    setVisible(false);
  }

  const deleteTrackItem = async (uid: string) => {
    await liveContext.deleteTrack(uid);
    console.log('3333333', uid);
    await deleteTrack({ uid, });
    console.log('444444', uid);
    setTrackList(() => liveContext.toArray());
  }

  return (
    <div style={{ maxHeight: 'var(--wrapper-height)', maxWidth: '100vw', overflow: 'auto' }}>
	    <Tooltip target=".tooltip-element" />
      <div className="p-2">
        <div onClick={() => setVisible(true)} className="flex align-items-center add-new-track-button" style={{ width: '100%', height: '50px' }}>
          <div className="flex justify-content-center align-items-center" style={{ width: '100%' }}>
            {t('home.add_new_track')} <i className="pi pi-plus ml-1 text-green-500"></i>
          </div>
        </div>
      </div>
      <Dialog header={t('home.select_track_type')} visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
        <div className="flex flex-wrap align-items-center">
          <div className="flex justify-content-around" style={{ width: '100%' }}>
            {
              trackTypeList.map((trackType) => <div key={trackType.text} onClick={() => addNewTrack(trackType.type)} className={`${trackType.class} track-type-button flex flex-column align-items-center`}>
                <i className={`${trackType.icon} text-7xl`}></i>
                <span className="mt-2">{trackType.text}</span>
              </div>)
            }
          </div>
        </div>
      </Dialog>
      {
        trackList.map(
          (context) => <div key={context.uid}><Track
            option={context.option}
            onChange={(option: any) => onChangeTrackState(context.uid, option)}
            onDelete={() => deleteTrackItem(context.uid)}
          /></div>
        )
      }
    </div>
  );
}