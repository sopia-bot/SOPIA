<template>
	<v-app-bar
		dark
		color="indigo accent-5"
		style="cursor: pointer;"
		flat>
		<v-icon left>
			mdi-chevron-down
		</v-icon>
		{{ live.title }}
		<v-spacer></v-spacer>
		<v-btn icon text tile @click.stop="$emit('screen:close')">
			<v-icon>
				mdi-window-minimize
			</v-icon>
		</v-btn>
		<v-btn icon text tile color="red" @click.stop="$emit('close')">
			<v-icon>
				mdi-window-close
			</v-icon>
		</v-btn>
	</v-app-bar>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Live } from '@sopia-bot/core';

@Component
export default class LivePlayerBar extends Mixins(GlobalMixins) {
	@Prop(Object) public live!: Live;
}
</script>