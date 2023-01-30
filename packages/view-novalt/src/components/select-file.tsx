import { getNodePath, showOpenDialog } from "@sopia-bot/bridge";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const path = getNodePath();

type SelectFileProp = {
	value: string;
	option: Parameters<typeof showOpenDialog>[0];
	placeholder?: string;
	fullPath?: boolean;
	onSelect: (results: Awaited<ReturnType<typeof showOpenDialog>>) => void;
}

export default function SelectFile(prop: SelectFileProp) {
	const [filePath, setFilePath] = useState(prop.value);
	const { t } = useTranslation();
	const selectMediaFile = async () => {
		const results = await showOpenDialog(prop.option);
		if ( results.canceled ) return;

		const [selectedFilePath] = results.filePaths;
		setFilePath(selectedFilePath);
		prop.onSelect(results);
	}

	useEffect(() => {
		setFilePath(prop.value);
	}, [prop.value])
	return <div className='p-inputgroup' onClick={selectMediaFile}>
		<InputText value={prop.fullPath ? filePath : path.basename(filePath)} readOnly placeholder={prop.placeholder||t('select_file')||''} className='p-inputtext-sm' />
		<Button className='p-button-sm' icon='pi pi-angle-right' />
	</div>;
}