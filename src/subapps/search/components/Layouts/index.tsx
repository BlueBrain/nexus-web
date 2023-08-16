import { TableOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { SearchLayout } from '../../hooks/useGlobalSearch';
import './SearchLayouts.scss';

type SearchLayoutProps = {
  layouts?: SearchLayout[];
  selectedLayout?: string;
  onChangeLayout: (layout: string) => void;
};

const SearchLayouts = ({
  layouts,
  onChangeLayout,
  selectedLayout,
}: SearchLayoutProps) => (
  <Select
    suffixIcon={<TableOutlined />}
    onChange={layout => onChangeLayout(layout as string)}
    value={selectedLayout}
    dropdownMatchSelectWidth={false}
    className="search-layout"
    options={layouts?.map(o => ({ key: o.name, value: o.name }))}
  />
);

export default SearchLayouts;
