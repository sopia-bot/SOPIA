import { atom } from "recoil";
import { ToastMessage } from "primereact/toast";

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