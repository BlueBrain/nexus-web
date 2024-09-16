import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk/es';

import { getOrgAndProjectFromResource } from '../utils';
import { useHistory } from 'react-router';
import SchemaLink from '../components/SchemaLink';

const EXPANDED_CONSTRAINED_BY_KEY =
  'https://bluebrain.github.io/nexus/vocabulary/constrainedBy';

const SchemaLinkContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const history = useHistory();
  const nexus = useNexusContext();
  const labels = getOrgAndProjectFromResource(resource);
  const [goToSchema, setGoToSchema] = React.useState<any>();

  React.useEffect(() => {
    // First get the expanded resource
    // So we can see the expanded
    // _contstrainedBy value
    if (labels && labels.orgLabel && labels.projectLabel) {
      let schemaId = resource._constrainedBy;
      nexus
        .httpGet({
          path: `${resource._self}?format=expanded`,
          headers: {
            Accept: 'application/json', // in case its a file
          },
        })
        .then(({ [EXPANDED_CONSTRAINED_BY_KEY]: constrainedBy }) => {
          schemaId = constrainedBy['@id'];

          return nexus.Resolver.getResource(
            labels.orgLabel,
            labels.projectLabel,
            '_',
            encodeURIComponent(schemaId)
          );
        })
        .then((resource: Resource) => {
          const { orgLabel, projectLabel } = getOrgAndProjectFromResource(
            resource
          )!;
          // it exists inside nexus, make sure to navigate there!
          const goToSchema = () => () => {
            history.push(
              `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
                schemaId
              )}`
            );
          };
          setGoToSchema(goToSchema);
        })
        .catch(error => {
          const errorType = error['@type'];
          if (errorType === 'NotFound') {
            // Doesn't exist inside nexus, it's an external link
            const goToSchema = () => () => {
              open(schemaId);
            };
            setGoToSchema(goToSchema);
          }
          // Is it possible to have other errors?
          // TODO: handle errors
        });
    }
  }, [resource._self]);

  return SchemaLink({ resource, goToSchema });
};

export default SchemaLinkContainer;
