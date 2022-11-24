import * as React from 'react';
import './SearchBar.less';
import {
  LastVisited,
  ProjectSearchHit,
  StudioSearchHit,
} from '../../containers/SearchBarContainer';
declare const SearchBar: React.FC<{
  projectList: ProjectSearchHit[];
  studioList: StudioSearchHit[];
  query?: string;
  lastVisited?: LastVisited;
  onSearch: (value: string) => void;
  onSubmit: (value: string, option: any) => void;
  onFocus: () => void;
  onClear: () => void;
  onBlur: () => void;
  inputOnPressEnter: () => void;
}>;
export default SearchBar;
