import * as React from 'react';

interface SearchViewProps {}

const SearchView: React.FunctionComponent<SearchViewProps> = props => {
  console.log({ props });
  return (
    <div className="search-view view-container">
      <h1>This is a SearchView</h1>
    </div>
  );
};

export default SearchView;
