import { RouteObject } from "react-router-dom";
import Home from "../pages/Home/Index";
import SopiaLogin from "../pages/Login/Sopia";
import SopiaSignin from '../pages/Signin/Sopia';
import SpoonLogin from "../pages/Login/Spoon";

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
			{
				path: 'spoon',
				id: 'login.spoon',
				nonauth: true,
				element: <SpoonLogin />
			},
		],
	},
	{
		path: '/signin',
		id: 'signin',
		children: [
			{
				path: 'sopia',
				id: 'signin.sopia',
				nonauth: true,
				element: <SopiaSignin />
			}
		]
	},
	{
		index: true,
		path: '*',
		id: 'index',
		element: 'Hello'
	}
];

export default routes;