import './track.css';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { useTranslation } from 'react-i18next';
import { showOpenDialog, getNodePath } from '@sopia-bot/bridge';
import { useEffect, useState } from 'react';
const path = getNodePath();

type TrackProps = {
}

export default function Track() {
	const { t } = useTranslation();
	const [filePath, setFilePath] = useState('');
	const [trackName, setTrackName] = useState('');

	const selectMediaFile = async () => {
		const results = await showOpenDialog({
			title: 'Select Media',
			filters: [
				{
					name: 'Audio Files',
					extensions: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
				},
			],
		});
		if ( results.canceled ) return;

		const [filePath] = results.filePaths;
		setFilePath(filePath);
	}

	useEffect(() => {

	}, [filePath, trackName]);

	return <Card className='track'>
	<Tooltip target=".tooltip-element" />
	<div className="flex" style={{ height: '100px', backgroundColor: 'var(--blue-50)' }}>
		<div className="flex-initial flex-column flex p-1" style={{
			width: '200px',
		}}>
			<div className='flex tooltip-element'>
				<div className='flex'>
					<InputText value={trackName} onChange={(e) => setTrackName(e.target.value)} type="text" style={{width: '150px'}} className='p-inputtext-sm' />
				</div>
			</div>
			<div className='flex tooltip-element' style={{ height: '35px' }} data-pr-tooltip={t('home.help.select_media')}>
				<div className='p-inputgroup' onClick={selectMediaFile}>
					<InputText value={path.basename(filePath)} readOnly placeholder={t('select_file')||''} className='p-inputtext-sm' />
					<Button className='p-button-sm' icon='pi pi-angle-right' />
				</div>
			</div>
		</div>
		<div className="flex-initial flex">test</div>
	</div>
	</Card>
}