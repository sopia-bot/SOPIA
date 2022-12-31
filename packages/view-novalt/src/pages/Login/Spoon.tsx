import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password'
import { Button } from 'primereact/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { useSopiaAPI } from '../../api';
import { toastStates } from '../../store';
import { useRecoilState } from 'recoil';
import { TabMenu } from 'primereact/tabmenu';

const Wrapper = styled.div`
	min-width: 100vw;
`


export default function SpoonLogin() {
	const { t } = useTranslation();
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const [findIdDialogVisible, setFindIdDialogVisible] = useState(false);
	const [spoonId, setSpoonId] = useState('');
	const api = useSopiaAPI();
	const [toast, setToast] = useRecoilState(toastStates);
	const [tabIndex, setTabIndex] = useState(0);


	const loginSpoon = async () => {
		let errorMessage = '';
		if ( !id.trim() ) {
			errorMessage = t('login.error.input_id');
		} else if ( !password.trim() ) {
			errorMessage = t('login.error.input_pw');
		}

		try {
			if ( errorMessage ) throw new Error(errorMessage);

			const user = await api.auth.login(id, password);
			if ( !user ) {
				throw new Error(t('app.login.error.login_fail') || '');
			}

			
		} catch ( err: any ) {
			setToast({
				severity: 'error',
				summary: t('error'),
				detail: err.message,
				life: 3000,
			});
		}
	}

	return (
		<Wrapper className='flex window-full-h flex-wrap align-content-center justify-content-center'>
			<Dialog
				header={t('login.sopia.search_id')||''}
				modal
				onHide={() => setFindIdDialogVisible(false)}
				visible={findIdDialogVisible}>
				<p>{t('login.sopia.input_spoon_id')}</p>
				<div className='flex'>
					<InputText
						className='block'
						value={spoonId}
						style={{width: '100%'}}
						onChange={(e) => setSpoonId(e.target.value)} />
				</div>
			</Dialog>
			<div className='flex flex-column'>
				<h1 className='text-center my-2 text-primary-900'>{ t('login.spoon.title') }</h1>
				<p className='text-sm line-height-2 text-center'>
					<Trans
						i18nKey='login.spoon.description'
						components={{ Link: <Link className='text-primary' to='/signin/sopia' />, }}
					/>
				</p>
				<TabMenu model={[
					{ label: t('login.spoon.phone') || 'Phone', icon: 'pi pi-phone' },
					{ label: t('login.spoon.email') || 'Email', icon: 'pi pi-envelope' },
				]}
				className='flextab mb-3'
				style={{width: '100%'}}
				activeIndex={tabIndex}
				onTabChange={({ index }) => setTabIndex(index)} />
				<InputText value={id} onChange={(e) => setId(e.target.value)} placeholder={t('login.spoon.spoon_id') || 'id'} />
				<Password toggleMask inputStyle={{ width: '100%' }} feedback={false} className='mt-2' value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('login.spoon.spoon_pw') || 'password'} />
				<Button
					className='mt-2'
					style={{
						backgroundColor: 'var(--red-500)',
						borderColor: 'var(--red-500)',
					}}
					label={t('login.button')||'Login'}
					onClick={loginSpoon}
				/>

				<Button className='mt-2 text-900 p-button-text p-button-raised' style={{ backgroundColor: 'var(--surface-0)' }} icon='pi pi-google' label={t('login.spoon.google')||'Google Login'} onClick={loginSpoon} />
				<Button className='mt-2 p-button-raised' icon='pi pi-facebook' label={t('login.spoon.facebook')||'Facebook Login'} onClick={loginSpoon} />
				<Button className='mt-2 p-button-raised p-button-secondary' style={{ backgroundColor: 'var(--surface-900)' }} icon='pi pi-apple' label={t('login.spoon.apple')||'Apple Login'} onClick={loginSpoon} />

				{/*
				<Button
					label={t('login.sopia.forgot_id')||''}
					className='p-button-link text-gray-700 mt-3 text-center text-sm'
					onClick={(e) => {
						e.preventDefault();
						setFindIdDialogVisible(true);
					}}
				/>
				*/}
			</div>
		</Wrapper>
	)
}