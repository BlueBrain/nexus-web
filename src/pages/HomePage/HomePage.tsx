import * as React from 'react';
import { HomeSeachByPresets, HomeSearchByApps } from '../../shared/organisms';
import { MyData } from '../../shared/canvas';
import IdentityPage from '../../pages/IdentityPage/IdentityPage';
import useUserAuthenticated from '../../shared/hooks/useUserAuthenticated';

const Home: React.FunctionComponent = () => {
  const userAuthenticated = useUserAuthenticated();
  if (!userAuthenticated) {
    return <IdentityPage />;
  }

  return (
    <div className="home-view view-container">
      <HomeSeachByPresets />
      <HomeSearchByApps />
      <MyData />
    </div>
  );
};

export default Home;
