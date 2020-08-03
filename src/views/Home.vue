<!--
 * Home.vue
 * Created on Sun Aug 02 2020
 *
 * Copyright (c) TreeSome. Licensed under the MIT License.
-->
<template>
	<v-main>
		Hello World
	</v-main>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '../plugins/mixins';

@Component
export default class Home extends Mixins(GlobalMixins) {
}
</script>
