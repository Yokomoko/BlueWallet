declare module 'bip21grs' {
  export type TOptions =
    | {
        amount?: number;
        label?: string;
        pj?: string;
      }
    | { [key: string]: string };

  export function decode(uri: string, urnScheme?: string): { address: string; options: TOptions };
  export function encode(address: string, options?: TOptions, urnScheme?: string): string;
}
