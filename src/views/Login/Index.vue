<!--
 * Index.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<!-- S: Login Dialog -->
	<v-dialog
		v-model="value"
		persistent
		max-width="450px"
		width="80%">
		<v-card>
			<v-row class="ma-0">
				<v-col cols="12" align="center">
					<login-sopia v-if="sopiaShow" @logon="sopiaLogon"/>
					<login-spoon v-if="spoonShow" @logon="spoonLogon"/>
				</v-col>
			</v-row>
		</v-card>
	</v-dialog>
	<!-- E: Login Dialog -->
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { UserDto } from '@sopia-bot/api-dto';
import { LogonUser } from '@sopia-bot/core';

import LoginSopia from '@/views/Login/LoginSopia.vue';
import LoginSpoon from '@/views/Login/LoginSpoon.vue';
import GlobalMixins from '@/plugins/mixins';

@Component({
	components: {
		LoginSopia,
		LoginSpoon,
	},
})
export default class Login extends Mixins(GlobalMixins) {

	@Prop(Boolean) public value!: boolean;
	public sopiaShow: boolean = false; // 베타 버전은 소피아 서버와 연동하지 않는다.
	public spoonShow: boolean = true;

	public sopiaUser!: UserDto;

	public created() {
		this.$evt.$on('login:skip-sopia-login', (user: UserDto) => {
			this.sopiaUser = user;
			this.sopiaShow = false;
			this.spoonShow = true;
		});
	}

	public async sopiaLogon(user: UserDto) {
		this.sopiaUser = user;
		//this.$cfg.set('sopia')
		if ( this.sopiaUser.spoon_id === '0' ) {
			this.sopiaShow = false;
			this.spoonShow = true;
		} else {
			const { id, token, refresh_token } = this.$cfg.get('auth.spoon') || {};
			if ( !token || !refresh_token ) {
				this.sopiaShow = false;
				this.spoonShow = true;
			} else {
				await this.$sopia.loginToken(id, token, refresh_token);
				this.loginSpoon(this.$sopia.logonUser);
			}
		}
	}

	public async spoonLogon(user: LogonUser) {
		this.$logger.info('Spoon login user', user);
		/*
		if ( this.sopiaUser.spoon_id === '0' ) {
			this.sopiaUser.spoon_id = user.id.toString();
			await this.$api.setUserInfo(this.sopiaUser);
		}
		*/

		/*
		if ( +this.sopiaUser.spoon_id !== user.id ) {
			const close = await this.$modal({
				title: this.$t('msg.alert'),
				content: this.$t('app.login.error.diff_id'),
				textOk: this.$t('confirm'),
			});
			close();
			return;
		}
		*/

		const { id, token, refresh_token } = this.$sopia.logonUser;
		this.$cfg.set('auth.spoon.id', id);
		this.$cfg.set('auth.spoon.token', token);
		this.$cfg.set('auth.spoon.refresh_token', refresh_token);
		this.$cfg.set('auth.sopia', this.sopiaUser);
		this.$cfg.save();

		this.loginSpoon(this.$sopia.logonUser);
	}

	public loginSpoon(user: LogonUser) {
		this.$emit('input', false);
		this.$evt.$emit('user', user);
		this.sopiaShow = false;
		this.spoonShow = false;
	}

}
</script>
