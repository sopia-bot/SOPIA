import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';

declare global {
	interface Window {
		_sopia: SOPIAFunction;
	}
}

interface SOPIAFunction {
	app: {
		minimize: () => void;
		maximize: () => void;
		quit: () => void;
	}
}

function systemMenu() {

	return (
		<>
			<Button className='p-button-rounded p-button-xxs no-drag p-button-success mr-2' onClick={window._sopia.app.minimize}></Button>
			<Button className='p-button-rounded p-button-xxs no-drag p-button-warning mr-2' onClick={window._sopia.app.maximize}></Button>
			<Button className='p-button-rounded p-button-xxs no-drag p-button-danger'       onClick={window._sopia.app.quit}></Button>
		</>
	)
}

export default function SystemBar() {
	return (
		<>
			<Toolbar right={systemMenu} className="system-bar"></Toolbar>
			<style jsx global>{`
				.p-button-xxs {
					font-size: 0;
					padding: 0;
					width: .75rem;
					height: .75rem;
				}
				.system-bar {
					border-radius: 0;
					padding: 0.6rem;
					-webkit-app-region: drag;
					-webkit-user-select: none;
				}
				.system-bar .no-drag {
					-webkit-app-region: no-drag;
				}
			`}</style>
		</>
	);
}