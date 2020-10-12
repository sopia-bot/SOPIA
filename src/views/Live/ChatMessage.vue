<!--
 * ChatMessage.vue
 * Created on Mon Oct 12 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-list color="transparent">
		<v-list-item>
			<v-list-item-avatar>
				<v-img :src="msg.author.profile_url"></v-img>
			</v-list-item-avatar>

			<v-list-item-content>
				<span
					class="white--text"
					v-text="msg.author.nickname"></span>
			</v-list-item-content>
		</v-list-item>
		<v-list-item>
			<v-list-item-avatar>
			</v-list-item-avatar>
			<v-card
				tile dark
				width="100%"
				style="background: rgba(0, 0, 0, 0.5);">
				<v-list-item-content class="mx-4">
					<pre v-text="msg.message"></pre>
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
}
</script>
