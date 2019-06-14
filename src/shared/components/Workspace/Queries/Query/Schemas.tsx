import * as React from 'react';
import { AutoComplete, Input } from 'antd';
import { List } from '../../../../store/reducers/lists';
import { labelOf, getProp } from '../../../../utils';
import { SelectValue } from 'antd/lib/select';
import './filter-dropdown.less';

const Option = AutoComplete.Option;

interface SchemaFilterProps {
  filters: List['query']['filters'];
  schemas: { key: string; count: number }[] | null;
  onChange: (value: { [filterKey: string]: string }) => void;
}

const FILTER_KEY = '_constrainedBy';

const SchemasFilter: React.FunctionComponent<SchemaFilterProps> = props => {
  const { filters, schemas, onChange } = props;
  const value = filters[FILTER_KEY];
  const [inputValue, setInputValue] = React.useState(value);
  const [filterList, setFilterList] = React.useState(schemas || []);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  React.useEffect(() => {
    setFilterList(schemas || []);
  }, [schemas]);

  const handleChange = (value: SelectValue) => {
    onChange({ [FILTER_KEY]: value as string });
  };

  const handleInputChange = (value: SelectValue) => {
    // if value has been cleared, call handle change in order
    // to remove filter from ES query
    if (value === undefined) {
      handleChange('');
    }
    setInputValue(value as string);
  };

  return (
    <div className="filter-dropdown -schemas">
      <AutoComplete
        dropdownMatchSelectWidth={false}
        optionLabelProp="label"
        placeholder="Filter by Schema"
        onChange={handleInputChange}
        onSelect={handleChange}
        value={inputValue}
        allowClear={true}
        filterOption={(inputValue, option) =>
          getProp(option, 'props.label', '')
            .toUpperCase()
            .includes(inputValue.toUpperCase())
        }
        dataSource={filterList.map(({ key, count }) => {
          const label = labelOf(key);
          return (
            // @ts-ignore (overloaded Options props with label, it works!)
            <Option key={key} value={key} label={label}>
              <div className="drop-option">
                <div className="label">
                  <span className="count">({count})</span> {label}
                </div>
              </div>
            </Option>
          );
        })}
      >
        <Input />
      </AutoComplete>
    </div>
  );
};

export default SchemasFilter;
