<!--
 * Player.vue
 * Created on Sat Oct 03 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<div v-if="live && live.id">
		<div v-show="fullScreen">
			<v-card
				tile
				class="full-screen">
				<player-bar :live="live" @screen:close="fullScreen = false" @close="liveLeave"/>
				<v-app-bar
					dark absolute dense flat
					style="margin-top: 58px;"
					v-if="!isManager"
					color="red darken-3">
					<v-app-bar-title class="text-caption">
						{{ $t('lives.error.not-manager') }}
					</v-app-bar-title>
				</v-app-bar>
				<v-img :src="live.img_url" height="100%">
					<div
						class="d-flex"
						style="background: rgba(0, 0, 0, 0.7) !important; flex-direction: column; height: 100%;">
						<vue-scroll
							ref="scroll"
							:style="{
								marginTop: $vuetify.breakpoint.mobile ? '56px' : '64px',
								flexBasis: scrollHeight,
							}"
							style="flex-glow: 1; flex-shrink: 1;">
							<v-row class="ma-0">
								<v-col cols="12">
									<div
										v-for="(event, idx) of liveEvents"
										:key="idx">
										<chat-message :evt="event"></chat-message>
									</div>
								</v-col>
							</v-row>
						</vue-scroll>
						<player-footer
							v-model="footMenuOpen"
							menu-height="230px"
							:live="live"
							:player="player" />
					</div>
				</v-img>
			</v-card>
		</div>
		<div
			v-if="!fullScreen"
			class="minify-button">
			<v-btn
				tile dark
				large
				@click="fullScreen = true;"
				color="indigo accent-5">
				<v-icon left>
					mdi-chevron-up
				</v-icon>
				{{ live.title }}
			</v-btn>
		</div>
	</div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Live, LiveInfo, LiveEvent, LiveType, User, HttpRequest } from '@sopia-bot/core';
import ChatMessage from '@/views/Live/ChatMessage.vue';
import SopiaProcesser from '@/sopia/processor';
import PlayerBar from './PlayerBar.vue';
import PlayerFooter from './PlayerFooter.vue';
import { Player } from './player';
import pkg from '../../../package.json';

const IgnoreEvent = [
	LiveEvent.LIVE_STATE,
	LiveEvent.LIVE_HEALTH,
	LiveEvent.LIVE_FAILOVER,
	LiveEvent.LIVE_RANK,
	LiveEvent.LIVE_RANKLIST,
	LiveEvent.LIVE_LAZY_UPDATE,
];

function replaceSpecialInformation(evt: any) {
	if ( evt.data?.user?.tag === '5lyrz4' ) {
		evt.data.user.nickname = '👑' + evt.data.user.nickname;
	}
	if ( evt.data?.author?.tag === '5lyrz4' ) {
		evt.data.author.nickname = '👑' + evt.data.author.nickname;
	}
}

@Component({
	components: {
		ChatMessage,
		PlayerBar,
		PlayerFooter,
	},
	data: () => {
		return {
			LiveEvent,
			benched: 0,
		};
	},
})
export default class LivePlayer extends Mixins(GlobalMixins) {
	@Prop(Object) public live!: Live;

	public fullScreen: boolean = true;
	public liveEvents: any = [];
	public footMenuOpen: boolean = false;
	public alertTimer!: NodeJS.Timer;
	public managerIds: number[] = [];

	public player: Player = new Player();

	public get scrollHeight() {
		if ( this.footMenuOpen ) {
			return 'calc(100% - 358px)';
		}
		return 'calc(100% - 138px)';
	}

	public get isManager() {
		return this.managerIds.includes(this.$store.getters.user.id);
	}

	public async created() {
		if ( this.live ) {
			this.$sopia.liveMap.forEach((live: LiveInfo, liveId: number) => {
				//socket.destroy(); TODO:
			});

			try {
				await this.live.join();
			} catch (err: any) {
				if ( err.res ) {
					switch ( err.res.error.code ) {
						case 30021:
							this.$swal({
								html: this.$t(`lives.error.30021`),
								toast: true,
								timer: 3000,
								position: 'top-end',
								icon: 'error',
							});
							break;
						default:
							this.$swal({
								html: this.$t(`lives.error.unknown`, err.res.error.code),
								toast: true,
								timer: 3000,
								position: 'top-end',
								icon: 'error',
							});
							break;
					}
					this.liveLeave();
					return;
				}
			}

			this.player.connect(this.live);
			if ( this.$cfg.get('player.isMute') ) {
				this.player.volume = 0;
			} else {
				this.player.volume = (this.$cfg.get('player.volume') ?? 50) * 0.01;
			}
			this.alertTimer = setInterval(() => {
				if ( this.isManager ) {
					this.live.socket.message(this.$t('lives.alert', pkg.version));
				}
			}, 1000 * 60 * 10 /* 10min */);
			this.live.socket.on(LiveEvent.LIVE_EVENT_ALL, (evt: any) => {
				if ( evt?.data?.live?.manager_ids ) {
					this.managerIds = evt.data.live.manager_ids;
				}
				if ( evt.event === LiveEvent.LIVE_JOIN && evt.data.author.id === this.$sopia.logonUser.id ) {
					// Joined logon account event ignore
					return;
				}

				replaceSpecialInformation(evt);
				if ( this.isManager ) {
					SopiaProcesser(evt as any, this.live.socket);
				}

				if ( IgnoreEvent.includes(evt.event) ) {
					return;
				}

				this.liveEvents.push(evt);
				if ( this.liveEvents.length > 100 ) {
					this.liveEvents.shift();
				}

				if ( this.fullScreen ) {
					this.$nextTick(() => {
							const scroll: any = this.$refs['scroll'];
							const { v, h } = scroll.getScrollProcess();
							const size =  scroll?._data?.bar?.vBar?.state?.size || 0;
							if ( (size === 0 || size >= 0.5) || v >= 0.8 ) {
								scroll.scrollBy({ dy: '100%' }, 100, 'easeInQuad');
							}
					});
				}
			});
			this.$evt.$off('live-block');
			this.$evt.$on('live-block', async (id: number) => {
				this.$swal({
					title: this.$t('lives.block'),
					html: this.$t('lives.block-user'),
					showCloseButton: true,
					confirmButtonText: this.$t('confirm'),
					cancelButtonText: this.$t('cancel'),
				}).then((result) => {
					if ( result.isConfirmed ) {
						// TODO: this api is not support now
						//await this.live.block(id);
					}
				});
			});
			{
				const scroll: any = this.$refs['scroll'];
				scroll.scrollBy({ dy: '100%' }, 100, 'easeInQuad');
			}

			// TODO: this api is not support now
			await this.$sopia.sticker.initSignatureSticker(this.live.author.id);
		}
	}

	public beforeUnmount() {
		if ( this.player ) {
			this.player.destroy();
		}
		if ( this.alertTimer ) {
			clearInterval(this.alertTimer);
		}
	}

	public liveLeave() {
		try {
			this.player.destroy();
			if ( this.live?.socket ) {
				console.log(this.live.socket);
				this.live.socket.destroy();
			}
		} catch (err) {
			console.error(err);
		}
		this.$evt.$emit('live-leave');
	}

	public userType(user: User) {
		// empty
	}
}
</script>
<style scope>
.full-screen {
	height: 100vh;
	max-width: 450px;
	width: 100%;
	bottom: 0px;
	right:0px;
	z-index: 1;
}

.minify-button {
	position: fixed;
	max-width: 450px;
	bottom: 0px;
	right:0px;
	z-index: 1;
}
</style>
