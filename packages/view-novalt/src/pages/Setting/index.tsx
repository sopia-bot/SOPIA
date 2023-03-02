import { useState } from "react";
import { useTranslation } from "react-i18next";
import LiveSetting from "./live";
import { RecordSetting } from "./record";
import SettingSideMenu from "./sidemenu";

export default function Setting() {
	const [activeIndex, setActiveIndex] = useState(0);
	const { t } = useTranslation();
	const items = [
		{
			label: t('setting.sidemenu.live'),
			element: <LiveSetting />,
		},
    {
      label: t('setting.sidemenu.record'),
      element: <RecordSetting />,
    },
	];

	const onSidemenuChange = (idx: number) => {
		setActiveIndex(idx);
	}
	
	return <div className="block">
		<div className="flex flex-wrap flex-row">
			<div className="flex flex-initial shadow-2" style={{ width: '200px', height: 'var(--wrapper-height)' }}>
				<SettingSideMenu model={items} activeIndex={activeIndex} onChange={onSidemenuChange} />
			</div>
			<div className="flex flex-1" style={{ maxHeight: 'var(--wrapper-height)', overflow: 'auto' }}>
				<div style={{
					width: '100%',
				}}>{items[activeIndex].element}</div>
			</div>
		</div>
	</div>;
}