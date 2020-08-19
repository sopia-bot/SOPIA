<!--
 * Index.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
		<v-navigation-drawer
			permanent
			fixed
			expand-on-hover
			>
			<v-list>
				<v-list-item class="px-2">
					<v-list-item-avatar color="black">
						<v-img :src="user.profileUrl"></v-img>
					</v-list-item-avatar>
				</v-list-item>

				<v-list-item link>
					<v-list-item-content>
						<v-list-item-title class="title">{{ user.nickname }}</v-list-item-title>
						<v-list-item-subtitle>{{ user.tag }}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</v-list>

			<v-divider></v-divider>

			<v-list
				nav
				dense
				>
				<v-list-item link>
					<v-list-item-icon>
						<v-icon>mdi-folder</v-icon>
					</v-list-item-icon>
					<v-list-item-title>My Files</v-list-item-title>
				</v-list-item>
				<v-list-item link>
					<v-list-item-icon>
						<v-icon>mdi-account-multiple</v-icon>
					</v-list-item-icon>
					<v-list-item-title>Shared with me</v-list-item-title>
				</v-list-item>
				<v-list-item link>
					<v-list-item-icon>
						<v-icon>mdi-star</v-icon>
					</v-list-item-icon>
					<v-list-item-title>Starred</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { User } from 'sopia-core';

@Component
export default class SideMenu extends Mixins(GlobalMixins) {

	public user: User = User.deserialize({
		nickname: 'Not Login',
		tag: 'Not Login',
		profile_url: require('assets/default-profile.png'),
	});

	public mounted() {
		this.$evt.$on('user', (user: User) => {
			if ( user.nickname ) {
				this.user.nickname = user.nickname;
			}

			if ( user.tag ) {
				this.user.tag = user.tag;
			}

			if ( user.profileUrl ) {
				this.user.profileUrl = user.profileUrl;
			}
		});
	}
}
</script>
