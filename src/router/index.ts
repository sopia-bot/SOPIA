import Vue from 'vue';
import VueRouter from 'vue-router';
import bundle from './bundle';

Vue.use(VueRouter);

export interface RouteConfig {
	name: string;
	path: string;
	component?: any;
	icon?: string;
	children?: RouteConfig[];
	isMenu?: boolean;
	redirect?: string;
	translated?: boolean;
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
		path: '/cmd/:types/',
		component: () => import('@/views/Cmd/Index.vue'),
		isMenu: true,
		icon: 'mdi-powershell',
		children: [
			{
				name: 'Join',
				path: '/cmd/live_join/',
				component: () => import('@/views/Cmd/Join.vue'),
				icon: 'mdi-door',
			},
			{
				name: 'Like',
				path: '/cmd/live_like/',
				component: () => import('@/views/Cmd/Like.vue'),
				icon: 'mdi-heart',
			},
			{
				name: 'Present',
				path: '/cmd/live_present/',
				component: () => import('@/views/Cmd/Present.vue'),
				icon: 'mdi-gift',
			},
			{
				name: 'Message',
				path: '/cmd/live_message/',
				component: () => import('@/views/Cmd/Message.vue'),
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
		children: [
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
			{
				name: '',
				path: '/code//',
			},
		],
	},
	bundle,
	/*
	{
		name: 'Setting',
		path: '/setting/',
		component: () => import('@/views/Setting/Index.vue'),
		icon: 'mdi-cog',
		isMenu: true,
	},
	*/
	{
		name: 'default',
		path: '*',
		redirect: '/',
	},
];

const router = new VueRouter({
	mode: 'hash',
	base: process.env.BASE_URL,
	routes,
});

export default router;
