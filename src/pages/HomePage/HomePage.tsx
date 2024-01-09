import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeSearchByPresets, HomeSearchByApps } from '../../shared/organisms';
import { MyData } from '../../shared/canvas';
import { RootState } from '../../shared/store/reducers';
import IdentityPage from '../../pages/IdentityPage/IdentityPage';

const Home: React.FunctionComponent = () => {
  const oidc = useSelector((state: RootState) => state.oidc);
  const userAuthenticated = oidc && !!oidc.user?.id_token;
  if (!userAuthenticated) {
    return <IdentityPage />;
  }

  return (
    <div className="home-view view-container">
      <HomeSearchByPresets />
      <HomeSearchByApps />
      <MyData />
    </div>
  );
};

export default Home;
