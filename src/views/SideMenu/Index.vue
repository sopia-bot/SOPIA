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

			<v-list>
				<v-list-item-group
					color="indigo darken-1"
					v-model="$route.path">
					<v-list-item
						v-for="route in Routes"
						:key="route.name"
						@click="$assign(route.path)"
						link>
						<v-list-item-icon>
							<v-icon>{{ route.icon }}</v-icon>
						</v-list-item-icon>
						<v-list-item-title>{{ route.name }}</v-list-item-title>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { User } from 'sopia-core';
import { routes } from '@/router/';

@Component
export default class SideMenu extends Mixins(GlobalMixins) {

	public readonly Routes: any = routes;

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
