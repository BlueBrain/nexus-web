import { Checkbox, Input } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { THeaderProps } from 'shared/canvas/MyData/types';

type TSearchInputProps = Pick<THeaderProps, 'locate' | 'query' | 'setFilterOptions'>;
const SearchInput = ({ query, locate, setFilterOptions }: TSearchInputProps) => {
  const onSearchLocateChange = (e: CheckboxChangeEvent) =>
    setFilterOptions({ locate: e.target.checked });
  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = (event) =>
    setFilterOptions({ query: event.target.value });
  return (
    <div className="my-data-header-title_search">
      <Input.Search
        allowClear
        className="my-data-search"
        placeholder="Search for data"
        bordered={false}
        value={query}
        onChange={handleQueryChange}
        style={{ marginLeft: 'auto' }}
      />
      <div className="filter-options">
        <Checkbox checked={locate} onChange={onSearchLocateChange}>
          <span className="locate-text">By resource id or self</span>
        </Checkbox>
      </div>
    </div>
  );
};

export default SearchInput;
