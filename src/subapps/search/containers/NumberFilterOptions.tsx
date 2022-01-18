import { Slider, InputNumber, Form, Col, Row, Checkbox, Descriptions } from 'antd';
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

  const firstRender = React.useRef<boolean>(true);

  const [missingValues, setMissingValues] = React.useState<boolean>(false);

  const [rangeMin, setRangeMin] = React.useState<number>(
    fieldFilter?.filters[2] ? parseFloat(fieldFilter?.filters[2]) : 0
  );

  const [rangeMax, setRangeMax] = React.useState<number>(
    fieldFilter?.filters[3] ? parseFloat(fieldFilter?.filters[3]) : 100000
  );

  const [rangeStart, setRangeStart] = React.useState<number | undefined>(
    fieldFilter?.filters[0] ? parseFloat(fieldFilter?.filters[0]) : undefined
  );
  const [rangeEnd, setRangeEnd] = React.useState<number | undefined>(
    fieldFilter?.filters[1] ? parseFloat(fieldFilter?.filters[1]) : undefined
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
      all.aggregations['suggestions'].buckets.map((bucket: any) => {
        return {
          value: bucket.key,
          stringValue: bucket.key,
        };
      });
      console.log(all.aggregations.stats);
      setRangeMin(all.aggregations.stats.min);
      setRangeMax(all.aggregations.stats.max);
      setMissingCount(all.aggregations['(missing)'].doc_count);
    });
  }, []);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (missingValues) {
      onFinish({
        filterType: 'number',
        filters: ['isMissing'],
        filterTerm: field.name,
      });
    } else {
      const filters = [rangeStart || rangeMin, rangeEnd || rangeMax];
      onFinish({
        filters,
        filterType: 'number',
        filterTerm: field.name,
      });
    }
  }, [rangeStart, rangeEnd, missingValues]);

  return (
    <>
      <Form.Item>
        <Row>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={rangeMin}
                max={rangeMax}
                value={rangeStart || rangeMin}
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
              step={(rangeMax - rangeMin) / 100}
              value={[rangeStart || rangeMin, rangeEnd || rangeMax]}
              onChange={onSliderChange}
            />
          </Col>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={rangeMin}
                max={rangeMax}
                style={{ margin: '0 0 0 16px' }}
                value={rangeEnd || rangeMax}
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
          <Checkbox
            disabled={missingCount === 0}
            onChange={e => {
              setMissingValues(e.target.checked);
            }}
          >
            Show Missing Values Only ({missingCount})
          </Checkbox>
        </Form.Item>
      )}
      <Form.Item>
        <Row>
          <Col flex={1}>
            <Descriptions title="User Info">
              <Descriptions.Item label="Average">
                6.8
              </Descriptions.Item>
              <Descriptions.Item label="Max">
                10
              </Descriptions.Item>
              <Descriptions.Item label="Min">100</Descriptions.Item>
              <Descriptions.Item label="Sum">
                10
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Form.Item>
    </>
  );
};

export default NumberFilterOptions;
