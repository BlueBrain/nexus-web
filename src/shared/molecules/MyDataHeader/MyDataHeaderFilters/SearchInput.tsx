import { Checkbox, Input } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { THeaderFilterProps } from 'shared/canvas/MyData/types';

type TSearchInputProps = Pick<
  THeaderFilterProps,
  'locate' | 'query' | 'setFilterOptions'
>;
const SearchInput = ({
  query,
  locate,
  setFilterOptions,
}: TSearchInputProps) => {
  const onSearchLocateChange = (e: CheckboxChangeEvent) =>
    setFilterOptions({ locate: e.target.checked });
  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = event =>
    setFilterOptions({ query: event.target.value });
  return (
    <div className="my-data-search-container">
      <Input.Search
        allowClear
        className="my-data-search"
        placeholder="Search dataset"
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
