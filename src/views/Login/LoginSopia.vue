<!--
 * LoginSopia.vue
 * Created on Fri Jul 02 2021
 *
 * Copyright (c) raravel. Licensed under the MIT License.
-->
<template>
	<div>
		<v-dialog
			v-model="dialog">
			<v-card>
				<v-card-text class="pt-6" v-html="markdown">
					
				</v-card-text>
			</v-card>
		</v-dialog>

		<v-card-title class="text-center d-block">
			{{ signinMode ? $t('app.login.sign-title') : $t('app.login.title') }}
		</v-card-title>
		<v-card-text class="px-14">
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

			<v-checkbox
				v-if="signinMode"
				v-model="policy"
				color="indigo darken-2">
				<template v-slot:label>
					<div>
						<a
							class="indigo--text text--darken-1"
							href="#"
							@click.stop="showTerm">{{ $t('app.login.policy-agree-0') }}</a>
						{{ $t('app.login.policy-agree-1') }}
						<a
							class="indigo--text text--darken-1"
							href="#"
							@click.stop="showPrivacy">{{ $t('app.login.policy-agree-2') }}</a>
						{{ $t('app.login.policy-agree-3') }}
					</div>
				</template>
			</v-checkbox>

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
					@click="signinMode = false; errorMsg = ''"
					>{{ $t('app.login.return-login') }}</v-btn>
			</div>
			<div v-else>
				<v-btn
					block dark
					tile depressed
					@click="loginSopia"
					color="indigo darken-3">{{ $t('login') }}</v-btn>
				<p class="text-caption mt-6">
					{{ $t('app.login.sign-description') }}
					<span
						class="indigo--text text--darken-2 font-weight-bold"
						style="cursor: pointer;"
						@click="signinMode = true; errorMsg = ''">{{ $t('app.login.sign-in') }}</span>
				</p>
			</div>
		</v-card-text>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import * as marked from 'marked/lib/marked.umd.js';

@Component
export default class LoginSopia extends Mixins(GlobalMixins) {

	public auth = { id: '', pw: '', pwChk: '' };
	public errorMsg: string = '';
	public signinMode = false;
	public policy = false;
	public dialog = false;
	public markdown = '';

	public async loginSopia() {
		if ( !this.auth.id.trim() ) {
			this.errorMsg = this.$t('app.login.error.input_id');
			return;
		}
		if ( !this.auth.pw.trim() ) {
			this.errorMsg = this.$t('app.login.error.input_pw');
			return;
		}

		try {
			const user = await this.$api.login(this.auth.id, this.auth.pw);
			if ( !user ) {
				this.errorMsg = this.$t('app.login.error.login_fail');
				return;
			}

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

		if ( !this.policy ) {
			this.errorMsg = this.$t('app.login.error.policy');
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

			await this.$swal({
				icon: 'success',
				title: this.$t('success'),
				html: this.$t('app.login.sign-success'),
			});

			this.auth = { id: '', pw: '', pwChk: '' };
			this.errorMsg = '';
			this.signinMode = false;
		} catch ( err ) {
			this.$logger.err('login', err);
			this.errorMsg = err.message;
		}
	}

	public async showTerm() {
		const res = await this.$api.req('GET', '/contents/term/');
		this.markdown = marked.marked(res.data[0]).replace(/\n/g, '<br>');
		this.dialog = true;
	}

	public async showPrivacy() {
		const res = await this.$api.req('GET', '/contents/privacy/');
		this.markdown = marked.marked(res.data[0]).replace(/\n/g, '<br>');
		this.dialog = true;
	}

}
</script>
