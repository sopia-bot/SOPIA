import { LogonUser } from "@sopia-bot/core";
import { SetSpoonUserDto } from "./dto/spoon/user.dto";
import { SetUserDto } from "./dto/user.dto";
import { SpoonUserEntity } from "./entities/spoon/user.entity";
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
		setUser: (user: SetSpoonUserDto) => Promise<SpoonUserEntity>;
		getUser: () => Promise<SpoonUserEntity>;
  },
  config: {
    setUser: (user: SetUserDto) => Promise<UserEntity>;
    getUser: () => Promise<UserEntity>;
  }
}