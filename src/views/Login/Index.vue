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

	@Prop(Boolean) public show!: boolean;
	public sopiaShow: boolean = false;
	public spoonShow: boolean = true;

	public spoonUser!: UserDto;

	public async sopiaLogon(user: UserDto) {
		if ( user.spoon_id === '0' ) {
			this.sopiaShow = false;
			this.spoonShow = true;
		} else {
			// empty
		}
	}

	public async spoonLogon(user: LogonUser) {
		if ( this.spoonUser.spoon_id === '0' ) {
			this.spoonUser.spoon_id = user.id.toString();
			await this.$api.setUserInfo(this.spoonUser);
		}
	}

}
</script>
