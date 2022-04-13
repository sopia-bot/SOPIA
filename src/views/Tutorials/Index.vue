<!--
 * Index.vue
 * Created on Thu Oct 08 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
-->
<template>
	<div class="tutorial-container">
		<div class="tutorial-textbox">
			<div class="tutorial-namebox-wrapper">
				<div class="tutorial-namebox text-title font-weight-bold">
					연 하 영
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixins from '@/plugins/mixins';

@Component
export default class Tutorials extends Mixins(GlobalMixins) {
	public created() {
		if ( this.$cfg.get('tutorial') ) {
			return;
		}
	}
}
</script>
<style scope>
.tutorial-box {
	position: fixed;
	width: 200px;
	height: 200px;
	top: 50px;
	left:50px;
	box-shadow: 0 0 0 1000px rgba(0,0,0,.3);
  	box-shadow: 0 0 0 100vmax rgba(0,0,0,.3);
	pointer-events: none;
	z-index: 30;
}
.tutorial-container {
	position: fixed;
	width: 100vw;
	height: 100vh;
	z-index: 1000;
	background: rgba(0, 0, 0, 0.5);
}
.tutorial-namebox {
	margin-top: -40px;
	margin-left: 100px;
	font-size: 1.5rem;
	color: white;
	position: absolute;
}
.tutorial-namebox-wrapper {
	position: relative;
	background: rgb(255,255,255);
	background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
	width: 300px;
	height: 2px;
}
.tutorial-textbox {
	position: fixed;
	bottom: 0;
	width: 100vw;
	height: 230px;
	background: rgb(30,22,139);
	background: linear-gradient(0deg, rgba(30,22,139,0.6348914565826331) 0%, rgba(255,255,255,0) 100%);
}
</style>
