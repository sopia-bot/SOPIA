import Vue from 'vue';
import Vuex from 'vuex';

import { User } from '@/interface/sopia';

Vue.use(Vuex);

interface State {
	user?: User;
	sideopen: boolean;
	loginDialog: boolean;
}

export default new Vuex.Store({
	state: {
		user: undefined,
		sideopen: false,
		loginDialog: false,
	},
	getters: {
		user(state: State) {
			return state.user;
		},
	},
	mutations: {
		user(state: State, user: User) {
			state.user = user;
		},
	},
	actions: {
	},
	modules: {
	},
});
