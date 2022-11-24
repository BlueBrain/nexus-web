import { SearchLayout } from '../../hooks/useGlobalSearch';
import './SearchLayouts.less';
declare type SearchLayoutProps = {
  layouts?: SearchLayout[];
  selectedLayout?: string;
  onChangeLayout: (layout: string) => void;
};
declare const SearchLayouts: ({
  layouts,
  onChangeLayout,
  selectedLayout,
}: SearchLayoutProps) => JSX.Element;
export default SearchLayouts;
