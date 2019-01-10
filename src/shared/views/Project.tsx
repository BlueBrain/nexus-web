import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import {
  fetchResources,
  fetchSchemas,
  selectSchema,
} from '../store/actions/nexus';
import ResourceList from '../components/Resources/ResourceList';
import Skeleton from '../components/Skeleton';
import { AutoComplete, Input, Icon } from 'antd';
import TypesIcon from '../components/Types/TypesIcon';

const Option = AutoComplete.Option;

interface ProjectViewProps {
  orgLabel: string;
  projectLabel: string;
  busy: boolean;
  resources: PaginatedList<Resource>;
  resourcePaginationSettings: PaginationSettings;
  schemas?: any;
  types?: any;
  selectedSchema?: string;
  fetching: boolean;
  fetchSchemas(org: string, project: string): void;
  selectSchema(value: string): void;
  fetchResources(
    org: string,
    project: string,
    resourcePaginationSettings: PaginationSettings,
    query?: any
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
  selectSchema,
  selectedSchema,
  fetching,
  resourcePaginationSettings,
  match,
  schemas,
  types,
}) => {
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

  // if (busy) {
  //   return (
  //     <Skeleton
  //       itemNumber={10}
  //       active
  //       avatar
  //       paragraph={{
  //         rows: 0,
  //       }}
  //       title={{
  //         width: '100%',
  //       }}
  //     />
  //   );
  // }
  // if (resources.total === 0) {
  //   return <p>no resources</p>;
  // }
  return (
    <React.Fragment>
      <ResourceList
        loading={busy}
        header={
          <div className="certain-category-search-wrapper">
            {!busy && (
              <div>
                <p>Filter</p>
                <AutoComplete
                  className="certain-category-search"
                  dropdownClassName="certain-category-search-dropdown"
                  dropdownMatchSelectWidth={false}
                  onSelect={(value, option) => {
                    console.log(value, option);
                    selectSchema(value as string);
                    fetchResources(
                      match.params.org,
                      match.params.project,
                      resourcePaginationSettings
                    );
                  }}
                  value={selectedSchema}
                  size="large"
                  style={{ width: '100%', marginBottom: '1em' }}
                  dataSource={schemas.map(({ key, count }: any) => (
                    <Option key={key} value={key}>
                      <a className="certain-search-item-count">
                        {count} resources
                      </a>{' '}
                      {key}
                    </Option>
                  ))}
                  placeholder={`Filter by Schema (${schemas.length} schemas)`}
                  optionLabelProp="value"
                >
                  <Input
                    suffix={
                      <Icon type="filter" className="certain-category-icon" />
                    }
                  />
                </AutoComplete>

                <AutoComplete
                  className="certain-category-search"
                  dropdownClassName="certain-category-search-dropdown"
                  dropdownMatchSelectWidth={false}
                  onSelect={(value, option) => {
                    console.log(value, option);
                    // selectSchema(value as string);
                    // fetchResources(
                    //   match.params.org,
                    //   match.params.project,
                    //   resourcePaginationSettings
                    // );
                  }}
                  size="large"
                  style={{ width: '100%', marginBottom: '1em' }}
                  dataSource={types.map(({ key, count }: any) => (
                    <Option key={key} value={key}>
                      <TypesIcon type={[key]} />{' '}
                      <a className="certain-search-item-count">
                        {count} resources
                      </a>{' '}
                      {key}
                    </Option>
                  ))}
                  placeholder={`Filter by @type (${types.length} @types)`}
                  optionLabelProp="value"
                >
                  <Input
                    suffix={
                      <Icon type="filter" className="certain-category-icon" />
                    }
                  />
                </AutoComplete>
              </div>
            )}
          </div>
        }
        resources={resources}
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
  types: (state.nexus && state.nexus.types) || {},
  selectedSchema: state.nexus && state.nexus.selectedSchema,
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
  selectSchema: (value: string) => dispatch(selectSchema(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
