import { atom } from "recoil";


export const authorizedStates = atom({
	key: 'AUTH/authorized',
	default: false,
});