<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom pa-0" style="height: calc(100vh - 48px); max-height: calc(100vh - 48px); overflow-y: auto;">
		<router-view></router-view>
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';


@Component
export default class Bundle extends Mixins(GlobalMixins) {

}
</script>
