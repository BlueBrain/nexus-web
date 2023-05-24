import * as React from 'react';
import SearchContainer from '../../subapps/search/containers/SearchContainer';
import ErrorBoundary from '../../subapps/search/components/SearchErrorBoundary';
import CreationPanel from '../../shared/molecules/CreationPanel/CreationPanel';
import '../../shared/styles/search-tables.less';

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
