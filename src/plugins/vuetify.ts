import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { UserVuetifyPreset } from 'vuetify';

Vue.use(Vuetify);

import ko from '../languages/ko/';

export default new Vuetify({
	'lang': {
			'locales': { ko },
			'current': 'ko',
	},
} as UserVuetifyPreset);
