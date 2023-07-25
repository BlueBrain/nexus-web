import React, {
  useCallback,
  useRef,
  useState,
  ReactElement,
  FunctionComponent,
} from 'react';
import { NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Checkbox, Col, Dropdown, Input, Row, Select } from 'antd';
import { isString, startCase } from 'lodash';
import { useQuery } from 'react-query';
import {
  THeaderProps,
  TType,
  TTypeAggregationsResult,
  TTypesAggregatedBucket,
} from '../../../canvas/MyData/types';
import useMeasure from '../../../hooks/useMeasure';
import isValidUrl from '../../../../utils/validUrl';
import { prettifyNumber } from '../../../../utils/formatNumber';

const getTypesByAggregation = async ({
  nexus,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  orgLabel?: string;
  projectLabel?: string;
}) => {
  return await nexus.Resource.list(orgLabel, projectLabel, {
    aggregations: true,
  });
};

const useTypesAggregation = ({
  nexus,
  selectCallback,
}: {
  nexus: NexusClient;
  selectCallback: (data: any) => TType[];
}) => {
  return useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['types-aggregation-results'],
    queryFn: () => getTypesByAggregation({ nexus }),
    select: selectCallback,
  });
};
const typesOptionsBuilder = (typeBucket: TTypesAggregatedBucket): TType => {
  const typeKey = typeBucket.key;
  const typeLabel =
    isString(typeKey) && isValidUrl(typeKey)
      ? typeKey.split('/').pop()
      : typeKey;

  return {
    key: typeKey,
    value: typeKey,
    label: startCase(typeLabel),
    docCount: typeBucket.doc_count,
  };
};

const TypeItem = ({ value, docCount, label }: TType) => {
  return (
    <Col span={20}>
      <span title={`${value}, (${docCount})`}>{label}</span>
    </Col>
  );
};
type TRowRendererProps<T> = {
  checked: boolean;
  value: T;
  onCheck(e: React.MouseEvent<HTMLElement, MouseEvent>, type: T): void;
  titleComponent: (props: T) => ReactElement;
};
export const RowRenderer = <T,>({
  value,
  checked,
  onCheck,
  titleComponent,
}: TRowRendererProps<T>) => {
  return (
    <Row
      justify="space-between"
      align="top"
      className="select-row"
      onClick={e => onCheck(e, value)}
    >
      {titleComponent(value)}
      <Col
        span={4}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Checkbox checked={checked} />
      </Col>
    </Row>
  );
};
const TypeSelector = ({
  types,
  setFilterOptions,
}: Pick<THeaderProps, 'types' | 'setFilterOptions'>) => {
  const nexus = useNexusContext();
  const originTypes = useRef<TType[]>([]);
  const [typeSearchValue, updateSearchType] = useState('');
  const [typesOptionsArray, setTypesOptionsArray] = useState<TType[]>([]);

  const selectCallback = useCallback((data: TTypeAggregationsResult) => {
    const options = (
      data.aggregations.types?.buckets ?? ([] as TTypesAggregatedBucket[])
    ).map<TType>(item => typesOptionsBuilder(item));
    originTypes.current = options;
    return options;
  }, []);

  const { data: typeOptions } = useTypesAggregation({
    nexus,
    selectCallback,
  });

  const onChangeTypeChange = ({
    target: { value },
    type,
  }: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchType(value);
    if (value === '' || type === 'click') {
      setTypesOptionsArray(originTypes.current);
    } else {
      setTypesOptionsArray(
        originTypes.current.filter(item =>
          item.label.toLowerCase().includes(value.toLowerCase())
        ) ?? []
      );
    }
  };
  const onDeselectTypesChange = (value: any) =>
    setFilterOptions({
      types: types?.filter(item => item.value !== value),
    });
  const onClearTypesChange = () =>
    setFilterOptions({
      types: [],
    });

  const handleOnCheckType = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    type: TType
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setFilterOptions({
      types: types?.find(item => item.value === type.value) ? [] : [type],
    });
  };

  const [typeInputRef, { width }] = useMeasure<HTMLInputElement>();
  const renderedTypes = typeSearchValue ? typesOptionsArray : typeOptions ?? [];
  return (
    <Dropdown
      placement="bottom"
      trigger={['click']}
      overlayStyle={{ width }}
      overlay={
        <div className="my-data-type-filter-overlay">
          <div className="my-data-type-filter-search-container">
            <Input.Search
              allowClear
              className="my-data-type-filter-search"
              placeholder="Search for type"
              value={typeSearchValue}
              onChange={onChangeTypeChange}
            />
            {
              <div className="count">{`${prettifyNumber(
                renderedTypes.length
              )} types`}</div>
            }
          </div>
          <div className="my-data-type-filter-content">
            {renderedTypes.length ? (
              renderedTypes.map((type: TType) => {
                return (
                  <RowRenderer<TType>
                    key={type.key}
                    value={type}
                    checked={Boolean(
                      types?.find(item => item.key === type.key)
                    )}
                    onCheck={handleOnCheckType}
                    titleComponent={TypeItem}
                  />
                );
              })
            ) : (
              <div className="no-types-content">
                <span>No types found</span>
              </div>
            )}
          </div>
        </div>
      }
    >
      <Select
        allowClear
        // @ts-ignore
        ref={typeInputRef}
        mode="tags"
        style={{ width: '100%' }}
        placeholder="Type"
        className="my-data-type-picker"
        popupClassName="my-data-type-picker-popup"
        optionLabelProp="label"
        value={types}
        options={undefined}
        onDeselect={onDeselectTypesChange}
        onClear={onClearTypesChange}
        maxLength={1}
      />
    </Dropdown>
  );
};

export default TypeSelector;
