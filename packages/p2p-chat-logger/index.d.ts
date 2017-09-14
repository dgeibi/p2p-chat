declare module "p2p-chat-logger" {
  namespace internal {
    export function log(message?: any, ...optionalParams: any[]): void;
    export function error(message?: any, ...optionalParams: any[]): void;
    export function err(message?: any, ...optionalParams: any[]): void;
    export function info(message?: any, ...optionalParams: any[]): void;
    export function warn(message?: any, ...optionalParams: any[]): void;
    export function verbose(message?: any, ...optionalParams: any[]): void;
    export function debug(message?: any, ...optionalParams: any[]): void;
  }
  export = internal;
}
