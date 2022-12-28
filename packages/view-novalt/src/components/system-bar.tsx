import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { minimize, toggleMaximize, quit } from '@sopia-bot/bridge';
import './system-bar.css';

function systemMenu() {
	return (
		<>
			<Button className='p-button-rounded p-button-xxs no-drag p-button-success mr-2' onClick={minimize}></Button>
			<Button className='p-button-rounded p-button-xxs no-drag p-button-warning mr-2' onClick={toggleMaximize}></Button>
			<Button className='p-button-rounded p-button-xxs no-drag p-button-danger'       onClick={quit}></Button>
		</>
	)
}

export default function SystemBar() {
	return (
		<>
			<Toolbar right={systemMenu} className="system-bar"></Toolbar>
		</>
	);
}