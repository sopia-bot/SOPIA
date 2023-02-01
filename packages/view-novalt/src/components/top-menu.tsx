import { TabMenu, TabMenuTabChangeParams } from "primereact/tabmenu";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TopMenu() {
	const { t } = useTranslation();
	const [activeIndex, setActiveIndex] = useState(0);
	const items = [
		{ label: t('menu.home'), icon: 'pi pi-home', href: '/home' },
		{ label: t('menu.setting'), icon: 'pi pi-cog', href: '/setting' },
	];

	const onTabChange = (e: TabMenuTabChangeParams) => {
		setActiveIndex(e.index);
		location.href = '/#' + (e.value as any).href;
	}

	return <TabMenu model={items} activeIndex={activeIndex} onTabChange={onTabChange} />;
}