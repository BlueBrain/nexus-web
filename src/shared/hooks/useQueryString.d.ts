export declare type QueryParams = {
  [key: string]: any;
};
export default function useQueryString(): [
  QueryParams,
  (newQueryParams: QueryParams, path?: string | undefined) => void
];
