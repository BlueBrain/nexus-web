import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { HomeSeachByPresets, HomeSearchByApps, HomeAuthentication } from '../organisms';
import { MyData } from '../canvas';
import useSubApps from '../hooks/useSubApps';

const Home: React.FunctionComponent = () => {
  const { subAppProps } = useSubApps();
  const userLoggedIn = useSelector(
    ({ oidc }: RootState) => oidc && !!oidc.user
  );
  if (!userLoggedIn) {
    return <HomeAuthentication />
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
