import * as React from 'react';

import GlobalStudiosContainer from '../containers/GlobalStudiosContainer';

const StudioListView = () => {
  return (
    <div className="view-container">
      <GlobalStudiosContainer orgLabel={'studios'} projectLabel={'Test'} />
    </div>
  );
};

export default StudioListView;
