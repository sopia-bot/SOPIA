<!--
 * LoginSopia.vue
 * Created on Fri Jul 02 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
-->
<template>
	<div>
		<v-card-title class="text-center d-block">
			{{ $t('app.login.title') }}
		</v-card-title>
		<v-card-text>
			<v-text-field
				:label="$t('app.login.id')"
				v-model="auth.id"
				color="indigo"
				prepend-icon="mdi-account"
				type="text"
				></v-text-field>

			<v-text-field
				:label="$t('app.login.password')"
				v-model="auth.pw"
				color="indigo"
				prepend-icon="mdi-lock"
				type="password"
				></v-text-field>

			<p class="red--text">{{ errorMsg }}</p>

			<v-btn
				block dark
				tile
				@click="loginSopia"
				color="indigo darken-3">{{ $t('login') }}</v-btn>
		</v-card-text>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class LoginSopia extends Mixins(GlobalMixins) {

	public auth = { id: '', pw: '' };
	public errorMsg: string = '';

	public async loginSopia() {
		try {
			const user = await this.$api.login(this.auth.id, this.auth.pw);
			this.$store.commit('user', user);
			this.errorMsg = '';
		} catch ( err ) {
			this.$logger.err('login', err);
			this.errorMsg = this.$t('app.login.error.' + err.msg);
		}

		this.$evt.$emit('logon', this.$store.getters.user);
	}

}
</script>
