export interface SearchResponse<T> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  hits: {
    total: {
      value: number;
    };
    max_score: number;
    hits: {
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: T;
      _version?: number;
      fields?: any;
      highlight?: any;
      inner_hits?: any;
      matched_queries?: string[];
      sort?: string[];
    }[];
  };
  aggregations?: any;
}
export declare type ResultTableFields = {
  title: string;
  dataIndex: string;
  sortable?: boolean;
  key: string;
  displayIndex: number;
};
