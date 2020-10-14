<!--
 * ChatMessage.vue
 * Created on Mon Oct 12 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-list color="transparent">
		<v-list-item>
			<v-list-item-avatar
				style="cursor: pointer;"
				@click="$assign('/user/' + msg.author.id)">
				<v-img :src="msg.author.profile_url"></v-img>
			</v-list-item-avatar>

			<v-list-item-content>
				<span
					class="white--text"
					v-text="msg.author.nickname"></span>
			</v-list-item-content>

			<v-list-item-action>
				<v-list-item-action-text>
					<v-btn
						small icon
						dark
						@click="blockUser(msg.author.id)"
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
				<v-list-item-content class="mx-4">
					<pre style="white-space: pre-wrap;" v-text="msg.message"></pre>
				</v-list-item-content>
			</v-card>
		</v-list-item>
	</v-list>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class ChatMessage extends Mixins(GlobalMixins) {
	@Prop(Object) public msg!: any;

	public blockUser(id: number) {
		this.$evt.$emit('live-block', id);
	}
}
</script>
