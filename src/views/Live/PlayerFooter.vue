<template>
	<div style="height: 358px;">
		<!-- S:SendChat -->
		<v-row class="ma-0" align="center">
			<v-col cols="1" class="pl-2">
				<v-btn icon large dark :color="value ? 'red lighten-3' : 'white'" @click="$emit('input', !value)">
					<v-icon>{{ value ? 'mdi-close-circle-outline' : 'mdi-plus-circle-outline' }}</v-icon>
				</v-btn>
			</v-col>
			<v-col cols="8" class="pr-0">
				<v-textarea
					:label="$t('lives.input-chat')"
					class="ml-2"
					@keydown="keyEvent"
					color="indigo lighten-4"
					no-resize dark hide-details solo
					rows="1"
					v-model="chat"></v-textarea>
			</v-col>
			<v-col cols="3" align="right" class="pl-0">
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
		<v-row
			v-if="value"
			class="ma-0"
			align="center"
			style="position: relative; overflow-y: auto;"
			:style="{ height: menuHeight, maxHeight: menuHeight }">
			<v-col cols="3" v-for="(menu, idx) of menuList" :key="'menu'+idx" align="center">
				<component :is="menu" :live="live"></component>
			</v-col> 
		</v-row>
	</div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Live } from '@sopia-bot/core';
import { Player } from './player';

@Component
export default class LivePlayerFooter extends Mixins(GlobalMixins) {
	@Prop(Object) public live!: Live;
	@Prop(Boolean) public value!: boolean;
	@Prop(String) public menuHeight!: string;
	@Prop(Object) public player!: Player;
	public chat: string = '';

	public menuList: any[] = [
		() => import('./Menus/Volume.vue'),
		() => import('./Menus/Like.vue'),
	];

	public keyEvent(evt: KeyboardEvent) {
		if ( !evt.shiftKey && evt.keyCode === 13 ) {
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
}
</script>
