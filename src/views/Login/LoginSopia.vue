<!--
 * LoginSopia.vue
 * Created on Fri Jul 02 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
-->
<template>
	<div>
		<v-card-title class="text-center d-block">
			{{ signinMode ? $t('app.login.sign-title') : $t('app.login.title') }}
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

			<v-text-field
				v-if="signinMode"
				:label="$t('app.login.password-check')"
				v-model="auth.pwChk"
				color="indigo"
				prepend-icon="mdi-lock"
				type="password"
				></v-text-field>

			<p class="red--text">{{ errorMsg }}</p>

			<div v-if="signinMode">
				<v-btn
					block dark
					tile depressed
					@click="signinSopia"
					color="indigo darken-3">{{ $t('app.login.sign-in') }}</v-btn>
				<v-btn
					block depressed
					tile text
					color="red darken-1"
					@click="signinMode = false"
					>{{ $t('app.login.return-login') }}</v-btn>
			</div>
			<div v-else>
				<v-btn
					block dark
					tile depressed
					@click="loginSopia"
					color="indigo darken-3">{{ $t('login') }}</v-btn>
				<v-btn
					block dark text
					tile depressed
					@click="signinMode = true"
					color="indigo darken-3">{{ $t('app.login.sign-in') }}</v-btn>
			</div>
		</v-card-text>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class LoginSopia extends Mixins(GlobalMixins) {

	public auth = { id: '', pw: '', pwChk: '' };
	public errorMsg: string = '';
	public signinMode = false;

	public async loginSopia() {
		try {
			const user = await this.$api.login(this.auth.id, this.auth.pw);
			this.$store.commit('user', user);
			this.errorMsg = '';
			this.$emit('logon', this.$store.getters.user);
		} catch ( err ) {
			this.$logger.err('login', err);
			this.errorMsg = this.$t('app.login.error.' + err.msg);
		}
	}

	public async signinSopia() {
		if ( this.auth.id.length < 4 ) {
			this.errorMsg = this.$t('app.login.error.id_length');
			return;
		}
		if ( this.auth.pw.length < 8 ) {
			this.errorMsg = this.$t('app.login.error.pw_length');
			return;
		}

		if ( this.auth.pw !== this.auth.pwChk ) {
			this.errorMsg = this.$t('app.login.error.fail_chk_pw');
			return;
		}

		try {
			const res = await this.$api.req('PUT', '/auth/sign/', {
				name: this.auth.id,
				id: this.auth.id,
				pw: this.auth.pw,
				gender: -1,
			});
			if ( res.error ) {
				this.errorMsg = this.$t('app.login.error.' + res.msg);
				return;
			}
			this.$modal({
				type: 'success',
				title: this.$t('success'),
				content: this.$t('app.login.sign-success'),
			}).then((close) => {
				this.auth = { id: '', pw: '', pwChk: '' };
				this.signinMode = false;
				close();
			});
		} catch ( err ) {
			this.$logger.err('login', err);
			this.errorMsg = err.message;
		}
	}

}
</script>
