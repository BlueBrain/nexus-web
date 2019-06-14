import * as React from 'react';
import { AutoComplete, Input } from 'antd';
import { List } from '../../../../store/reducers/lists';
import { TypesIcon } from '../../../Types/TypesIcon';
import { labelOf, getProp } from '../../../../utils';
import { SelectValue } from 'antd/lib/select';
import './filter-dropdown.less';

const Option = AutoComplete.Option;

interface TypesFilterProps {
  filters: List['query']['filters'];
  types: { key: string; count: number }[] | null;
  onChange: (value: { [filterKey: string]: string }) => void;
}

const TYPES_FILTER_KEY = '@type';

const TypesFilter: React.FunctionComponent<TypesFilterProps> = props => {
  const { filters, types, onChange } = props;
  const value = filters[TYPES_FILTER_KEY];
  const [inputValue, setInputValue] = React.useState(value);
  const [typesList, setTypesList] = React.useState(types || []);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  React.useEffect(() => {
    setTypesList(types || []);
  }, [types]);

  const handleChange = (value: SelectValue) => {
    onChange({ [TYPES_FILTER_KEY]: value as string });
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
    <div className="filter-dropdown -types">
      <AutoComplete
        dropdownMatchSelectWidth={false}
        optionLabelProp="label"
        placeholder="Filter by Type"
        onChange={handleInputChange}
        onSelect={handleChange}
        value={inputValue}
        allowClear={true}
        filterOption={(inputValue, option) =>
          getProp(option, 'props.label', '')
            .toUpperCase()
            .includes(inputValue.toUpperCase())
        }
        dataSource={typesList.map(({ key, count }) => {
          const label = labelOf(key);
          return (
            // @ts-ignore (overloaded Options props with label, it works!)
            <Option key={key} value={key} label={label}>
              <div className="drop-option">
                <div className="label">
                  <span className="count">({count})</span> {label}
                </div>
                <TypesIcon type={label} />
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

export default TypesFilter;
