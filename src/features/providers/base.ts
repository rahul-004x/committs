import { ConfigType } from "../../util.js";
export abstract class BaseProvider {
  abstract id: string;
  abstract displayName: string;
  abstract setup(): Promise<void>;
  abstract generateCommit(
    diff: string,
    prompt: string,
    config: ConfigType,
  ): Promise<string>;
}
