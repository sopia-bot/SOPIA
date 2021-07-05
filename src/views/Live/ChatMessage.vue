<!--
 * ChatMessage.vue
 * Created on Mon Oct 12 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<div>
		<v-list color="transparent" v-if="evt.event === LiveEvent.LIVE_MESSAGE || evt.event === LiveEvent.LIVE_PRESENT">
			<v-list-item>
				<v-list-item-avatar
					style="cursor: pointer;"
					@click="$assign('/user/' + evt.data.author.id)">
					<v-img :src="evt.data.author.profileUrl"></v-img>
				</v-list-item-avatar>

				<v-list-item-content>
					<span
						class="white--text"
						v-text="evt.data.author.nickname"></span>
				</v-list-item-content>

				<v-list-item-action>
					<v-list-item-action-text>
						<v-btn
							small icon
							dark
							@click="blockUser(evt.data.author.id)"
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
					style="background: rgba(0, 0, 0, 0.5);">
					<v-list-item-content v-if="evt.event === LiveEvent.LIVE_MESSAGE" class="mx-4">
						<pre style="white-space: pre-wrap;" v-text="evt.data.message"></pre>
					</v-list-item-content>
					<v-list-item-content v-else-if="evt.event === LiveEvent.LIVE_PRESENT" class="mx-4">
						<img style="width: 100%;" :src="getStickerImg()"></img>
						<h4 class="text-center mb-3">
							{{ evt.data.amount }}{{ $t('spoon') }}
							<span v-if="evt.data.combo > 1" class="font-weight-bold indigo--text text--accent-1">X {{ evt.data.combo }}</span>
						</h4>
					</v-list-item-content>
				</v-card>
			</v-list-item>
		</v-list>
		<p
			class="indigo--text text--lighten-4 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_JOIN">
			{{ evt.data.author.nickname }}{{ $t('lives.notice.join') }}
		</p>
		<p
			class="indigo--text text--lighten-4 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_LIKE">
			{{ evt.data.author.nickname }}{{ $t('lives.notice.like') }}
		</p>
		<p
			class="red--text text--lighten-2 font-weight-bold mt-4"
			style="overflow-wrap: anywhere;"
			v-else-if="evt.event === LiveEvent.LIVE_BLOCK">
			{{ evt.data.author.nickname }}{{ $t('lives.notice.block') }}
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
import { LiveEvent } from 'sopia-core';

@Component({
	data: () => {
		return {
			LiveEvent,
		};
	},
})
export default class ChatMessage extends Mixins(GlobalMixins) {
	@Prop(Object) public evt: any;

	public blockUser(id: number) {
		this.$evt.$emit('live-block', id);
	}

	public getStickerImg() {
		return (this.$sopia.findSticker(this.evt.data.sticker)?.imageThumbnail) as string;
	}
}
</script>
