import * as React from 'react';
import { useSelector } from 'react-redux';

import IdentityPage from '../../pages/IdentityPage/IdentityPage';
import { MyData } from '../../shared/canvas';
import { HomeSeachByPresets, HomeSearchByApps } from '../../shared/organisms';
import { RootState } from '../../shared/store/reducers';

const Home: React.FunctionComponent = () => {
  const oidc = useSelector((state: RootState) => state.oidc);
  const userAuthenticated = oidc && !!oidc.user?.access_token;
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
