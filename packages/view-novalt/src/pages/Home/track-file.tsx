import './track.css';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import SelectFile from '../../components/select-file';
import { TrackFileOption } from '../../plugins/live-context';
import { TrackProps } from './track';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';


export default function TrackFile(prop: TrackProps) {
  const option = prop.option as TrackFileOption;
	const { t } = useTranslation();
	const [filePath, setFilePath] = useState(option.filePath);
	const [trackName, setTrackName] = useState(option.trackName);
  const [mute, setMute] = useState(option.mute);

	useEffect(() => {
		prop.onChange({
			type: 'file',
			trackName,
      mute,
			filePath,
		});
	}, [filePath, trackName, mute]);

	return <Card className='track'>
	<div className={`flex transition-colors transition-duration-500 ${mute ? 'bg-gray-200' : 'bg-blue-50'}`} style={{ height: '100px', }}>
		<div className="flex flex-wrap flex-column flex justify-content-around p-2" style={{
			width: '300px',
      flexGrow: '0', flexShrink: '0'
		}}>
			<div className='flex tooltip-element'>
				<div className='flex justify-content-between w-full'>
					<InputText
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            type="text"
            data-pr-tooltip={t('home.help.name')}
            style={{width: '150px'}}
            className='p-inputtext-sm tooltip-element' />
          <ToggleButton
            checked={mute}
            onLabel=""
            offLabel=""
            onIcon="pi pi-volume-off"
            offIcon="pi pi-volume-up"
            onChange={(e) => setMute(e.target.value)}
            className='border-none p-button-text p-button-rounded track-tool-button'/>
				</div>
			</div>
			<div className='flex tooltip-element' style={{ height: '35px' }} data-pr-tooltip={t('home.help.select_media')}>
        <SelectFile className='w-full' value={filePath} onSelect={(r) => setFilePath(r.filePaths[0])} option={{
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
		<div className={`flex-initial transition-colors transition-duration-500 flex w-full p-2 ${mute ? 'bg-gray-300' : 'bg-blue-100'}`} style={{
      boxShadow: 'inset -15px 0px 10px -15px var(--gray-600), inset 15px 0px 10px -15px var(--gray-600)',
    }}>test</div>
    <div className="flex-initial flex align-items-center">
      <Button onClick={() => prop.onDelete()} icon="pi pi-trash" className='p-button-danger p-button-text h-full'/>
    </div>
	</div>
	</Card>
}