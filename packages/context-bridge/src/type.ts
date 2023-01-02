import { LogonUser } from "@sopia-bot/core";

export interface SOPIAFunction {
	app: {
		minimize: () => void;
		maximize: () => void;
		toggleMaximize: () => void;
		quit: () => void;
	},
  spoon: {
    snsLogin: (url: string) => Promise<LogonUser>;
  }
}