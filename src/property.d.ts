/*
 * property.d.ts
 * Created on Fri Aug 07 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import Vue from 'vue';
import * as spoon from 'sopia-core';

declare module 'vue/types/vue' {
	interface Vue {
		$sopia: spoon.Client;
		$evt: Vue;
	}
}

