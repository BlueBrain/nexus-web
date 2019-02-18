declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

//
// Identicon.js Types
//
declare class Identicon {
  constructor(hash: string, options: number | Identicon.IdenticonOptions);
  toString(): string;
}
declare module Identicon {
  export enum Format {
    svg = 'svg',
    png = 'png',
  }
  export interface IdenticonOptions {
    foreground?: [number, number, number, number];
    background?: [number, number, number, number];
    margin?: number;
    size?: number;
    format?: Format;
  }
}
declare module 'identicon.js' {
  export = Identicon;
}
