import { Form, Checkbox, DatePicker } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import { FilterState } from '../hooks/useGlobalSearch';
import './FilterOptions.scss';
import moment from 'moment';

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

const DateFilterOptions: React.FC<{
  field: ConfigField;
  onFinish: (values: any) => void;
  nexusClient: NexusClient;
  filter: FilterState[];
  query: string;
}> = ({ filter, field, onFinish }) => {
  const firstRender = React.useRef<boolean>(true);
  const fieldFilter = filter.find(f => {
    return f.filterTerm === field.name;
  });
  const [dateStart, setDateStart] = React.useState<string>(
    fieldFilter?.filters[0] ? fieldFilter?.filters[0] : ''
  );
  const [dateEnd, setDateEnd] = React.useState<string>(
    fieldFilter?.filters[1] ? fieldFilter?.filters[1] : ''
  );

  const [isToday, setIsToday] = React.useState<boolean>(false);

  const [form] = Form.useForm();

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const currentFilters = [];
    if (isToday) {
      const now = new Date(Date.now()).toISOString().split('T')[0];
      currentFilters.push(now);
    } else {
      currentFilters.push(dateStart);
      currentFilters.push(dateEnd);
    }
    onFinish({
      filterType: 'date',
      filters: currentFilters,
      filterTerm: field.name,
    });
  }, [dateStart, dateEnd, isToday]);

  return (
    <Form form={form} className="field-filter-menu">
      <Form.Item>
        <Checkbox
          onChange={e => {
            setIsToday(e.target.checked);
          }}
        >
          Today
        </Checkbox>
      </Form.Item>
      {isToday ? null : (
        <DatePicker.RangePicker
          defaultValue={[
            dateStart ? moment(dateStart) : null,
            dateEnd ? moment(dateEnd) : null,
          ]}
          allowEmpty={[true, true]}
          onChange={(date, dateString) => {
            setDateStart(dateString[0]);
            setDateEnd(dateString[1]);
          }}
        ></DatePicker.RangePicker>
      )}
    </Form>
  );
};

export default DateFilterOptions;
