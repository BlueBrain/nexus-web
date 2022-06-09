import * as React from 'react';
import { useSelector } from 'react-redux';

import HomeLinkCard from '../components/HomeLinkCard';
import useSubApps from '../hooks/useSubApps';
import { RootState } from '../store/reducers';

const Home: React.FunctionComponent = () => {
  const { subAppProps } = useSubApps();
  const userLoggedIn = useSelector(
    ({ oidc }: RootState) => oidc && !!oidc.user
  );

  return (
    <div className="home-view view-container">
      {subAppProps.map(subApp => {
        return subApp.subAppType === 'external' ? null : subApp.requireLogin &&
          !userLoggedIn ? null : (
          <HomeLinkCard {...subApp} />
        );
      })}
    </div>
  );
};

export default Home;
