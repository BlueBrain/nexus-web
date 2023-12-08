import './styles.scss';

import React from 'react';
import { useDispatch } from 'react-redux';

import { ModalsActionsEnum } from '../../../shared/store/actions/modals';
import { SubAppCardItem } from '../../molecules';

type AppDetails = {
  key: React.Key;
  id: string;
  title: string;
  subtitle: string;
  tileColor: string;
  link: string;
  createLabel?: string;
  action?: string;
};
const AppsList = new Map<string, AppDetails>([
  [
    'organisations',
    {
      id: 'applist/organisations',
      key: 'applist/organisations',
      title: 'Organizations',
      subtitle: 'All organizations you have access to and their respective Projects.',
      tileColor: 'linear-gradient(90deg, #F4CCA7 1.19%, #CA6666 100%)',
      link: '/orgs',
      createLabel: 'Create Organisation',
      action: ModalsActionsEnum.OPEN_ORGANIZATION_CREATION_MODAL,
    },
  ],
  [
    'projects',
    {
      id: 'applist/projects',
      key: 'applist/projects',
      title: 'Projects',
      subtitle: 'All Projects you have access to across all Organizations',
      tileColor: 'linear-gradient(90deg, #A7F4EB 1.19%, #66CABC 100%)',
      link: '/projects',
      createLabel: 'Create Project',
      action: ModalsActionsEnum.OPEN_PROJECT_CREATION_MODAL,
    },
  ],
  [
    'studios',
    {
      id: 'applist/studios',
      key: 'applist/studios',
      title: 'Studios',
      subtitle: 'Browse data organised by users of the platform',
      tileColor: 'linear-gradient(90deg, #C6A3F6 1.19%, #706CE8 100%)',
      link: '/studios',
      createLabel: 'Create Studios',
      action: ModalsActionsEnum.OPEN_STUDIO_CREATION_MODEL,
    },
  ],
]);

const HomeSearchByApps: React.FC<{}> = () => {
  const apps = [...AppsList.values()];
  const dispatch = useDispatch();
  return (
    <div className="home-searchby-appslist">
      <h2 className="home-searchby-appslist-title">Search by Lists</h2>
      <div className="home-searchby-appslist-container">
        {apps.map((app) => (
          <SubAppCardItem
            {...app}
            to={app.link}
            onCreateClick={() => {
              app.action &&
                dispatch({
                  type: app.action,
                  payload: true,
                });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeSearchByApps;
