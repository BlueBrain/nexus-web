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
type NumericStats = {
  avg: number;
  min: number;
  max: number;
  count: number;
  sum: number;
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

  const [aggregations, setAggregations] = React.useState<
    {
      value: number;
      unit: string;
      stringValue: string;
    }[]
  >([]);

  const initialStatsState = {
    avg: 50,
    min: 1,
    max: 100,
    count: 10,
    sum: 500,
  };
  const [stats, setStats] = React.useState<NumericStats>(initialStatsState);

  const [rangeStart, setRangeStart] = React.useState<number>(
    fieldFilter?.filters[0] ? parseFloat(fieldFilter?.filters[0]) : stats.min
  );
  const [rangeEnd, setRangeEnd] = React.useState<number>(
    fieldFilter?.filters[1] ? parseFloat(fieldFilter?.filters[1]) : stats.max
  );

  const [missingCount, setMissingCount] = React.useState<number>();

  const onSliderChange = (value: number[]) => {
    setRangeStart(value[0]);
    setRangeEnd(value[1]);
  };

  const filterKeyWord = createKeyWord(field);

  React.useEffect(() => {
    const allSuggestions = constructQuery(query)
      .aggregation('terms', `${field.name}.value`, 'suggestions', {
        size: 1000,
      })
      .aggregation('stats', `${field.name}.value`, 'stats')
      .aggregation('missing', filterKeyWord, '(missing)')
      .build();

    const allSuggestionsPromise = nexusClient.Search.query(allSuggestions);

    Promise.all([allSuggestionsPromise]).then(([all]) => {
      const aggs = all.aggregations['suggestions'].buckets.map(
        (bucket: any) => {
          return {
            value: bucket.key,
            stringValue: bucket.key,
          };
        }
      );

      setAggregations(aggs);
      setMissingCount(all.aggregations['(missing)'].doc_count);
      if (!fieldFilter?.filters[0]) {
        setRangeStart(all.aggregations.stats.min);
        setRangeEnd(all.aggregations.stats.max);
      }
      setStats(all.aggregations.stats);
    });
  }, [field]);

  const setFilters = () => {
    return [rangeStart, rangeEnd].map((value: number) => value.toString());
  };

  const onShowMissingChange = () => {
    onFinish({
      filterType: 'missing',
      filters: [],
      filterTerm: filterKeyWord,
    });
  };

  React.useEffect(() => {
    if (rangeStart !== stats.min || rangeEnd !== stats.max) {
      const currentRange = setFilters();
      onFinish({
        filterType: 'number',
        filters: currentRange,
        filterTerm: field.name,
      });
    }
  }, [rangeStart, rangeEnd]);

  return (
    <>
      <Form.Item>
        <Row>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={stats.min}
                max={stats.max}
                value={rangeStart}
                onChange={setRangeStart}
              />
            </Row>
            <Row>Minimum</Row>
          </Col>
          <Col flex={20}>
            <Slider
              min={stats.min}
              max={stats.max}
              range={{ draggableTrack: true }}
              step={(stats.max - stats.min) / 100}
              value={[rangeStart, rangeEnd]}
              onChange={onSliderChange}
            />
          </Col>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={stats.min}
                max={stats.max}
                style={{ margin: '0 0 0 16px' }}
                value={rangeEnd}
                onChange={setRangeEnd}
              />
            </Row>
            <Row>Maximum</Row>
          </Col>
        </Row>
      </Form.Item>
      {missingCount && (
        <Form.Item>
          <Checkbox
            disabled={missingCount === 0}
            onChange={onShowMissingChange}
          >
            Show Missing Values Only ({missingCount})
          </Checkbox>
        </Form.Item>
      )}
    </>
  );
};

export default NumberFilterOptions;
