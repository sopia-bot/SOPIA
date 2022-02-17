<!--
 * Index.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main class="custom indigo lighten-5" style="height: 100vh;">
		<search-header></search-header>
		<vue-scroll @handle-scroll="scrollEvent" style="max-height: calc(100vh - 64px);">
			<div style="max-height: calc(100vh - 58px);">
				<v-row v-if="liveList" class="ma-0" align="center">
					<v-col
						cols="12"
						class="mt-6">
						<h2 class="ml-3">{{ $t('home.following-dj') }}</h2>
					</v-col>
					<v-col
						v-for="(live, idx) in liveSubscribed" :key="'sub' + idx + live.id"
						cols="12"
						sm="6"
						md="4"
						lg="3"
						xl="2">
						<!-- S:Live Item -->
						<live-item :live="live" />
						<!-- E:Live Item -->
					</v-col>
				</v-row>
				<v-row v-if="liveList" class="ma-0" align="center">
					<v-col
						cols="12"
						class="mt-6">
						<h2 class="ml-3">{{ $t('home.now-live') }}</h2>
					</v-col>
					<v-col
						v-for="(live, idx) in liveList" :key="'' + idx + live.id"
						cols="12"
						sm="6"
						md="4"
						lg="3"
						xl="2">
						<!-- S:Live Item -->
						<live-item :live="live" />
						<!-- E:Live Item -->
					</v-col>
				</v-row>
			</div>
		</vue-scroll>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Live, User } from '@sopia-bot/core';
import LiveItem from './LiveItem.vue';
import SearchHeader from '../Search/Header.vue';

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};


@Component({
	components: {
		LiveItem,
		SearchHeader,
	},
})
export default class Home extends Mixins(GlobalMixins) {
	// TODO: liveManager is api request struct
	public liveManager!: any;
	public liveList: Live[] = [];
	public liveSubscribed: Live[] = [];
	public asyncMutex: boolean = false;
	public loadComplete: boolean = false;

	// TODO: Can setting audult content
	public async getNextLiveList() {

		if ( this.loadComplete || this.asyncMutex ) {
			return;
		}
		this.asyncMutex = true;

		if ( this.liveManager ) {

			if ( this.liveManager.res.next === '' ) {
				this.loadComplete = true;
			} else {
				const res = await this.liveManager.next();
				this.liveManager.res = res;
				this.liveList = this.liveList.concat(res.results);
			}
		} else {
			this.liveManager = await this.$sopia.api.lives.popular();
			this.liveList = this.liveManager.res.results;
		}

		this.asyncMutex = false;
	}

	public async mounted() {
		this.$evt.$on('user', async (user: User) => {
			this.liveSubscribed = [];
			if ( user.current_live ) {
				const myLiveId = user.current_live.id;
				const myLiveReq = await this.$sopia.api.lives.info(myLiveId);
				const myLive = myLiveReq.res.results[0];
				this.liveSubscribed.push(myLive);
			}

			const req = await this.$sopia.api.lives.subcribed();
			const lives = req.res.results;
			for ( const live of lives ) {
				this.liveSubscribed.push(live);
			}
		});
		this.getNextLiveList();
		if ( window.user ) {
			this.liveSubscribed = [];
			if ( window.user.current_live ) {
				const myLiveId = window.user.current_live.id;
				const myLiveReq = await this.$sopia.api.lives.info(myLiveId);
				const myLive = myLiveReq.res.results[0];
				this.liveSubscribed.push(myLive);
			}

			const req = await this.$sopia.api.lives.subcribed();
			const lives = req.res.results;
			for ( const live of lives ) {
				this.liveSubscribed.push(live);
			}
		}
	}

	public scrollEvent(vertical: any) {
		if ( vertical.process >= 0.9 ) {
			this.getNextLiveList();
		}
	}
}
</script>
