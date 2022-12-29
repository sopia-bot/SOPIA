import { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import SopiaLogin from "../pages/Login/Sopia";

export interface SopiaRouteObject extends Omit<RouteObject, 'children'> {
	children?: SopiaRouteObject[];
	nonauth?: boolean;
}

const routes: SopiaRouteObject[] = [
	{
		path: '/home',
		element: <Home/>,
		id: 'home',
	},
	{
		path: '/login',
		id: 'login',
		children: [
			{
				path: 'sopia',
				id: 'login.sopia',
				nonauth: true,
				element: <SopiaLogin />
			},
		],
	},
];

export default routes;