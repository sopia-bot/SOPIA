<template>
	<v-main class="custom indigo lighten-5" style="height: 100vh;">
		<vue-scroll @handle-scroll="scrollEvent" style="max-height: calc(100vh - 64px);">
			<div style="max-height: calc(100vh - 58px);">
				<v-row class="ma-0" align="center" v-if="livePartner.length">
					<v-col
						cols="12"
						class="mt-6">
						<h1
							class="ml-3 mt-3 text-center text-overline"
							style="font-size: 1.8rem !important;">{{ $t('home.partner-dj') }}</h1>
					</v-col>
					<v-col cols="12">
						<carousel-3d
							:autoplay="true"
							:autoplayTimeout="5000"
							:autoplayHoverPause="true"
							:animationSpeed="1200"
							:controls-visible="true"
							width="640"
							height="400"
							:clickable="false">
							<slide
								v-for="(live, idx) of livePartner"
								:index="idx"
								:key="live.id"
								style="height: 320px; border: none; border-radius: 15px; margin-top: 40px; background-color:white; box-shadow: 10px 19px 23px -1px rgba(0,0,0,0.18);">
								<v-row
									class="ma-0"
									style="width: 100%; height: 100%;">
									<v-col cols="4" class="pa-0" offset="1">
										<v-img :src="live.img_url" height="100%"></v-img>
									</v-col>
									<v-col cols="6">
										<v-row class="mt-3 ml-2">
											<h2 class="indigo--text text--darken-4">{{ live.title }}</h2>
											<v-spacer></v-spacer>
											<v-btn large icon color="red darken-4">
												<v-icon @click.stop="$evt.$emit('live-join', live)">mdi-play-circle</v-icon>
											</v-btn>
										</v-row>
										<v-row class="ml-2">
											<router-link
												@click.stop="() => {}"
												:to="'/user/' + live.author.id"
												class="text-caption blue-grey--text text--darken-1"
												style="font-size: 1.0rem !important;">
												{{ live.author.nickname }}
											</router-link>
										</v-row>
										<v-row
											class="ml-2 mt-6 pa-6 blue-grey lighten-4 text-caption"
											style="height: 200px; overflow: auto; border-radius: 10px;">
											<span v-html="live.author.description.replaceAll('\n', '<br>')"></span>
										</v-row>
									</v-col>
								</v-row>
							</slide>
						</carousel-3d>
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
		const req = await this.$sopia.api.users.followings(4324890);
		if ( Array.isArray(req.res.results) ) {
			this.$store.commit('partners', req.res.results);
			this.livePartner = (await Promise.all(
					req.res.results.filter((user) => user.current_live?.id)
				.map((user) => this.$sopia.api.lives.info(user.current_live.id)),
			)).map((r) => r.res.results[0])
			.map((live) => {
				const u = req.res.results.find((user) => live.author.id === user.id);
				live.author = u as User;
				return live;
			});
		}
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
}
</script>
