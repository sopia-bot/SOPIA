import { SpoonClient as Client } from "@sopia-bot/core";
import { randomUUID } from "crypto";

const client = new Client(randomUUID());
client.init();

export const getSpoonClient = () => client;

export const SpoonClient = {
	provide: 'SpoonClient',
	useFactory() {
		return client;
	},
}