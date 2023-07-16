import { MenuProps } from 'antd';

export type TIssuer = 'createdBy' | 'updatedBy';
export type TDateField = 'createdAt' | 'updatedAt';
export type TDateFilterType = 'before' | 'after' | 'range';
export type TFilterOptions = {
  query: string;
  dateFilterType?: TDateFilterType;
  dateField: TDateField;
  types?: TType[];
  singleDate?: string;
  dateStart?: string;
  dateEnd?: string;
  offset: number;
  size: number;
  total?: number;
  sort: string[];
  locate: boolean;
  issuer: TIssuer;
};
export type TCurrentDate = Pick<
  TFilterOptions,
  'singleDate' | 'dateStart' | 'dateEnd' | 'dateFilterType'
>;
export type THeaderProps = Omit<TFilterOptions, 'size' | 'offset' | 'sort'> & {
  setFilterOptions: React.Dispatch<Partial<TFilterOptions>>;
};

export type TTitleProps = {
  text: string;
  label: string;
  total?: number;
};
export type THeaderFilterProps = Omit<THeaderProps, 'total' | 'sort'>;
export type THandleMenuSelect = MenuProps['onClick'];
export type TTypeDateItem = {
  key: string;
  value: string;
  label: string;
};
export type TDate = {
  day: string;
  month: string;
  year: string;
};
export type TDateOptions = 'singleDate' | 'dateStart' | 'dateEnd';
export const DATE_PATTERN = 'DD/MM/YYYY';
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
