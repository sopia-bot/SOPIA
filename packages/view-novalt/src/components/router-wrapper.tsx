import { lazy, Suspense, useEffect } from 'react';
import { 
	createHashRouter,
	Route,
	HashRouter,
	Routes,
	useLocation,
} from 'react-router-dom';
import { CSSTransition, Transition, TransitionGroup } from 'react-transition-group';
import Home from '../pages/Home';
import SopiaLogin from '../pages/Login/Sopia';
import './router-wrapper.css';

const router = createHashRouter([
	{
		path: '/home',
		element: <Home/>,
		id: 'home',
	},
	{
		path: '/login',
		children: [
			{
				path: 'sopia',
				element: <SopiaLogin />
			},
		],
	},
])

export default function RouterWrapper() {
	const locaion = useLocation();
	return (
		<TransitionGroup className="transition-group">
			<CSSTransition key={location.hash} classNames="pagination" timeout={1000}>
				<Routes>
					<Route path="/home" element={<div className='wrap'><Home /></div>} />
					<Route path="/login">
						<Route path="sopia" element={
							<SopiaLogin />
						} />
					</Route>
				</Routes>
			</CSSTransition>
		</TransitionGroup>
	);
}