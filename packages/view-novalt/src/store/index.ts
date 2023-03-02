import { atom } from "recoil";
import { ToastMessage } from "primereact/toast";
import { ConfirmDialogProps } from 'primereact/confirmdialog';

export const authorizedStates = atom({
	key: 'AUTH/authorized',
	default: false,
});

export const toastStates = atom<ToastMessage>({
	key: 'CONTEXT/toast',
	default: {
		summary: '',
		detail: '',
		life: 1,
	},
});

export const confirmStates = atom<ConfirmDialogProps>({
  key: 'CONTEXT/confirm',
  default: {
    message: '',
    header: '',
    icon: '',
    accept: () => {},
    reject: () => {},
  }
})

export const liveContextStates = atom({
  key: 'LIVE/status',
  default: 'ready',
});