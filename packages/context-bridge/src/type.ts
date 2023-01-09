import { LogonUser } from "@sopia-bot/core";
import { SetUserDto } from "./dto/user.dto";
import { UserEntity } from "./entities/user.entity";

export interface SOPIAFunction {
	request: (url: string, ...args: any[]) => Promise<any>,
	app: {
		minimize: () => void;
		maximize: () => void;
		toggleMaximize: () => void;
		quit: () => void;
	},
  spoon: {
    snsLogin: (url: string) => Promise<LogonUser>;
  },
  config: {
    setUser: (user: SetUserDto) => Promise<UserEntity>;
    getUser: () => Promise<UserEntity>;
  }
}