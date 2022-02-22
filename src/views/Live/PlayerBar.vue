<template>
	<v-app-bar
		dark absolute
		color="indigo accent-5"
		style="cursor: pointer;"
		@click="prominent = !prominent"
		:extension-height="prominent ? '100px' : '0px'"
		flat>
		<v-icon left>
			{{ prominent ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
		</v-icon>
		<span class="text-caption">{{ live.title }}</span>
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
		<template v-if="prominent" v-slot:extension>
			<v-container>
				<v-row>
					<v-col cols="12">
						test
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12">
						test
					</v-col>
				</v-row>
			</v-container>
		</template>
	</v-app-bar>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Live } from '@sopia-bot/core';

@Component
export default class LivePlayerBar extends Mixins(GlobalMixins) {
	@Prop(Object) public live!: Live;

	public prominent: boolean = false;
}
</script>