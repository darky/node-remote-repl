declare module "chrome-remote-interface" {
  export default function (opts: {
    host: string;
    port: number;
  }): Promise<{
    close(): Promise<void>;
    Runtime: {
      evaluate(opts: {
        expression: string;
        includeCommandLineAPI: boolean;
      }): Promise<object>;
    };
  }>;
}
