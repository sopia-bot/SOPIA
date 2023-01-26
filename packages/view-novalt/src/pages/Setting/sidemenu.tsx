
type SideMenuItemProp = {
	label: string;

}

function SideMenuItem(prop: SideMenuItemProp) {
	return <div></div>
}

type SideMenuProp = {
	model: SideMenuItemProp[];
}

export default function SettingSideMenu(prop: SideMenuProp) {
	return <div>
		{
			prop.model.map((item) => <SideMenuItem label={item.label} />)
		}
	</div>;
}