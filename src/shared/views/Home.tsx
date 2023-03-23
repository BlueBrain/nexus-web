import * as React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { HomeSeachByPresets, HomeSearchByApps, HomeMyData, HomeAuthentication } from '../organisms';
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
      <HomeMyData />
      {/* {subAppProps.map(subApp => {
        return subApp.subAppType === 'external' ? null : subApp.requireLogin &&
          !userLoggedIn ? null : (
          <HomeLinkCard {...subApp} />
        );
      })} */}
    </div>
  );
};

export default Home;
