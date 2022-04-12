<!--
 * Index.vue
 * Created on Thu Oct 28 2021
 *
 * Copyright (c) Raravel. Licensed under the MIT License.
-->
<template>
	<v-main class="custom" style="height: 100vh; overflow-y: auto;">
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
