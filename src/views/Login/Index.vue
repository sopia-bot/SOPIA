<!--
 * Index.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<!-- S: Login Dialog -->
	<v-dialog
		v-model="show"
		persistent
		max-width="450px"
		width="80%">
		<v-card>
			<v-row class="ma-0">
				<v-col cols="12" align="center">
					<v-card-title class="text-center d-block">
						{{ $t('app.login.title') }}
					</v-card-title>
					<v-card-text>
						<v-text-field
							:label="$t('app.login.id')"
							v-model="sopiaAuth.id"
							color="indigo"
							prepend-icon="mdi-account"
							type="text"
							></v-text-field>

						<v-text-field
							:label="$t('app.login.password')"
							v-model="sopiaAuth.pw"
							color="indigo"
							prepend-icon="mdi-lock"
							type="password"
							></v-text-field>
						<v-btn
							block dark
							tile
							@click="loginSopia"
							color="indigo darken-3">{{ $t('login') }}</v-btn>
					</v-card-text>
				</v-col>
			</v-row>
		</v-card>
	</v-dialog>
	<!-- E: Login Dialog -->
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class Login extends Mixins(GlobalMixins) {

	@Prop(Boolean) public show!: boolean;

	public sopiaAuth = {
		id: '',
		pw: '',
	};

	public async loginSopia() {
		try {
			const res = await this.$api.login(this.sopiaAuth.id, this.sopiaAuth.pw);
			console.log(res);

			//this.spoonLogin(this.sopiaAuth.id, this.sopiaAuth.pw);
		} catch(err) {
		}
	}

	public async spoonLogin(id: string, pw: string ) {
		window.user = await this.$sopia.login(id, pw, LoginType.PHONE);
		this.$evt.$emit('user', window.user);
			this.loginDialog = false;
	}

}
</script>
