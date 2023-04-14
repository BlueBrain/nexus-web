import * as React from 'react';
import { SearchByPresetsCompact } from '../../shared/organisms/SearchByPresets/SearchByPresets';
import SearchContainer from '../../subapps/search/containers/SearchContainer';
import ErrorBoundary from '../../subapps/search/components/SearchErrorBoundary';
import CreationPanel from '../../shared/molecules/CreationPanel/CreationPanel';
import '../../shared/styles/search-tables.less'


const SearchPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <React.Fragment>
        <CreationPanel/>
        <div className='search-container'>
          <SearchContainer />
          <div
            className="tooltipContainer"
            style={{
              position: 'fixed',
              top: '0',
              right: '200',
              zIndex: 999,
            }}
          ></div>
        </div>

      </React.Fragment>
    </ErrorBoundary>
  );
};

export default SearchPage;
