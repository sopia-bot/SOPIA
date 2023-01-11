import { SpoonClient } from '@sopia-bot/core';

const spoon = new SpoonClient(window.navigator.userAgent.replace(/\s/g, ''));

export function useSpoon(): SpoonClient {
  return spoon;
}