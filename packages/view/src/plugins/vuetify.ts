import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import { UserVuetifyPreset } from 'vuetify';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

import ko from '../languages/ko/';

export default new Vuetify({
	lang: {
			locales: { ko },
			current: 'ko',
	},
	theme: {
		themes: {
			light: {
				primary: colors.indigo,
			},
		},
	},
} as UserVuetifyPreset);
