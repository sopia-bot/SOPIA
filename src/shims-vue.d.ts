import Vue from 'vue';

declare module '*.vue' {
	export default Vue;
}

declare module 'vue/types/vue' {
	interface VueConstructor {
		$sopia: any;
	}
}
