import { ApiLivesInfo, HttpRequest, Live, User } from "@sopia-bot/core";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpoon } from "../../plugins/spoon";
import PartnerBanner from "./PartnerBanner";
import { useQuery } from '@tanstack/react-query';
import './home.css';

export default function Home() {
	const navigate = useNavigate();
	const spoon = useSpoon();


	const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["partnerUserList"],
    queryFn: async () => {
			const partners = await spoon.api.users.followings(4324890)
				.then((req) => req.res.results);
			
				return (
					await Promise.all(
						partners.filter((user) => user.current_live?.id)
							.map((user) => spoon.api.lives.info(user.current_live.id)),
					) as HttpRequest<ApiLivesInfo.Request, ApiLivesInfo.Response>[]
				)
				.map((r) => r.res.results[0])
				.map((live) => {
					const u = partners.find((user) => live.author.id === user.id);
					live.author = u as User;
					return live;
				});
		}
  });

	if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + (error as any).message;

	return (
		<>
			<PartnerBanner lives={data || []} />
		</>
	);
}