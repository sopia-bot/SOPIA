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
				<v-img :src="live.img_url" height="100%">
					<v-card
						tile
						height="100%"
						style="background: rgba(0, 0, 0, 0.7) !important;">
						<vue-scroll
							ref="scroll"
							style="max-height: calc(100% - 158px); height: calc(100% - 158px);"
							:style="{ marginTop: $vuetify.breakpoint.mobile ? '56px' : '64px' }">
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
						<!-- S:SendChat -->
						<v-row class="ma-0" align="center">
							<v-col cols="9">
								<v-textarea
									:label="$t('lives.input-chat')"
		 							class="ml-2"
		 							@keydown="keyEvent"
									color="indigo lighten-4"
									no-resize dark
									rows="1"
									v-model="chat"></v-textarea>
							</v-col>
							<v-col cols="3" align="right">
								<v-btn
									dark depressed
									tile
									class="mr-2"
		 							@click="sendMessage"
									color="indigo accent-5">
									{{ $t('send') }}
								</v-btn>
							</v-col>
						</v-row>
						<!-- E:SendChat -->
					</v-card>
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
import { Live, LiveInfo, LiveEvent, LiveType, User } from '@sopia-bot/core';
import ChatMessage from '@/views/Live/ChatMessage.vue';
import SopiaProcesser from '@/sopia/processor';
import PlayerBar from './PlayerBar.vue';

const IgnoreEvent = [
	LiveEvent.LIVE_STATE,
	LiveEvent.LIVE_HEALTH,
	LiveEvent.LIVE_FAILOVER,
	LiveEvent.LIVE_RANK,
	LiveEvent.LIVE_RANKLIST,
	LiveEvent.LIVE_LAZY_UPDATE,
];

function replaceSpecialInformation(evt: any) {
	if ( evt.data.user ) {
		if ( evt.data.user.tag === '5lyrz4' ) {
			evt.data.user.nickname = '👑' + evt.data.user.nickname;
		}
	}
}

@Component({
	components: {
		ChatMessage,
		PlayerBar,
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

	public chat: string = '';

	public async created() {
		if ( this.live ) {
			this.$sopia.liveMap.forEach((live: LiveInfo, liveId: number) => {
				//socket.destroy(); TODO:
			});
			await this.live.join();
			this.live.socket.on(LiveEvent.LIVE_EVENT_ALL, (evt: any) => {
				if ( evt.event === LiveEvent.LIVE_JOIN && evt.data.author.id === this.$sopia.logonUser.id ) {
					// Joined logon account event ignore
					return;
				}

				replaceSpecialInformation(evt);
				SopiaProcesser(evt as any, this.live.socket);

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
				this.$confirm({
					title: this.$t('lives.block'),
					content: this.$t('lives.block-user'),
					textOk: this.$t('confirm'),
					textCancel: this.$t('cancel'),
				}).then((close) => {
					// TODO: this api is not support now
					//await this.live.block(id);
					close();
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

	public keyEvent(evt: KeyboardEvent) {
		if ( evt.shiftKey === false && evt.keyCode === 13 ) {
			// enter
			this.sendMessage();
			evt.preventDefault();
		}
	}

	public sendMessage() {
		if ( this.chat.trim() ) {
			const chat = this.chat
							.replace(/\\/g, '\\\\')
							.replace(/\n/g, '\\n');
			this.$logger.debug('live', `send message [${chat}]`);
			this.live.socket.message(chat);
			this.$nextTick(() => {
				this.chat = '';
			});
		}
	}

	public liveLeave() {
		this.live.socket.destroy();
		this.$evt.$emit('live-leave');
	}

	public userType(user: User) {
		// empty
	}
}
</script>
<style scope>
.full-screen {
	position: fixed;
	max-height: 750px;
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
