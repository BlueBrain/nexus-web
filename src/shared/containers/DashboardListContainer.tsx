import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import TabList from '../components/Tabs/TabList';
import DashboardResultsContainer from './DashboardResultsContainer';
import { getResourceLabelsAndIdsFromSelf } from '../utils';
import { useHistory } from 'react-router-dom';
import ResourceCardComponent from '../components/ResourceCard';
import { Button } from 'antd';

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
  const [selectedResource, setSelectedResource] = React.useState<Resource>();
  const [dashboardResources, setDashboardResources] = React.useState<
    Resource[]
  >([]);
  const [selectedDashboard, setSelectedDashboard] = React.useState<Resource>();
  const nexus = useNexusContext();
  const handleClick = (selfUrl: string) => {
    nexus
      .httpGet({ path: selfUrl })
      .then(res => {
        setSelectedResource(res);
      })
      .catch(e => {
        // TODO: show a meaningful error to the user.
      });
  };
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
    <div>
      {dashboardResources.length > 0 ? (
        <>
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
              selectedResource ? (
                <div className="studio-resource">
                  <Button
                    type="primary"
                    size="small"
                    className={'studio-back-button'}
                    icon="caret-left"
                    onClick={() => setSelectedResource(undefined)}
                  >
                    {' '}
                    Back{' '}
                  </Button>
                  <ResourceCardComponent resource={selectedResource} />
                </div>
              ) : (
                <DashboardResultsContainer
                  handleClick={handleClick}
                  orgLabel={orgLabel}
                  projectLabel={projectLabel}
                  viewId={dashboards[0].view}
                  dataQuery={selectedDashboard['dataQuery']}
                />
              )
            ) : null}
          </TabList>
        </>
      ) : (
        'No Dashboards are available'
      )}
    </div>
  );
};

export default DashboardList;
