<!--
 * ToolButton.vue
 * Created on Fri Aug 28 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<v-tooltip bottom>
		<template v-slot:activator="{ on, attrs }">
			<v-btn
				icon
				color="indigo lighten-1"
				class="mx-1"
				v-bind="attrs"
				v-on="on"
				@click="btn.func"
				>
				<v-icon>{{ btn.icon }}</v-icon>
			</v-btn>
		</template>
		<span>{{ btn.name }}</span>
	</v-tooltip>
</template>
<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

export interface ToolButtonInterface {
	icon: string;
	name: string;
	func: (...args: any) => void;
}

@Component
export default class ToolButton extends Mixins(GlobalMixins) {
	@Prop(Object) public btn!: ToolButtonInterface;
}
</script>
