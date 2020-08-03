<!--
 * App.vue
 * Created on Sat Jul 18 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-app style="padding-left: 56px">
		<side-menu />
		<v-sheet id="router-view" tile>
			<transition name="scroll-y-reverse-transition">
			<router-view />
			</transition>
		</v-sheet>
	</v-app>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from './plugins/mixins';
import SideMenu from './views/SideMenu.vue';
import { LoginType, User } from 'sopia-core';

declare global {
	interface Window {
		user: User;
	}
}

@Component({
	components: {
		SideMenu,
	},
})
export default class App extends Mixins(GlobalMixins) {
	public async mounted() {
		window.user = await this.$sopia.login(localStorage.id, localStorage.pw, LoginType.PHONE);
		this.$evt.$emit('user', window.user);
	}
}
</script>
