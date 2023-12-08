import '../../shared/styles/search-tables.scss';

import * as React from 'react';

import CreationPanel from '../../shared/molecules/CreationPanel/CreationPanel';
import ErrorBoundary from '../../subapps/search/components/SearchErrorBoundary';
import SearchContainer from '../../subapps/search/containers/SearchContainer';

const SearchPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <React.Fragment>
        <CreationPanel />
        <div className="search-container">
          <SearchContainer />
          <div className="tooltipContainer search-tooltip" />
        </div>
      </React.Fragment>
    </ErrorBoundary>
  );
};

export default SearchPage;
