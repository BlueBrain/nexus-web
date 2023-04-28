import * as React from 'react';
import { HomeSeachByPresets, HomeSearchByApps } from '../../shared/organisms';
import { MyData } from '../../shared/canvas';

const Home: React.FunctionComponent = () => {
  return (
    <div className="home-view view-container">
      <HomeSeachByPresets />
      <HomeSearchByApps />
      <MyData />
    </div>
  );
};

export default Home;
