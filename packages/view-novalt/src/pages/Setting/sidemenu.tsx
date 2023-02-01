import './sidemenu.css';

type SideMenuItemProp = {
	label: string;
	isActive: boolean;
	onClick: () => void;
}

function SideMenuItem(prop: SideMenuItemProp) {
	return <div
		className={`flex flex-wrap align-items-center justify-content-end sidemenu-item ${prop.isActive && 'active'}`}
		onClick={prop.onClick}
		>
		<div className="flex">
			<span className="text-base font-semibold">{prop.label}</span>
		</div>
	</div>
}

type SideMenuProp = {
	model: Pick<SideMenuItemProp, 'label'>[];
	activeIndex: number;
	onChange: (idx: number) => void;
}

export default function SettingSideMenu(prop: SideMenuProp) {
	return <div style={{ width: '100%' }}>
		{
			prop.model.map((item, idx) => <SideMenuItem
				key={'setting-side-menu-' + idx + item.label}
				label={item.label}
				isActive={idx === prop.activeIndex}
				onClick={() => prop.onChange(idx)}
			/>)
		}
	</div>;
}