<template>
	<v-app-bar
		color="grey lighten-4"
		dense
		:elevation="0"
		style="max-height: 48px;"
		class="sopia-title-bar">
		<v-btn icon plain class="mr-2 no-drag" v-if="$route.name !== 'Home'" @click="$assign('/')">
			<v-icon>mdi-arrow-left-thin</v-icon>
		</v-btn>
		<img src="../../assets/sopia-sd.png" width="32px" class="mr-4">
		<span class="text-caption">SOPIA - {{ version }}</span>
		<v-spacer></v-spacer>
		<v-text-field
			v-model="searchText"
			dense solo
			class="no-drag"
			color="primary darken-3"
			:label="$t('app.title.search')"
			append-icon="mdi-magnify"
			hide-details
			@keydown="searchKeyDown"
			@click:append="searchContent"></v-text-field>
		<v-spacer></v-spacer>
		<v-menu
			v-model="avatarMenu"
			:close-on-content-click="false"
			offset-y
			left
			transition="slide-y-transition"
			:nudge-width="250"
			:nudge-bottom="10">
			<template v-slot:activator="{ on, attrs }">
				<v-avatar size="32" class="no-drag" v-bind="attrs" v-on="on">
					<img :src="$store.getters.user.profile_url">
				</v-avatar>
			</template>
			<v-card color="blue-grey lighten-4">
				<v-list-item class="px-2" link @click="$assign(userLink)">
					<v-list-item-avatar color="black">
						<v-img :src="$store.getters.user.profile_url"></v-img>
					</v-list-item-avatar>

					<v-list-item-content>
						<v-list-item-title class="title" style="font-size: 1rem !important;">{{ $store.getters.user.nickname }}</v-list-item-title>
						<v-list-item-subtitle style="font-size: 0.6rem !important;">@{{ $store.getters.user.tag }}</v-list-item-subtitle>
						<v-list-item-action-text class="mt-2">
							<v-btn x-small text class="text-caption text-decoration-underline py-3" @click.stop="spoonLogout">
								<span style="font-size: 0.7rem;">{{ $t('spoon-logout') }}</span>
							</v-btn>
						</v-list-item-action-text>
					</v-list-item-content>
				</v-list-item>
			</v-card>
		</v-menu>

		<v-spacer></v-spacer>

		<v-btn class="no-drag mr-2" plain small icon @click.stop="minimize">
			<v-icon style="font-size: 15px;">mdi-window-minimize</v-icon>
		</v-btn>
		<v-btn class="no-drag mr-2" plain small icon @click.stop="maximize">
			<v-icon style="font-size: 15px;">mdi-window-maximize</v-icon>
		</v-btn>
		<v-btn color="red" class="no-drag" plain small icon @click.stop="quit">
			<v-icon style="font-size: 15px;">mdi-close</v-icon>
		</v-btn>
	</v-app-bar>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import pkg from '../../../package.json';
const { ipcRenderer } = window.require('electron');

@Component
export default class TitleBar extends Mixins(GlobalMixins) {
	public avatarMenu: boolean = false;
	public searchText: string = '';

	public get version() {
		console.log(this.$route);
		return pkg.version;
	}

	public get userLink() {
		return `/user/${this.$store.getters.user.id}`;
	}

	public avatarClick() {
		console.log('click');
	}

	public spoonLogout() {
		this.$cfg.delete('auth.spoon');
		this.$cfg.save();
		this.$store.state.loginDialog = true;
	}

	public maximize() {
		ipcRenderer.send('app:maximize');
	}

	public minimize() {
		ipcRenderer.send('app:minimize');
	}

	public quit() {
		ipcRenderer.send('app:quit');
	}

	public async searchContent() {
		const text = encodeURI(this.searchText);

		this.$assign(`/search/user/${text}`);
	}

	public async searchKeyDown(evt: KeyboardEvent) {
		if ( evt.key === 'Enter' ) {
			// enter
			this.searchContent();
		}
	}

}
</script>
<style>
.sopia-title-bar {
	-webkit-app-region: drag;
	-webkit-user-select: none;
}
.sopia-title-bar .no-drag {
	-webkit-app-region: no-drag;
}
</style>
