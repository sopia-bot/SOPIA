<!--
 * Player.vue
 * Created on Sat Oct 03 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<div v-if="live && live.id">
		<div v-if="fullScreen">
			<v-card
				tile
				class="full-screen">
				<v-app-bar
					dark
					color="indigo accent-5"
					style="cursor: pointer;"
					@click="fullScreen = false;"
					flat>
					<v-icon left>
						mdi-chevron-down
					</v-icon>
					{{ live.title }}
				</v-app-bar>
				<v-img :src="live.imgUrl" height="100%">
					<v-card
						tile
						height="100%"
						style="background: rgba(0, 0, 0, 0.7) !important;">
						<vue-scroll
							ref="scroll"
							style="max-height: calc(100% - 158px); height: calc(100% - 158px);">
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
			v-else
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
import { Live, LiveSocket, LiveEvent, LiveType, User } from '@sopia-bot/core';
import ChatMessage from '@/views/Live/ChatMessage.vue';
import SopiaProcesser from '@/sopia/processor';

const IgnoreEvent = [
	LiveEvent.LIVE_STATE,
	LiveEvent.LIVE_HEALTH,
	LiveEvent.LIVE_FAILOVER,
	LiveEvent.LIVE_RANK,
	LiveEvent.LIVE_RANKLIST,
];

@Component({
	components: {
		ChatMessage,
	},
	data: () => {
		return {
			LiveEvent,
		};
	},
})
export default class LivePlayer extends Mixins(GlobalMixins) {
	@Prop(Object) public live!: Live;

	public fullScreen: boolean = true;
	public liveSocket!: LiveSocket;
	public liveEvents: any = [];

	public chat: string = '';

	public async created() {
		if ( this.live ) {
			this.$sopia.liveMap.forEach((socket: LiveSocket, liveId: number) => {
				//socket.destroy(); TODO:
			});
			this.liveSocket = await this.live.join();
			this.liveSocket.on(LiveEvent.LIVE_EVENT_ALL, (evt: any) => {
				SopiaProcesser(evt as any, this.liveSocket);

				if ( IgnoreEvent.includes(evt.event) ) {
					return;
				}
				if ( evt.event === LiveEvent.LIVE_JOIN && evt.data.author.id === this.$sopia.logonUser.id ) {
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
			this.$evt.$on('live-block', async (id: number) => {
				this.$confirm({
					title: this.$t('lives.block'),
					content: this.$t('lives.block-user'),
					okText: this.$t('confirm'),
					cancelText: this.$t('cancel'),
					ok: async () => {
						// TODO: this api is not support now
						//await this.live.block(id);
					},
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
			this.liveSocket.message(chat);
			this.$nextTick(() => {
				this.chat = '';
			});
		}
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
