import { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import SopiaLogin from "../pages/Login/Sopia";

const routes: RouteObject[] = [
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
				element: <SopiaLogin />
			},
		],
	},
];

export default routes;