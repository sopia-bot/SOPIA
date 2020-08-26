import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export interface RouteConfig {
	name: string;
	path: string;
	component?: any;
	icon: string;
	childs?: RouteConfig[];
}

export const routes: RouteConfig[] = [
	{
		name: 'Home',
		path: '/',
		component: () => import('@/views/Home/Index.vue'),
		icon: 'mdi-home',
	},
	{
		name: 'Code',
		path: '/code/:folder/',
		component: () => import('@/views/Code/Index.vue'),
		icon: 'mdi-code-braces',
		childs: [
			{
				name: 'Bundles',
				path: '/code/bundles/',
				icon: 'mdi-puzzle',
			},
			{
				name: 'Sopia',
				path: '/code/sopia/',
				icon: 'mdi-robot',
			},
		],
	},
];

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
});

export default router;
