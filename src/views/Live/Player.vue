<!--
 * Player.vue
 * Created on Sat Oct 03 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<div v-if="fullScreen" style="max-height: 750px; height: 100vh; max-width: 450px; width: 100%;">
	</div>
	<div v-else>
	</div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';
import { Play } from 'sopia-core';

@Component
export default class LivePlayer extends Mixins(GlobalMixins) {
	@Prop(Play) public live!: Play;

	public fullScreen: boolean = true;
}
</script>
