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

  console.log(field);

  const [rangeMin, setRangeMin] = React.useState<number>(0);
  const [rangeMax, setRangeMax] = React.useState<number>(100);

  const [rangeStart, setRangeStart] = React.useState<number>(rangeMin);
  const [rangeEnd, setRangeEnd] = React.useState<number>(rangeMax);

  const [missingCount, setMissingCount] = React.useState<number>();

  const onSliderChange = (value: Array<number>) => {
    setRangeStart(value[0]);
    setRangeEnd(value[1]);
  };

  const filterKeyWord = createKeyWord(field);

  const [aggregations, setAggregations] = React.useState<
    {
      value: number;
      unit: string;
      stringValue: string;
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
      aggs.sort((a: any, b: any) => a.value - b.value);

      setAggregations(aggs);
      setMissingCount(all.aggregations['(missing)'].doc_count);
      setRangeMin(aggs[0].value);
      setRangeStart(aggs[0].value);
      setRangeMax(aggs[aggs.length - 1].value);
      setRangeEnd(aggs[aggs.length - 1].value);

      console.log(aggs);
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
                min={rangeMin}
                max={rangeMax}
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
              min={rangeMin}
              max={rangeMax}
              range={{ draggableTrack: true }}
              step={(rangeMax - rangeMin) / 20}
              value={[rangeStart, rangeEnd]}
              onChange={onSliderChange}
            />
          </Col>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={rangeMin}
                max={rangeMax}
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
