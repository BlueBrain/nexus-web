import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import { fetchAndAssignResource } from '../store/actions/nexus/resource';
import { Resource } from '@bbp/nexus-sdk';
import ResourceView from '../components/Resources/ResourceDetails';
import Helmet from 'react-helmet';
import { ResourceGetFormat } from '@bbp/nexus-sdk/lib/Resource/types';
import { notification } from 'antd';

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
  const [dotGraph, setDotGraph] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(isFetching);
  const fetch = () => {
    fetchResource(
      match.params.org,
      match.params.project,
      match.params.resourceId
    );
  };
  React.useEffect(() => {
    fetch();
    if (!dotGraph && resource) {
      setBusy(true);
      // cannot use instance method here,
      // because sometimes we'll get 'resource'
      // as a raw js object from the server and not an instance
      Resource.getSelfRawAs(resource.self, ResourceGetFormat.DOT)
        .then(dotGraph => {
          setDotGraph(dotGraph);
          setBusy(false);
        })
        .catch(error => {
          notification.error({
            message: 'This graph data could not be fetched',
            description: error.message,
            duration: 0,
          });
          // tslint:disable-next-line:no-console
          console.error(error);
        });
    }
  }, [match.params.resourceId]);

  return (
    <>
      {!!resource && <Helmet title={resource.name} />}
      <ResourceView
        dotGraph={dotGraph}
        onSuccess={fetch}
        resource={resource}
        error={error}
        isFetching={busy && isFetching}
      />
    </>
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
