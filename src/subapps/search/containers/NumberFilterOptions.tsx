import { Slider, InputNumber, Form, Col, Row } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import './FilterOptions.less';

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
    'DATE FIELD FILTER initial Values: filter field fieldFilter dateStart dateEnd'
  );
  console.log(filter);
  console.log(field);
  console.log(fieldFilter);
  console.log(rangeStart);
  console.log(rangeEnd);

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
    <Form form={form} className="field-filter-menu">
      <Form.Item>
        <Row>
          <Col span={3}>
            <InputNumber
              min={0}
              max={99}
              style={{ margin: '0 16px' }}
              value={rangeStart}
              onChange={() => {
                setRangeStart(rangeStart);
              }}
            />
          </Col>
          <Col span={10}>
            <Slider
              range
              step={10}
              value={[rangeStart, rangeEnd]}
              onChange={() => {
                setRangeStart(rangeStart);
                setRangeEnd(rangeEnd);
              }}
            />
          </Col>
          <Col span={3}>
            <InputNumber
              min={1}
              max={100}
              style={{ margin: '0 16px' }}
              value={rangeEnd}
              onChange={() => {
                setRangeStart(rangeStart);
              }}
            />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default NumberFilterOptions;
