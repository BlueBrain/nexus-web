import { ReactElement } from 'react';

export type TType = {
  key: string;
  value: string;
  label: string;
  docCount: number;
};
export type TTypeAggregationsResult = {
  '@context': string;
  total: number;
  aggregations: {
    projects: TTypesAggregatedProperty;
    types: TTypesAggregatedProperty;
  };
};
export type TTypesAggregatedProperty = {
  buckets: TTypesAggregatedBucket[];
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
};
export type TTypesAggregatedBucket = { key: string; doc_count: number };
export type TRowRendererProps<T> = {
  checked: boolean;
  value: T;
  onCheck(e: React.MouseEvent<HTMLElement, MouseEvent>, type: T): void;
  titleComponent: (props: T) => ReactElement;
};
type TTypeSelectorStyle = {
  container?: React.CSSProperties;
  selector?: React.CSSProperties;
};
export type TTypeSelectorProps = {
  org?: string;
  project?: string;
  types?: TType[];
  styles?: TTypeSelectorStyle;
  updateOptions: (options: { types?: TType[] }) => void;
};
