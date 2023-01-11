import { Button } from 'primereact/button';


export default function BottomBar() {
	return <div className="flex align-items-center" style={{
		height: '65px',
		maxWidth: '100vw',
	}}>
		<div className="flex-auto flex"></div>
		<div className="flex-auto flex justify-content-center ">
			<span className='p-buttonset'>
				<Button label="Live" />
				<Button icon="pi pi-cog" />
			</span>
		</div>
		<div className="flex-auto flex justify-content-end"></div>
	</div>
}