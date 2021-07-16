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
		<v-list-item class="px-2" link>
			<v-list-item-avatar color="black">
				<v-img :src="user.profile_url"></v-img>
			</v-list-item-avatar>

			<v-list-item-content>
				<v-list-item-title class="title" style="font-size: 1rem !important;">{{ user.nickname }}</v-list-item-title>
				<v-list-item-subtitle style="font-size: 0.6rem !important;">@{{ user.tag }}</v-list-item-subtitle>
			</v-list-item-content>
		</v-list-item>

		<v-divider></v-divider>

		<v-list>
			<v-list-item-group
				color="indigo darken-1"
				v-model="CurPath">
				<div
					v-for="route in Routes"
					v-if="route.isMenu"
					:key="route.name">
					<!-- S:Has Child -->
					<v-list-group
						:prepend-icon="route.icon"
						color="indigo--text text--darken-1"
						:value="isSelectGroup(route.path)"
						v-if="Array.isArray(route.childs)">
						<template v-slot:activator>
							<v-list-item-content>
								<v-list-item-title class="text-uppercase">{{ route.name }}</v-list-item-title>
							</v-list-item-content>
						</template>
						<v-list-item
							v-for="child in route.childs"
							@click="$assign(child.path)"
							:class="CurPath === child.path ? 'indigo lighten-5' : ''"
							:key="route.name + child.name">
							<v-list-item-title class="text-uppercase">
								<span :class="CurPath === child.path ? 'indigo--text' : ''">
									{{ child.name }}
								</span>
							</v-list-item-title>
							<v-list-item-icon>
								<v-icon :class="CurPath === child.path ? 'indigo--text' : ''">{{ child.icon }}</v-icon>
							</v-list-item-icon>
						</v-list-item>
					</v-list-group>
					<!-- E:Has Child -->
					<!-- S:Single -->
					<v-list-item
						v-else
						@click="$assign(route.path)"
						link>
						<v-list-item-icon>
							<v-icon>{{ route.icon }}</v-icon>
						</v-list-item-icon>
						<v-list-item-title class="text-uppercase">{{ route.name }}</v-list-item-title>
					</v-list-item>
					<!-- E:Single -->
				</div>
			</v-list-item-group>
		</v-list>
	</v-navigation-drawer>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { User } from '@sopia-bot/core';
import { routes } from '@/router/';

@Component
export default class SideMenu extends Mixins(GlobalMixins) {

	public readonly Routes: any = routes;
	public CurPath: string = location.pathname;

	public user: any = {
		nickname: 'Not Login',
		tag: 'Not Login',
		profile_url: require('assets/default-profile.png'),
	};

	public mounted() {
		this.$evt.$on('user', (user: User) => {
			if ( user.nickname ) {
				this.user.nickname = user.nickname;
			}

			if ( user.tag ) {
				this.user.tag = user.tag;
			}

			if ( user.profile_url ) {
				this.user.profile_url = user.profile_url;
			}
		});
	}

	public isSelectGroup(key: string) {
		const regx = new RegExp(`^${key.split('/:')[0]}`);
		if ( this.$route.path.match(regx) ) {
			return true;
		}

		return false;
	}

}
</script>
