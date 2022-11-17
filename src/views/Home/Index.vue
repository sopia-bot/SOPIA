<template>
	<v-main class="custom white" style="height: 100vh;">
		<vue-scroll @handle-scroll="scrollEvent" style="max-height: calc(100vh - 48px);">
			<div style="max-height: calc(100vh - 48px);">
				<v-row class="ma-0 mb-12" align="center" v-if="livePartner.length">
					<v-col cols="12" class="pa-0">
						<v-row
							class="ma-0 partner-banner-wrapper">
							<div
								style="position: absolute; width: 100%; height: 500px; filter: blur(5px);"
								:style="{ background: `url(${currentBanner.img_url})`, }">
							</div>
							<v-col cols="12" class="pa-0">
								<v-img
									dark contain
									:src="currentBanner.img_url"
									height="500px"
									style="position: absolute; width: 100%;"
									class="partner-banner">
									<v-row align="center" style="height: 100%;" class="ma-0 px-4">
										<v-col cols="12">
											<p class="white--text text-subtitle ma-0" v-html="$t('home.partner-dj')"></p>
											<h1>
												<span class="pink--text text--lighten-4">{{ currentBanner.title }}</span>
												<span class="ml-2 text-caption">({{ currentBanner.author.nickname }})</span>	
											</h1>
											<v-btn text large @click="$evt.$emit('live-join', currentBanner)">
												{{ $t('home.join-live') }}
											</v-btn>
										</v-col>
									</v-row>
								</v-img>
							</v-col>
						</v-row>
						<v-row class="ma-0 partner-slide-nav" style="margin-top: -150px !important;">
							<v-col cols="12">
								<carousel-3d
									:autoplay="true"
									:autoplayTimeout="5000"
									:autoplayHoverPause="true"
									:animationSpeed="1200"
									:controls-visible="true"
									:space="320"
									width="280"
									height="150"
									@before-slide-change="slideChange"
									:clickable="false">
									<slide
										v-for="(live, idx) of livePartner"
										:index="idx"
										:key="live.id"
										style="height: 150px; border: none; border-radius: 15px;">
										<v-hover>
											<template v-slot:default="{ hover }">
												<v-img width="282" height="150" :src="live.img_url">
													<v-expand-x-transition>
														<v-row
															v-if="hover || currentBanner.id === live.id"
															class="ma-0"
															align="center"
															style="width: 100%; height: 100%; background: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 100%);">
															<v-col cols="12">
																<h3 class="white--text">{{ live.title }}</h3>
																<p class="white--text ma-0 text-caption">{{ live.author.nickname }}</p>
															</v-col>
														</v-row>
													</v-expand-x-transition>
												</v-img>
											</template>
										</v-hover>
									</slide>
								</carousel-3d>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
				<v-row v-if="liveSubscribed.length" class="ma-0" align="center">
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

const sleep = (msec: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, msec);
	});
};


@Component({
	components: {
		LiveItem,
	},
})
export default class Home extends Mixins(GlobalMixins) {
	// TODO: liveManager is api request struct
	public liveManager!: any;
	public liveList: Live[] = [];
	public liveSubscribed: Live[] = [];
	public livePartner: Live[] = [];
	public asyncMutex: boolean = false;
	public loadComplete: boolean = false;
	public currentBanner: Live = {} as Live;

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

	public async created() {
		let partners = this.$store.state.partners || [];
		if ( partners.length === 0 ) {
			const req = await this.$sopia.api.users.followings(4324890);
			this.$store.commit('partners', req.res.results);
			partners = req.res.results;
		}

		this.livePartner = (await Promise.all(
			partners.filter((user) => user.current_live?.id)
			.map((user) => this.$sopia.api.lives.info(user.current_live.id)),
		)).map((r) => r.res.results[0])
		.map((live) => {
			const u = partners.find((user) => live.author.id === user.id);
			live.author = u as User;
			return live;
		});
		this.currentBanner = this.livePartner[0];
	}

	public async mounted() {
		this.$evt.$on('user', async (user: User) => {
			this.liveSubscribed = [];
			if ( user.current_live_id ) {
				const myLiveId = user.current_live_id;
				const myLiveReq = await this.$sopia.api.lives.info(myLiveId);
				const myLive = myLiveReq.res.results[0];
				this.liveSubscribed.push(myLive);
			}

			const req = await this.$sopia.api.lives.subscribed();
			const lives = req.res.results;
			for ( const live of lives ) {
				this.liveSubscribed.push(live);
			}
		});
		this.getNextLiveList();
		if ( window.user ) {
			this.liveSubscribed = [];
			if ( window.user.current_live_id ) {
				const myLiveId = window.user.current_live_id;
				const myLiveReq = await this.$sopia.api.lives.info(myLiveId);
				const myLive = myLiveReq.res.results[0];
				this.liveSubscribed.push(myLive);
			}

			const req = await this.$sopia.api.lives.subscribed();
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

	public slideChange(idx: number) {
		this.currentBanner = this.livePartner[idx];
	}
}
</script>
<style>
.partner-slide-nav {
	position: absolute;
	width: 100%;
	height: 200px;
	background: linear-gradient(0deg, rgba(255,255,255,1) 25%, rgba(255,255,255,0.469625350140056) 53%, rgba(255,255,255,0) 100%);

}
.partner-banner-wrapper {
	height: 500px;
	position: relative;
	background-position-x: left;
	background-position-y: center;
}
div.v-image.partner-banner .v-image__image {
	background-position: unset !important;
	background-position-x: right !important;
}
div.v-image.partner-banner div.v-responsive__content {
	background: linear-gradient(45deg, rgba(2,0,36,1) 0%, rgba(1,0,21,0.8029586834733894) 0%, rgba(0,0,0,0) 73%);

}
</style>