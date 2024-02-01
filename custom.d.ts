declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

// loading raw text or other files
declare module '!!raw-loader!*' {
  const contents: string;
  export = contents;
}

declare module '*.mp4' {
  const src: string;
  export default src;
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

declare module 'dotparser';

declare module promBundle {
  export interface PromBundleOptions {
    includeMethod?: boolean;
    includeStatusCode?: boolean;
    includePath?: boolean;
    customLabels?: [{ [label: string]: string }];
    includeUp?: boolean;
    metricsPath?: string;
    normalizePath?: (req: Express.Request) => any | [];
    urlValueParser?: string;
    formatStatusCode?(res: Express.Response): any;
    transformLabels?(
      labels: promBundle.PromBundleOptions['customLabels'],
      req: Express.Request,
      res: Express.Response
    ): any;
    metricType?: 'histogram' | 'summary';
    buckets?: [number];
    percentiles?: [number];
    autoregister?: boolean;
    promClient?: any;
  }
}
declare function promBundle(options: promBundle.PromBundleOptions): any;

declare module 'cytoscape-cola';

declare module 'react-google-tag-manager';

declare module 'string-similarity';
