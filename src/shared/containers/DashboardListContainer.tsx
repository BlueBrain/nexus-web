import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';
import { getResourceLabelsAndIdsFromSelf } from '../utils';
import { useHistory } from 'react-router-dom';
import { RootState } from '../store/reducers';
import { useSelector } from 'react-redux';

type Dashboard = {
  dashboard: string;
  view: string;
};
interface DashboardListProps {
  dashboards: Dashboard[];
  orgLabel: string;
  projectLabel: string;
}

const DashboardList: React.FunctionComponent<DashboardListProps> = ({
  dashboards,
  orgLabel,
  projectLabel,
}) => {
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const makeResourceUri = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    return `${basePath}/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
      resourceId
    )}`;
  };
  const history = useHistory();
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboard, setSelectedDashboard] = React.useState<Resource>();
  const nexus = useNexusContext();
  const selectDashboard = (id: string) => {
    const dashboard = dashboardResources.find(d => d['@id'] === id);
    setSelectedDashboard(dashboard);
  };
  React.useEffect(() => {
    Promise.all(
      dashboards.map(dashboardObject => {
        return nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(dashboardObject.dashboard)
        );
      })
    )
      .then(values => {
        setDashboardResources(values);
        setSelectedDashboard(values[0]);
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  }, [orgLabel, projectLabel]);
  return (
    <>
      {dashboardResources.length > 0 ? (
        <TabList
          items={dashboardResources.map(w => ({
            label: w.label,
            description: w.description,
            id: w['@id'],
          }))}
          onSelected={(id: string) => {
            selectDashboard(id);
          }}
          position="left"
        >
          {selectedDashboard ? (
            <DashboardResultsContainer
              handleClick={(selfUrl: string) => {
                const {
                  orgLabel,
                  projectLabel,
                  resourceId,
                } = getResourceLabelsAndIdsFromSelf(selfUrl);
                const path = makeResourceUri(
                  orgLabel,
                  projectLabel,
                  resourceId
                );
                history.push(path);
              }}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              viewId={dashboards[0].view}
              dataQuery={selectedDashboard['dataQuery']}
            />
          ) : null}
        </TabList>
      ) : (
        'No Dashboards are available'
      )}
    </>
  );
};

export default DashboardList;
