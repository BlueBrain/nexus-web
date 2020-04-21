import * as React from 'react';

import GlobalHeader from '../components/GlobalHeader';
import GlobalStudiosContainer from '../containers/GlobalStudiosContainer';

const StudioListView = () => {
  return (
    <div className="studio-list-view">
      <GlobalHeader />
      <h1>Studios</h1>
      <GlobalStudiosContainer orgLabel={'studios'} projectLabel={'Test'} />
    </div>
  );
};

export default StudioListView;
