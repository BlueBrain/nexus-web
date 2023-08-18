import React, { useCallback, useRef, useState, ReactElement } from 'react';
import { NexusClient } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import {
  Checkbox,
  Col,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
} from 'antd';
import { isString, startCase } from 'lodash';
import { useQuery } from 'react-query';
import { prettifyNumber } from '../../../utils/formatNumber';
import {
  TRowRendererProps,
  TType,
  TTypeAggregationsResult,
  TTypeSelectorProps,
  TTypesAggregatedBucket,
} from './types';
import isValidUrl from '../../../utils/validUrl';
import './style.scss';

const typesOperatorOptions = [
  { label: 'AND', value: 'AND' },
  { label: 'OR', value: 'OR' },
];

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
  org,
  project,
  selectCallback,
}: {
  nexus: NexusClient;
  org?: string;
  project?: string;
  selectCallback: (data: any) => TType[];
}) => {
  return useQuery({
    refetchOnWindowFocus: false,
    queryKey: ['types-aggregation-results', { org, project }],
    queryFn: () =>
      getTypesByAggregation({ nexus, orgLabel: org, projectLabel: project }),
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
  org,
  project,
  types,
  styles,
  updateOptions,
  defaultValue,
  afterUpdate,
  typeOperator = 'OR',
}: TTypeSelectorProps) => {
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

  const { data: typeOptions, isLoading } = useTypesAggregation({
    nexus,
    org,
    project,
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
  const onDeselectTypesChange = (value: any) => {
    const newTypes = types?.filter((item: TType) => item.value !== value);
    updateOptions({
      typeOperator,
      types: newTypes,
    });
    afterUpdate?.(typeOperator, newTypes);
  };
  const onClearTypesChange = () => {
    updateOptions({
      typeOperator,
      types: [],
    });
    afterUpdate?.('OR', []);
  };

  const handleOnCheckType = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    type: TType
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const newTypes = types?.find((item: TType) => item.value === type.value)
      ? types.filter((item: TType) => item.value !== type.value)
      : [...(types ? types : []), type];
    updateOptions({
      typeOperator,
      types: newTypes,
    });
    afterUpdate?.(typeOperator, newTypes);
  };
  const renderedTypes = typeSearchValue ? typesOptionsArray : typeOptions ?? [];
  const onTypeOperatorChange = ({ target: { value } }: RadioChangeEvent) => {
    updateOptions({
      typeOperator: value,
    });
  };
  return (
    <div className="types-selector" style={styles?.container}>
      <div className="types-selector-wrapper">
        <Select
          allowClear
          id="types-selector"
          defaultValue={defaultValue}
          mode="tags"
          virtual={false}
          value={types}
          loading={isLoading}
          disabled={isLoading}
          placeholder="Type"
          optionLabelProp="label"
          onDeselect={onDeselectTypesChange}
          onClear={onClearTypesChange}
          style={styles?.selector}
          dropdownStyle={{ position: 'fixed' }}
          className="types-selector-select"
          popupClassName="types-selector-popup"
          aria-label="type-filter"
          dropdownRender={() => (
            <>
              <div className="type-operator-selector">
                <div>Select Type Operator</div>
                <Radio.Group
                  value={typeOperator}
                  optionType="default"
                  name="typeOperator"
                  options={typesOperatorOptions}
                  onChange={onTypeOperatorChange}
                />
              </div>
              <div className="types-selector-search-container">
                <Input.Search
                  allowClear
                  placeholder="Search column"
                  className="types-selector-search-input"
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
                          types?.find((item: TType) => item.key === type.key)
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
            </>
          )}
        />
      </div>
    </div>
  );
};

export default TypeSelector;
