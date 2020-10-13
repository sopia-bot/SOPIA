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
						<vue-scroll style="max-height: calc(100% - 158px); height: calc(100% - 158px);">
						<v-row class="ma-0">
							<v-col cols="12">
								<div
									v-for="(event, idx) of liveEvents"
									:key="idx">
									<chat-message
										v-if="event.event === 'live_message'"
										:msg="event.data"></chat-message>
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
import { Play, SocketManager, LiveEvent } from 'sopia-core';
import ChatMessage from '@/views/Live/ChatMessage.vue';

@Component({
	components: {
		ChatMessage,
	},
})
export default class LivePlayer extends Mixins(GlobalMixins) {
	@Prop(Play) public live!: Play;

	public fullScreen: boolean = true;
	public liveSocket!: SocketManager;
	public liveEvents: any = [];

	public chat: string = '';

	public async created() {
		if ( this.live ) {
			this.$sopia.liveSocketMap.forEach((socket: SocketManager, liveId: number) => {
				socket.destroy();
			});
			this.liveSocket = await this.$sopia.liveManager.liveJoin(this.live);
			this.liveSocket.on(LiveEvent.LIVE_MESSAGE, (evt: any) => {
				console.log('debug', evt);
				this.liveEvents.push(evt);
			});
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
