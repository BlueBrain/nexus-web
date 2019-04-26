import * as React from 'react';
import Search from 'antd/lib/input/Search';

interface FullTextSearchProps {
  onSearch: (value: string) => void;
  value?: string;
}

const FullTextSearch: React.FunctionComponent<FullTextSearchProps> = props => {
  const { onSearch, value } = props;
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleOnSearch = (value: string) => {
    onSearch(value);
  };

  return (
    <Search
      className="search"
      placeholder="text query"
      onChange={handleInputChange}
      onSearch={handleOnSearch}
      defaultValue={inputValue}
      value={inputValue}
    />
  );
};

export default FullTextSearch;
