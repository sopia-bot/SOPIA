import { Button } from "primereact/button";
import { Checkbox } from 'primereact/checkbox';
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useState, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Dialog } from "primereact/dialog";
import styled from "styled-components";
import { useSopiaAPI } from "../../api";
import { marked } from 'marked';
import { Toast } from 'primereact/toast';
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { toastStates } from "../../store";

const Wrapper = styled.div`
min-width: 100vw;
`

export default function SopiaSignin() {
	const { t } = useTranslation();
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [agree, setAgree] = useState(false);
	const [visible, setVisible] = useState(false);
	const [content, setContent] = useState('');
	const toast = useRef<Toast>(null);
	const navigate = useNavigate();
	const [globalToast, setGlobalToast] = useRecoilState(toastStates);

	const api = useSopiaAPI();

	const getContent = async (type: string) => {
		switch ( type ) {
			case 'term':
				setVisible(true);
				const { data:[term] } = await api.content.getTerm();
				setContent(marked.parse(term));
				break;
			case 'privacy':
				const { data:[privacy] } = await api.content.getPrivacy();
				setVisible(true);
				setContent(marked.parse(privacy));
				break;
		}
	}

	const signinSopia = async () => {
		let errorMessage = '';
		if ( id.length < 4 ) {
			errorMessage = t('signin.error.id_length') || '';
		} else if ( password.length < 8 ) {
			errorMessage = (t('signin.error.pw_length') || '');
		} else if ( password !== passwordConfirm ) {
			errorMessage = (t('signin.error.fail_chk_pw') || '');
		} else if ( !agree ) {
			errorMessage = t('signin.error.policy') || '';
		}

		try {

			if ( errorMessage ) {
				throw new Error(errorMessage);
			}
			const res = await api.auth.signin(id, password);
			if ( res.error ) {
				throw new Error(t('signin.error.' + res.msg) || '');
			}

			setGlobalToast({
				severity: 'success',
				summary: t('success'),
				detail: t('signin.success'),
				life: 3000,
			});
			setId('');
			setPassword('');
			setPasswordConfirm('');


			navigate('/login/sopia');
		} catch ( err: any ) {
			toast.current?.show({
				severity: 'error',
				summary: t('error'),
				detail: err.message,
				life: 300000,
			});
		}
	}

	return (
		<Wrapper className='flex window-full-h flex-wrap align-content-center justify-content-center'>
			<Toast ref={toast} />
			<Dialog visible={visible} onHide={() => setVisible(false)}>
				<div dangerouslySetInnerHTML={{ __html: content }}></div>
			</Dialog>
			<div className='flex flex-column'>
				<h1 className='text-center my-4 text-primary-900'>{ t('signin.title') }</h1>
				
				<InputText value={id} onChange={(e) => setId(e.target.value)} placeholder={t('id') || 'id'} />
				<Password
					toggleMask
					className='mt-2'
					value={password}
					inputStyle={{width: "100%"}}
					onChange={(e) => setPassword(e.target.value)}
					placeholder={t('password') || 'password'}/>
				<Password toggleMask feedback={false} inputStyle={{width: "100%"}} className='mt-2' value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={t('password_confirm') || 'input_password_confirm'} />

				<div className="flex align-content-center justify-content-center mt-2">
					<Checkbox className="my-auto mr-2" inputId="agree" onChange={(e) => setAgree(e.checked)} checked={agree} />
					<div className="flex align-content-center justify-center">
						<Trans
							i18nKey="signin.agree"
							components={{
								Term: <Button label={t('signin.term')||'term'} className="p-button-link p-0 text-primary-900" onClick={() => getContent('term')}/>,
								Privacy: <Button label={t('signin.privacy')||'privacy'} className="p-button-link p-0 text-primary-900" onClick={() => getContent('privacy')}/>,
							}} />
					</div>
				</div>
				<Button className='mt-2' label={t('signin.button')||'Signin'} onClick={signinSopia} />
				<Button className='mt-2 p-button-link p-button-danger text-red-500' label={t('signin.back')||'Back'} onClick={() => navigate('/login/sopia')} />
			</div>
		</Wrapper>
	);
}