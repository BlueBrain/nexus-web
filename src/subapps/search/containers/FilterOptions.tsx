import { Form, Select, Checkbox, Row, Input } from 'antd';
import { labelOf } from '../../../shared/utils';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import './FilterOptions.less';
import { constructFilterSet, constructQuery } from '../utils';

type ConfigField =
  | {
      name: string;
      label: string;
      array: boolean;
      optional: boolean;
      fields: { name: string; format: string }[];
      format?: undefined;
    }
  | {
      name: string;
      label: string;
      format: string;
      array: boolean;
      optional: boolean;
      fields?: undefined;
    };

export const extractFieldName = (filterKeyword: string) =>
  filterKeyword.replace('.label.keyword', '').replace('.keyword', '');

export const createKeyWord = (field: ConfigField) => {
  if (field.fields) {
    return `${field.name}.label.keyword`;
  }

  return `${field.name}.keyword`;
};

const FilterOptions: React.FC<{
  field: ConfigField;
  onFinish: (values: any) => void;
  nexusClient: NexusClient;
  filter: FilterState[];
  query: string;
}> = ({ filter, field, onFinish, nexusClient, query }) => {
  const baseQuery = constructQuery(query);
  const withOtherFilters = constructFilterSet(
    baseQuery,
    filter.filter(f => extractFieldName(f.filterTerm) !== field.name)
  );

  const fieldFilter = filter.find(
    filter =>
      extractFieldName(extractFieldName(filter.filterTerm)) === field.name
  );

  const [aggregations, setAggregations] = React.useState<
    {
      filterValue: string;
      count: number;
      selected: boolean;
      matching: boolean;
    }[]
  >([]);

  const filterTypeDefault = () => {
    if (fieldFilter?.filterType) {
      return fieldFilter?.filterType;
    }
    return 'anyof';
  };
  const [filterType, setFilterType] = React.useState(filterTypeDefault);

  const [form] = Form.useForm();

  const filterKeyWord = createKeyWord(field);
  React.useEffect(() => {
    const allSuggestions = constructQuery(query)
      .aggregation('terms', filterKeyWord, 'suggestions', { size: 1000 })
      .build();

    const allSuggestionsPromise = nexusClient.Search.query(allSuggestions);

    const filterSuggestions = withOtherFilters
      .aggregation('terms', filterKeyWord, 'suggestions', { size: 1000 })
      .aggregation('missing', filterKeyWord, '(missing)')
      .build();

    const filteredSuggesetionsPromise = nexusClient.Search.query(
      filterSuggestions
    );

    Promise.all([allSuggestionsPromise, filteredSuggesetionsPromise]).then(
      ([all, filtered]) => {
        const aggs = all.aggregations['suggestions'].buckets.map(
          (bucket: any) => {
            const filteredBucket = filtered.aggregations[
              'suggestions'
            ].buckets.find((f: any) => f.key === bucket.key);

            return {
              filterValue: bucket.key,
              count: filteredBucket ? filteredBucket.doc_count : 0,
              selected: fieldFilter?.filters.includes(
                extractFieldName(bucket.key)
              ),
              matching: true,
            };
          }
        );
        aggs.push({
          filterValue: '(Missing)',
          count: filtered.aggregations['(missing)'].doc_count,
          selected: fieldFilter?.filters.includes('(Missing)'),
          matching: true,
        });
        setAggregations(aggs);
      }
    );
  }, [field]);

  const changeFilterSelection = (filterValue: string, selected: boolean) => {
    const aggs = aggregations.map(a => ({
      ...a,
      selected: a.filterValue === filterValue ? selected : a.selected,
    }));
    setAggregations(aggs);
  };

  const filterValues = React.useMemo(
    () =>
      aggregations
        .filter(a => a.matching)
        .map(({ filterValue, selected, count }) => {
          return (
            <Row
              key={filterValue}
              style={{
                display:
                  filterValue === 'Missing' && count === 0 ? 'none' : 'inherit',
              }}
              className="filter-value-row"
            >
              <Checkbox
                key={`chk${filterValue}`}
                value={`${filterValue}`}
                className="filter-value-row__chk"
                checked={selected ? true : false}
                disabled={count === 0}
                onChange={e =>
                  changeFilterSelection(filterValue, e.target.checked)
                }
              >
                {`${
                  field.label === 'Types' ? labelOf(filterValue) : filterValue
                }`}
              </Checkbox>
              <span className="filter-value-row__count">
                {count > 10000 ? '10K+' : count.toLocaleString('en-US')}
              </span>
            </Row>
          );
        }),
    [aggregations]
  );

  return (
    <Form form={form} className="field-filter-menu">
      <Form.Item
        label="Operator"
        rules={[
          { required: true, message: 'Operator is required to apply a filter' },
        ]}
      >
        <Select
          dropdownStyle={{ zIndex: 1100 }}
          value={filterType}
          onChange={v => setFilterType(v)}
        >
          {field.array && (
            <Select.Option value="allof">is all of (AND)</Select.Option>
          )}
          <Select.Option value="anyof">is any of (OR)</Select.Option>
          <Select.Option value="noneof">is none of (NOT)</Select.Option>
          {field.optional && (
            <Select.Option value="missing">is missing</Select.Option>
          )}
        </Select>
      </Form.Item>
<<<<<<< HEAD
      {filterType !== 'missing' && (
        <>
          <Input.Search
            onChange={event => {
              const val = event.target.value;

              const filteredSuggestions = aggregations.map(a => ({
                ...a,
                matching:
                  val && val.length > 0
                    ? a.filterValue.toLowerCase().indexOf(val.toLowerCase()) >
                      -1
                    : true,
              }));
              setAggregations(filteredSuggestions);
            }}
          ></Input.Search>
          <Form.Item
            style={{ maxHeight: '91px', overflow: 'scroll', width: '105%' }}
          >
            {filterValues}
          </Form.Item>
        </>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Apply
        </Button>
      </Form.Item>
=======
      <Input.Search
        onChange={event => {
          const val = event.target.value;

          const filteredSuggestions = aggregations.map(a => ({
            ...a,
            matching:
              val && val.length > 0
                ? a.filterValue.toLowerCase().indexOf(val.toLowerCase()) > -1
                : true,
          }));
          setAggregations(filteredSuggestions);
        }}
      ></Input.Search>
      <Form.Item style={{ maxHeight: '91px', overflow: 'scroll' }}>
        {filterValues}
      </Form.Item>
      <Form.Item></Form.Item>
>>>>>>> 78c9962... removed button
    </Form>
  );
};

export default FilterOptions;
