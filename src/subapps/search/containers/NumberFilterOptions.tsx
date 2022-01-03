import { Slider, InputNumber, Form, Col, Row, Checkbox } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import { constructQuery } from '../utils';
import './FilterOptions.less';
import { createKeyWord } from './FilterOptions';
import './NumberFilterOptionsContainer.less';

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

export const extractUnitAndNumber = (filterValue: string) => {
  const result = filterValue.match(/(-?[\d.]+)([a-z%]*)/);
  if (result && result.length > 1) {
    return {
      val: parseFloat(result[1]),
      unit: result[2],
    };
  }
  return { val: filterValue, unit: '' };
};

const NumberFilterOptions: React.FC<{
  field: ConfigField;
  onFinish: (values: any) => void;
  nexusClient: NexusClient;
  filter: FilterState[];
  query: string;
}> = ({ filter, field, onFinish, nexusClient, query }) => {
  const fieldFilter = filter.find(f => {
    return f.filterTerm === field.name;
  });
  const [rangeStart, setRangeStart] = React.useState<number>(
    fieldFilter?.filters[0] ? parseInt(fieldFilter?.filters[0]) : 0
  );
  const [rangeEnd, setRangeEnd] = React.useState<number>(
    fieldFilter?.filters[1] ? parseInt(fieldFilter?.filters[1]) : 40
  );
  const [missingCount, setMissingCount] = React.useState<number>();

  const onSliderChange = (value: Array<number>) => {
    setRangeStart(value[0]);
    setRangeEnd(value[1]);
  };

  const filterKeyWord = createKeyWord(field);

  const [aggregations, setAggregations] = React.useState<
    {
      filterValue: string;
      count: number;
      selected: boolean;
      matching: boolean;
    }[]
  >([]);

  React.useEffect(() => {
    const allSuggestions = constructQuery(query)
      .aggregation('terms', filterKeyWord, 'suggestions', { size: 1000 })
      .aggregation('missing', filterKeyWord, '(missing)')
      .build();

    const allSuggestionsPromise = nexusClient.Search.query(allSuggestions);

    Promise.all([allSuggestionsPromise]).then(([all]) => {
      const aggs = all.aggregations['suggestions'].buckets.map(
        (bucket: any) => {
          const parsed = extractUnitAndNumber(bucket.key);
          return {
            value: parsed.val,
            unit: parsed.unit,
            stringValue: bucket.key,
          };
        }
      );
      setMissingCount(all.aggregations['(missing)'].doc_count);
      setAggregations(aggs);
    });
  }, [field]);

  React.useEffect(() => {
    const currentRange = [];
    currentRange.push(rangeStart.toString());
    currentRange.push(rangeEnd.toString());
    onFinish({
      filterType: 'number',
      filters: currentRange,
      filterTerm: field.name,
    });
  }, [rangeStart, rangeEnd]);

  return (
    <>
      <Form.Item>
        <Row>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={0}
                max={99}
                style={{ margin: '0 16px' }}
                value={rangeStart}
                onChange={value => {
                  setRangeStart(value);
                }}
              />
            </Row>
            <Row>Minimum</Row>
          </Col>
          <Col flex={20}>
            <Slider
              range={{ draggableTrack: true }}
              step={1}
              value={[rangeStart, rangeEnd]}
              onChange={onSliderChange}
            />
          </Col>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={1}
                max={100}
                style={{ margin: '0 16px' }}
                value={rangeEnd}
                onChange={value => {
                  setRangeStart(value);
                }}
              />
            </Row>
            <Row>Maximum</Row>
          </Col>
        </Row>
      </Form.Item>
      {missingCount && (
        <Form.Item>
          <Checkbox disabled={missingCount === 0}>
            Show Missing Values Only ({missingCount})
          </Checkbox>
        </Form.Item>
      )}
    </>
  );
};

export default NumberFilterOptions;
