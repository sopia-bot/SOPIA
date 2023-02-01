import { ApiLivesInfo, HttpRequest, Live, User } from "@sopia-bot/core";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpoon } from "../../plugins/spoon";
import PartnerBanner from "./PartnerBanner";
import { useQuery } from '@tanstack/react-query';
import './home.css';
import Track from "./track";
import { TrackOption, useLiveContext } from "../../plugins/live-context";

export default function Home() {
	const liveContext = useLiveContext();
  const [liveContextState, setLiveContextState] = useState(liveContext);

  liveContext.addTrack({
    type: 'file',
    trackName: '',
    filePath: '',
  });

  const onChangeTrackState = (id: string, option: TrackOption) => {
    liveContextState.setTrack(id, option);
    setLiveContextState(liveContextState);
  }

  return (
    <>
    {
      Array.from(liveContextState.entries()).map(
        ([id, context]) => <Track
          key={id}
          type={context.type}
          onChange={(option) => onChangeTrackState(id, option)}
        />
      )
    }
    </>
  );
}