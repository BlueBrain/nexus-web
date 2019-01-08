import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchResources, fetchSchemas } from '../store/actions/nexus';
import ResourceList from '../components/Resources/ResourceList';
import Skeleton from '../components/Skeleton';
import { AutoComplete, Input, Icon } from 'antd';

interface ProjectViewProps {
  orgLabel: string;
  projectLabel: string;
  busy: boolean;
  resources: PaginatedList<Resource>;
  resourcePaginationSettings: PaginationSettings;
  schemas?: any;
  fetching: boolean;
  fetchSchemas(org: string, project: string): void;
  fetchResources(
    org: string,
    project: string,
    resourcePaginationSettings: PaginationSettings
  ): void;
  match: any;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  orgLabel,
  projectLabel,
  busy,
  resources,
  fetchResources,
  fetchSchemas,
  fetching,
  resourcePaginationSettings,
  match,
  schemas,
}) => {
  console.log({ schemas });

  const onPaginationChange = (page: number, size: number) => {
    const from = size * page;
    fetchResources(match.params.org, match.params.project, {
      from,
      size,
    });
  };

  React.useEffect(
    () => {
      if (
        orgLabel !== match.params.org ||
        projectLabel !== match.params.project
      ) {
        fetchResources(
          match.params.org,
          match.params.project,
          resourcePaginationSettings
        );
        fetchSchemas(match.params.org, match.params.project);
      }
    },
    [match.params.org, match.params.project]
  );

  if (busy) {
    return (
      <Skeleton
        itemNumber={10}
        active
        avatar
        paragraph={{
          rows: 0,
        }}
        title={{
          width: '100%',
        }}
      />
    );
  }
  if (resources.total === 0) {
    return <p>no resources</p>;
  }
  return (
    <React.Fragment>
      <ResourceList
        header={
          <p>Helllo</p>
          /* <div className="certain-category-search-wrapper" style={{ width: 250 }}>
      <AutoComplete
        className="certain-category-search"
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 300 }}
        size="large"
        style={{ width: '100%' }}
        dataSource={options}
        placeholder="input here"
        optionLabelProp="value"
      >
        <Input suffix={<Icon type="search" className="certain-category-icon" />} />
      </AutoComplete>
    </div> */
        }
        resources={resources}
        loading={fetching}
        paginationChange={onPaginationChange}
        paginationSettings={resourcePaginationSettings}
      />
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({
  fetching: !!(state.nexus && state.nexus.resourcesFetching),
  orgLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.org.label) ||
    '',
  projectLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.project.label) ||
    '',
  schemas: (state.nexus && state.nexus.schemas) || {},
  resources: (state.nexus &&
    state.nexus.activeProject &&
    state.nexus.activeProject.resources) || { total: 0, results: [] },
  resourcePaginationSettings: (state.nexus &&
    state.nexus.resourcePaginationSettings) || { from: 0, size: 20 },
  busy:
    (state.nexus &&
      (state.nexus.projectsFetching || state.nexus.resourcesFetching)) ||
    false,
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchResources: (
    org: string,
    project: string,
    resourcePaginationSettings: PaginationSettings
  ) => dispatch(fetchResources(org, project, resourcePaginationSettings)),
  fetchSchemas: (org: string, project: string) =>
    dispatch(fetchSchemas(org, project)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
