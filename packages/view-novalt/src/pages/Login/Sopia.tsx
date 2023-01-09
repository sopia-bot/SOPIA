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
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from '@sopia-bot/bridge';

const Wrapper = styled.div`
	min-width: 100vw;
`


export default function SopiaLogin() {
	const { t } = useTranslation();
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const [findIdDialogVisible, setFindIdDialogVisible] = useState(false);
	const [spoonId, setSpoonId] = useState('');
	const api = useSopiaAPI();
	const [toast, setToast] = useRecoilState(toastStates);
  const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

  
  const { isLoading, data, } = useQuery({
    queryKey: ['getLogonUser'],
    queryFn: getUserInfo,
  });

  if ( isLoading ) return <>Loading</>

  if ( data ) {
    api.logonUser = data;
  }

	if ( api.logonUser ) {
		navigate('/login/spoon');
		return <>redirect</>;
	}

	const loginSopia = async () => {
		let errorMessage = '';
    setLoading(true);
		if ( !id.trim() ) {
			errorMessage = t('login.error.input_id');
		} else if ( !password.trim() ) {
			errorMessage = t('login.error.input_pw');
		}

		try {
			if ( errorMessage ) throw new Error(errorMessage);

			const user = await api.auth.login(id, password);
			if ( !user ) {
				throw new Error(t('login.error.login_fail') || '');
			}

			navigate('/login/spoon');
		} catch ( err: any ) {
			setToast({
				severity: 'error',
				summary: t('error'),
				detail: err.message,
				life: 3000,
			});
		}
    setLoading(false);
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
				<h1 className='text-center my-2 text-primary-900'>{ t('login.sopia.title') }</h1>
				<p className='text-sm line-height-2 text-center'>
					<Trans
						i18nKey='login.sopia.description'
						components={{ Link: <Link className='text-primary' to='/signin/sopia' />, }}
					/>
				</p>
				<InputText value={id} onChange={(e) => setId(e.target.value)} placeholder={t('id') || 'id'} />
				<Password inputStyle={{width: '100%'}} toggleMask feedback={false} className='mt-2' value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password') || 'password'} />
				<Button loading={loading} className='mt-2' label={t('login.button')||'Login'} onClick={loginSopia} />

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