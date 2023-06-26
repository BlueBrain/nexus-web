import { MenuProps } from 'antd';

export type TIssuer = 'createdBy' | 'updatedBy';
export type TDateField = 'createdAt' | 'updatedAt';
export type TDateFilterType = 'before' | 'after' | 'range';
export type TFilterOptions = {
  query: string;
  dateFilterType?: TDateFilterType;
  dateField: TDateField;
  dataType?: string[];
  singleDate?: string;
  dateStart?: string;
  dateEnd?: string;
  offset: number;
  size: number;
  total?: number;
  sort: string[];
  locate: boolean;
  issuer: TIssuer;
  isAcrossProjects: boolean;
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
  total?: string;
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
