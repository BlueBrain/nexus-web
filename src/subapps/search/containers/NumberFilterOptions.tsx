import {
  Slider,
  InputNumber,
  Radio,
  Form,
  Col,
  Row,
  Checkbox,
  Descriptions,
} from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import { constructQuery } from '../utils';
import './FilterOptions.less';
import { createKeyWord } from './FilterOptions';
import './NumberFilterOptionsContainer.less';
import { Line, Bar } from '@ant-design/charts';

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

  const [graphValue, setGraphValue] = React.useState<string>('line');

  const [missingCount, setMissingCount] = React.useState<number>();
  const [histoValues, setHistoValues] = React.useState<any>([]);
  const [stats, setStats] = React.useState<any>([]);

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

      setStats(all.aggregations.stats);
      setRangeMin(all.aggregations.stats.min);
      setRangeMax(all.aggregations.stats.max);
      setMissingCount(all.aggregations['(missing)'].doc_count);

      const histoInterval = Math.round(
        all.aggregation.stats.max - all.aggregation.max / 50
      );
      const histoQuery = constructQuery(query).aggregation(
        'histogram',
        `${field.name}.value`,
        'histo',
        {
          interval: histoInterval,
        }
      );

      const histoPromise = nexusClient.Search.query(histoQuery);
      Promise.all([histoPromise]).then(([all]) => {
        setHistoValues(all.aggregations.histo.buckets);
      });
    });
  }, []);

  const onChange = (e: any) => {
    setGraphValue(e.target.value);
  };

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
            <Descriptions title="Statistics">
              <Descriptions.Item label="Average">
                {stats.average}
              </Descriptions.Item>
              <Descriptions.Item label="Max">{stats.max}</Descriptions.Item>
              <Descriptions.Item label="Min">{stats.min}</Descriptions.Item>
              <Descriptions.Item label="Sum">{stats.sum}g</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item>
        <Radio.Group onChange={onChange} value={graphValue}>
          <Radio value={'bar'}>Bar Graph</Radio>
          <Radio value={'line'}>Line Graph</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        {graphValue === 'line' && (
          <Line
            data={histoValues}
            height={100}
            xField="key"
            yField="doc_count"
            point={{ size: 5, shape: 'diamon' }}
            color="blue"
          />
        )}
        {graphValue === 'bar' && (
          <Bar data={histoValues} xField="doc_count" yField="key" />
        )}
      </Form.Item>
    </>
  );
};

export default NumberFilterOptions;
