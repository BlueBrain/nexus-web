declare const _default: (
  | {
      selector: string;
      style: {
        height: number;
        width: number;
        opacity: number;
        'transition-property': string;
        'transition-duration': string;
        'transition-timing-function': string;
        'background-color'?: undefined;
        'border-color'?: undefined;
        'border-width'?: undefined;
        shape?: undefined;
      };
    }
  | {
      selector: string;
      style: {
        'background-color': string;
        'border-color': string;
        'border-width': number;
        height?: undefined;
        width?: undefined;
        opacity?: undefined;
        'transition-property'?: undefined;
        'transition-duration'?: undefined;
        'transition-timing-function'?: undefined;
        shape?: undefined;
      };
    }
  | {
      selector: string;
      style: {
        width: number;
        height: number;
        'background-color': string;
        'border-color': string;
        'border-width': number;
        opacity?: undefined;
        'transition-property'?: undefined;
        'transition-duration'?: undefined;
        'transition-timing-function'?: undefined;
        shape?: undefined;
      };
    }
  | {
      selector: string;
      style: {
        height: number;
        width: number;
        opacity?: undefined;
        'transition-property'?: undefined;
        'transition-duration'?: undefined;
        'transition-timing-function'?: undefined;
        'background-color'?: undefined;
        'border-color'?: undefined;
        'border-width'?: undefined;
        shape?: undefined;
      };
    }
  | {
      selector: string;
      style: {
        height: number;
        width: number;
        shape: string;
        opacity?: undefined;
        'transition-property'?: undefined;
        'transition-duration'?: undefined;
        'transition-timing-function'?: undefined;
        'background-color'?: undefined;
        'border-color'?: undefined;
        'border-width'?: undefined;
      };
    }
  | {
      selector: string;
      style: {
        width: number;
        'curve-style': string;
        'target-arrow-shape': string;
        'target-arrow-color': string;
        'line-color': string;
      };
    }
  | {
      selector: string;
      style: {
        'text-margin-y': number;
        'text-outline-color': string;
        'text-outline-width': number;
        label: string;
        'edge-text-rotation'?: undefined;
      };
    }
  | {
      selector: string;
      style: {
        label: string;
        'text-outline-color': string;
        'text-outline-width': number;
        'edge-text-rotation': string;
        'text-margin-y'?: undefined;
      };
    }
)[];
export default _default;
