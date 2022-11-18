<!--
 * ChatMessage.vue
 * Created on Mon Oct 12 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<div class="chat-message">
		<v-list color="transparent" v-if="evt.event === LiveEvent.LIVE_MESSAGE || evt.event === LiveEvent.LIVE_PRESENT">
			<v-list-item>
				<v-list-item-avatar
					style="cursor: pointer;"
					@click="$assign('/user/' + evt.data.user.id)">
					<v-img :src="profileURL"></v-img>
				</v-list-item-avatar>

				<v-list-item-content>
					<span
						class="white--text"
						v-text="author.nickname"></span>
				</v-list-item-content>

				<v-list-item-action>
					<v-list-item-action-text>
						<v-btn
							small icon
							dark
							@click="blockUser(evt.data.user.id)"
							color="red accent-2">
							<v-icon>mdi-account-cancel</v-icon>
						</v-btn>
					</v-list-item-action-text>
				</v-list-item-action>
			</v-list-item>
			<v-list-item>
				<v-list-item-avatar>
				</v-list-item-avatar>
				<v-card
					tile dark
					width="100%"
					style="background: rgba(0, 0, 0, 0.5); border: thin solid rgb(255 255 255 / 30%)">
					<v-list-item-content v-if="evt.event === LiveEvent.LIVE_MESSAGE" class="mx-4">
						<pre style="white-space: pre-wrap;" class="chat-message" v-text="evt.update_component.message.value"></pre>
					</v-list-item-content>
					<v-list-item v-else-if="evt.event === LiveEvent.LIVE_PRESENT" class="mx-4">
						<v-list-item-avatar>
							<v-img style="width: 100%;" :src="stickerImg" />
						</v-list-item-avatar>
						<v-list-item-title>
							<h4>
								{{ evt.data.amount }}{{ $t('spoon') }}
								<span v-if="evt.data.combo > 1" class="font-weight-bold indigo--text text--accent-1">X {{ evt.data.combo }}</span>
							</h4>
						</v-list-item-title>
					</v-list-item>
				</v-card>
			</v-list-item>
		</v-list>
		<p
			class="indigo--text text--lighten-4 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_JOIN">
			{{ author.nickname }}{{ $t('lives.notice.join') }}
		</p>
		<p
			class="indigo--text text--lighten-4 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_LIKE">
			{{ author.nickname }}{{ $t('lives.notice.like') }}
		</p>
		<p
			class="red--text text--lighten-2 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_BLOCK">
			{{ author.nickname }}{{ $t('lives.notice.block') }}
		</p>
		<p
			class="red--text text--lighten-2 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_COMMAND && evt.detail.command === 'chat'">
			{{ evt.detail.user.nickname }}{{ $t('lives.notice.chatban-' + evt.detail.state) }}
		</p>
	</div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { LiveEvent as EventList, User } from '@sopia-bot/core';

@Component
export default class ChatMessage extends Mixins(GlobalMixins) {
	@Prop(Object) public evt: any;
	public LiveEvent = EventList;

	public defaultProfileUrl = require('assets/default-profile.png');

	get author(): User {
		return this.evt.data.user || this.evt.data.author;
	}

	get profileURL() {
		return this.evt.data.user?.profile_url || this.defaultProfileUrl;
	}

	public blockUser(id: number) {
		this.$evt.$emit('live-block', id);
	}

	get stickerImg() {
		return this.$sopia.sticker.findSticker(this.evt.data.sticker)?.image_thumbnail;
	}
}
</script>
<style>
.chat-message {
	font-family: JoyPixels, GangwonEdu_OTFBoldA, sans-serif !important;
}
</style>