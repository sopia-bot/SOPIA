import { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import SopiaLogin from "../pages/Login/Sopia";
import SopiaSignin from '../pages/Signin/Sopia';

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