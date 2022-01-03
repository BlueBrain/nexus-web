import { Slider, InputNumber, Form, Col, Row } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import './FilterOptions.less';
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
}> = ({ filter, field, onFinish }) => {
  const fieldFilter = filter.find(f => {
    return f.filterTerm === field.name;
  });
  const [rangeStart, setRangeStart] = React.useState<number>(
    fieldFilter?.filters[0] ? parseInt(fieldFilter?.filters[0]) : 1
  );
  const [rangeEnd, setRangeEnd] = React.useState<number>(
    fieldFilter?.filters[1] ? parseInt(fieldFilter?.filters[1]) : 10
  );
  console.log(
    'NUMBER FIELD FILTER initial Values: filter field fieldFilter dateStart dateEnd'
  );

  const onSliderChange = (value: Array<number>) => {
    setRangeStart(value[0]);
    setRangeEnd(value[1]);
  };

  const [form] = Form.useForm();

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
    <Row>
      <Col flex={1}>
        <InputNumber
          min={0}
          max={99}
          style={{ margin: '0 16px' }}
          value={rangeStart}
          onChange={value => {
            setRangeStart(value);
          }}
        />
      </Col>
      <Col flex={10}>
        <Slider
          range={{ draggableTrack: true }}
          step={1}
          value={[rangeStart, rangeEnd]}
          onChange={onSliderChange}
        />
        {/* <Slider range={{ draggableTrack: true }} defaultValue={[20, 50]} /> */}
      </Col>
      <Col flex={1}>
        <InputNumber
          min={1}
          max={100}
          style={{ margin: '0 16px' }}
          value={rangeEnd}
          onChange={value => {
            setRangeStart(value);
          }}
        />
      </Col>
    </Row>
  );
};

export default NumberFilterOptions;
