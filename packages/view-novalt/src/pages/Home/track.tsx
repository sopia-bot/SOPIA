import './track.css';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import SelectFile from '../../components/select-file';

type TrackProps = {
}

export default function Track() {
	const { t } = useTranslation();
	const [filePath, setFilePath] = useState('');
	const [trackName, setTrackName] = useState('');

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
				<SelectFile value={filePath} onSelect={(r) => setFilePath(r.filePaths[0])} option={{
					title: 'Select Media',
					filters: [
						{
							name: 'Audio Files',
							extensions: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
						},
            {
              name: 'All Files',
              extensions: [ '*' ],
            }
					],
          properties: ['openFile'],
				}} />
			</div>
		</div>
		<div className="flex-initial flex">test</div>
	</div>
	</Card>
}