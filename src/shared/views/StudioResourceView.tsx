import * as React from 'react';
import { useParams, useHistory } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { notification, Empty } from 'antd';
import { getResourceLabel } from '../utils';
import ResourcePlugins from '../containers/ResourcePlugins';

const StudioResourceView: React.FunctionComponent<{}> = () => {
  const nexus = useNexusContext();
  const { resourceSelfUri = '' } = useParams();
  const history = useHistory();
  const [resource, setResource] = React.useState<Resource | null>();

  React.useEffect(() => {
    setResource(resource);

    let resourceResponse;

    nexus
      .httpGet({
        path: atob(resourceSelfUri),
        headers: { Accept: 'application/json' },
      })
      .then(resource => {
        resourceResponse = resource;
        setResource(resourceResponse);
      })
      .catch(error => {
        notification.error({
          message: `Could not load Resource`,
          description: error.message,
        });
      });
  }, [resourceSelfUri]);

  const goToStudioResource = (selfUrl: string) => {
    const studioResourceViewLink = `/?_self=${selfUrl}`;
    history.push(studioResourceViewLink);
  };

  if (!resource) return null;

  const label = getResourceLabel(resource);

  return (
    <div className="studio-resource-view">
      <h1>{label}</h1>
      <p>{resource.description}</p>
      <ResourcePlugins
        resource={resource}
        goToResource={goToStudioResource}
        empty={<Empty description="No plugins configured" />}
      />
    </div>
  );
};

export default StudioResourceView;
