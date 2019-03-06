import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchAndAssignResource } from '../store/actions/nexus/resource';
import { Resource } from '@bbp/nexus-sdk';
import ResourceView from '../components/Resources/ResourceDetails';
import Helmet from 'react-helmet';
import Status from '../components/Routing/Status';
import { RequestErrors } from '../store/actions/utils/errors';

interface ResourceViewProps {
  match: any;
  resource: Resource | null;
  dotGraph: string | null;
  error: RequestErrors | null;
  isFetching: boolean | false;
  fetchResource: (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => void;
}

const ResourceViewPage: React.FunctionComponent<ResourceViewProps> = props => {
  const { match, resource, error, isFetching, fetchResource, dotGraph } = props;
  const fetch = () => {
    fetchResource(
      match.params.org,
      match.params.project,
      match.params.resourceId
    );
  };
  // Fetch Resource
  React.useEffect(() => {
    fetch();
  }, [match.params.resourceId]);

  return (
    <>
      {!!resource && <Helmet title={resource.name} />}
      <Status code={!!error ? error.code : 200}>
        <ResourceView
          dotGraph={dotGraph}
          onSuccess={fetch}
          resource={resource}
          error={error}
          isFetching={isFetching}
        />
      </Status>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  dotGraph:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.data &&
      state.nexus.activeResource.data.dotGraph) ||
    null,
  resource:
    (state.nexus &&
      state.nexus.activeResource &&
      state.nexus.activeResource.data &&
      state.nexus.activeResource.data.resource) ||
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
