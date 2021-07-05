/*
 * property.d.ts
 * Created on Fri Aug 07 2020
 *
 * Copyright (c) Tree Some. Licensed under the MIT License.
 */
import Vue from 'vue';
import { SpoonClient } from 'sopia-core';
import CfgLite from 'cfg-lite';
import { SopiaAPI } from '@/plugins/sopia-api';

declare module 'vue/types/vue' {
	interface Vue {
		$sopia: SpoonClient;
		$evt: Vue;
		$logger: any;
		$cfg: CfgLite;
		$api: SopiaAPI;
	}
}

