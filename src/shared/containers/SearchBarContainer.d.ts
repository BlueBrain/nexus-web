import * as React from 'react';
declare type SearchHit = {
  organisation: string;
  project: string;
  label: string;
  searchString: string;
  type: 'studio' | 'project';
};
export declare type ProjectSearchHit = SearchHit & {
  type: 'project';
};
export declare type StudioSearchHit = SearchHit & {
  type: 'studio';
  studioId: string;
};
export declare type LastVisited = {
  value: string;
  path: string;
  type: 'studio' | 'project' | 'search';
};
declare const SearchBarContainer: React.FC;
export default SearchBarContainer;
