import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchAndAssignResource } from '../store/actions/nexus/resource';
import { Resource } from '@bbp/nexus-sdk';
import ResourceView from '../components/Resources/ResourceView';

interface ResourceViewProps {
  match: any;
  resource: Resource | null;
  error: Error | null;
  isFetching: boolean | false;
  fetchResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => void;
}

const ResourceViewPage: React.FunctionComponent<ResourceViewProps> = props => {
  const { match, resource, error, isFetching, fetchResource } = props;
  React.useEffect(
    () => {
      fetchResource(
        match.params.org,
        match.params.project,
        match.params.resourceId
      );
    },
    [match.params.resourceId]
  );
  return (
    <ResourceView resource={resource} error={error} isFetching={isFetching} />
  );
};

const mapStateToProps = (state: RootState) => ({
  resource:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.data &&
      state.nexus.activeResource.data) ||
    null,
  error:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.error) ||
    null,
  isFetching:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.isFetching) ||
    false,
});
const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchResource: (orgLabel: string, projectLabel: string, id: string) => {
      dispatch(fetchAndAssignResource(orgLabel, projectLabel, id));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceViewPage);
