import {
  Slider,
  InputNumber,
  Radio,
  Form,
  Col,
  Row,
  Checkbox,
  Descriptions,
  Statistic,
} from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import { constructQuery } from '../utils';
import './FilterOptions.less';
import { createKeyWord } from './FilterOptions';
import './NumberFilterOptionsContainer.less';
import { Line, Column } from '@ant-design/charts';

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

  // check if 'isMissing' filter is applied
  const isMissing = filter
    .find(f => f.filterTerm === field.name)
    ?.filters.includes('isMissing');
  const [missingValues, setMissingValues] = React.useState<boolean>(
    isMissing || false
  );

  const [rangeMin, setRangeMin] = React.useState<number>(
    fieldFilter?.filters[2] ? parseFloat(fieldFilter?.filters[2]) : 0
  );

  const [rangeMax, setRangeMax] = React.useState<number>(
    fieldFilter?.filters[3] ? parseFloat(fieldFilter?.filters[3]) : Infinity
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
  const [average, setAverage] = React.useState<number>(0);
  const [sum, setSum] = React.useState<number>(0);

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
      .aggregation('missing', filterKeyWord, '(missing)')
      .aggregation('stats', `${field.name}.value`, 'stats')
      .build();

    const allSuggestionsPromise = nexusClient.Search.query(allSuggestions);

    Promise.all([allSuggestionsPromise]).then(([all]) => {
      all.aggregations['suggestions'].buckets.map((bucket: any) => {
        return {
          value: bucket.key,
          stringValue: bucket.key,
        };
      });

      setAverage(all.aggregations.stats.avg);
      setSum(all.aggregations.stats.sum);
      setRangeMin(all.aggregations.stats.min);
      setRangeMax(all.aggregations.stats.max);
      setMissingCount(all.aggregations['(missing)'].doc_count);

      const histoInterval =
        (all.aggregations.stats.max - all.aggregations.stats.min) / 50;

      const histoIntervalFormatted =
        histoInterval > 1
          ? Math.round(histoInterval)
          : histoInterval.toFixed(4);

      const histoQuery = constructQuery(query)
        .aggregation('histogram', `${field.name}.value`, 'histo', {
          interval: histoIntervalFormatted,
        })
        .build();

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
    if (firstRender.current) return;
    const filters = missingValues ? ['isMissing'] : [];
    onFinish({
      filters,
      filterType: 'missing',
      filterTerm: field.name,
    });
  }, [missingValues]);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const filters = [rangeStart || rangeMin, rangeEnd || rangeMax];
    onFinish({
      filters,
      filterType: 'number',
      filterTerm: field.name,
    });
  }, [rangeStart, rangeEnd]);

  const renderMissing = React.useCallback(() => {
    return missingCount ? (
      <Form.Item>
        <Checkbox
          disabled={missingCount === 0}
          checked={missingValues}
          onChange={e => {
            setMissingValues(e.target.checked);
          }}
        >
          Show Missing Values Only ({missingCount})
        </Checkbox>
      </Form.Item>
    ) : null;
  }, [missingValues, missingCount]);

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
                  setRangeStart(value as number);
                }}
              />
            </Row>
            <Row>Minimum</Row>
          </Col>
          <Col flex={20}>
            <Slider
              min={rangeMin}
              max={rangeMax}
              disabled={missingValues}
              range={{
                draggableTrack: true,
              }}
              step={(rangeMax - rangeMin) / 100}
              value={[rangeStart || rangeMin, rangeEnd || rangeMax]}
              onChange={onSliderChange}
              className="filter-slider"
            />
          </Col>
          <Col flex={1}>
            <Row>
              <InputNumber
                min={rangeMin}
                max={rangeMax}
                style={{
                  margin: '0 0 0 16px',
                }}
                value={rangeEnd || rangeMax}
                onChange={value => {
                  // @ts-ignore
                  setRangeStart(value);
                }}
              />
            </Row>
            <Row>Maximum</Row>
          </Col>
        </Row>
      </Form.Item>
      {renderMissing()}
      <Form.Item>
        <Row>
          <Col flex={1}>
            <Descriptions title="Statistics"></Descriptions>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Sum"
                  value={sum}
                  precision={2}
                  valueStyle={{
                    fontSize: 20,
                  }}
                />
                <Statistic
                  title="Average"
                  value={average}
                  precision={2}
                  valueStyle={{
                    fontSize: 20,
                  }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Max"
                  value={rangeMax}
                  precision={2}
                  valueStyle={{
                    fontSize: 20,
                  }}
                />
                <Statistic
                  title="Min"
                  value={rangeMin}
                  precision={2}
                  valueStyle={{
                    fontSize: 20,
                  }}
                />
              </Col>
            </Row>
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
            point={{
              size: 5,
              shape: 'diamon',
            }}
            color="#0083cb" // @fusion-primary-color
          />
        )}
        {graphValue === 'bar' && (
          <Column
            height={100}
            data={histoValues}
            yField="doc_count"
            xField="key"
            color="#0083cb" // @fusion-primary-color
          />
        )}
      </Form.Item>
    </>
  );
};

export default NumberFilterOptions;
