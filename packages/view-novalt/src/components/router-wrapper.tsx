import { ReactNode } from 'react';
import { 
	Route,
	RouteObject,
	Routes,
	useLocation,
} from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './router-wrapper.css';
import routes from '../router';

function createRouterTree(routes: RouteObject[] = []): ReactNode {
	return routes.map(route => (
		<Route
			key={route.id || route.path}
			path={route.path}
			element={
				route.element ?
				<div className='router-wrap'>
					{route.element}
				</div> : undefined
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