import { ReactNode } from 'react';
import { 
	Route,
	Routes,
	useLocation,
	Navigate,
} from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './router-wrapper.css';
import routes, { SopiaRouteObject } from '../router';
import { useRecoilValue } from 'recoil';
import { authorizedStates } from '../store';


function CheckAuth({ children }: { children?: JSX.Element }) {
	const authorized = useRecoilValue(authorizedStates);
	if ( !authorized ) return <Navigate to='/login/sopia'/>;
	return <div className='router-wrap'>{children}</div>;
}

function createRouterTree(routes: SopiaRouteObject[] = []): ReactNode {
	return routes.map(route => (
		<Route
			key={route.id || route.path}
			path={route.path}
			element={
				route.element ?
					route.nonauth ?
					<div className='router-wrap'>{route.element}</div>
					: <CheckAuth>{route.element as JSX.Element}</CheckAuth>
				 : undefined
			}>
			{createRouterTree(route.children)}
		</Route>
	));
}

export default function RouterWrapper() {
	const locaion = useLocation();
	return (
		<TransitionGroup className="transition-group">
			<CSSTransition key={location.hash} classNames="pagination" timeout={1000}>
				<Routes>
					{ createRouterTree(routes) }
				</Routes>
			</CSSTransition>
		</TransitionGroup>
	);
}