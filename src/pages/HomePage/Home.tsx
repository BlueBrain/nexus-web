import * as React from 'react';
import { useSelector } from 'react-redux';
import { HomeSeachByPresets, HomeSearchByApps } from '../../shared/organisms';
import { RootState } from '../../shared/store/reducers';
import { MyData } from '../../shared/canvas';
import AuthenticationPage from '../LandingPage/LandingPage';

const Home: React.FunctionComponent = () => {
  const userLoggedIn = useSelector(
    ({ oidc }: RootState) => oidc && !!oidc.user
  );
  if (!userLoggedIn) {
    return <AuthenticationPage />
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
