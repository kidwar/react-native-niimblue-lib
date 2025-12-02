declare module 'upng-js' {
  export function decode(buffer: ArrayBuffer | Uint8Array): {
    width: number;
    height: number;
    depth: number;
    ctype: number;
    frames: any[];
    tabs: any;
  };
  export function toRGBA8(img: any): Uint8Array[];
  export function encode(imgs: ArrayBuffer[], w: number, h: number, cnum: number, dels?: number[]): Uint8Array;
}