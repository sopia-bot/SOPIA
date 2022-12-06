import { LivePresentSocket, LiveSocket } from '@sopia-bot/core';

export type SpeechTextReturn = Promise<string|void>|string|undefined;

export type RandomItem = {
	percentage: number;
	value: string;
}

export type RouletteEvent = LivePresentSocket & {
	item: RandomItem;
	uuid: string;
	sock: LiveSocket;
};

export type SpeechText =
	((e: RouletteEvent) => SpeechTextReturn)
	|((e: RouletteEvent, sock: LiveSocket) => SpeechTextReturn)
	|string;
