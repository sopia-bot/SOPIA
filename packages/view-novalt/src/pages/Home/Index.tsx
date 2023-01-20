import { ApiLivesInfo, HttpRequest, Live, User } from "@sopia-bot/core";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpoon } from "../../plugins/spoon";
import PartnerBanner from "./PartnerBanner";
import { useQuery } from '@tanstack/react-query';
import './home.css';
import Track from "./track";

export default function Home() {
  const [trackList, setTrackList] = useState([]);

  return (
    <>
      <Track/>
    </>
  );
}