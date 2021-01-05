import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export interface RouteConfig {
	name: string;
	path: string;
	component?: any;
	icon?: string;
	childs?: RouteConfig[];
	isMenu?: boolean;
}

export const routes: RouteConfig[] = [
	{
		name: 'Home',
		path: '/',
		component: () => import('@/views/Home/Index.vue'),
		icon: 'mdi-home',
		isMenu: true,
	},
	{
		name: 'Search',
		path: '/search/:type/:query(.*)/',
		component: () => import('@/views/Search/Index.vue'),
	},
	{
		name: 'User',
		path: '/user/:id/',
		component: () => import('@/views/User/Index.vue'),
	},
	{
		name: 'Command',
		path: '/cmd/:type/',
		component: () => import('@/views/Cmd/Index.vue'),
		isMenu: true,
		icon: 'mdi-powershell',
		childs: [
			{
				name: 'Join',
				path: '/cmd/join/',
				icon: 'mdi-door',
			},
			{
				name: 'Like',
				path: '/cmd/like/',
				icon: 'mdi-heart',
			},
			{
				name: 'Present',
				path: '/cmd/present/',
				icon: 'mdi-gift',
			},
			{
				name: 'Message',
				path: '/cmd/message/',
				icon: 'mdi-message-alert',
			},
		],
	},
	{
		name: 'Code',
		path: '/code/:folder/',
		component: () => import('@/views/Code/Index.vue'),
		icon: 'mdi-code-braces',
		isMenu: true,
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
	{
		name: 'Setting',
		path: '/setting/',
		component: () => import('@/views/Setting/Index.vue'),
		icon: 'mdi-cog',
		isMenu: true,
	},
];

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
});

export default router;
