import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import { DefaultSchemaLink } from '../components/ResourceCard';

const expandedConstrainedByKey =
  'https://bluebrain.github.io/nexus/vocabulary/constrainedBy';

const SchemaLinkContainer: React.FunctionComponent<{
  resource: Resource;
}> = ({ resource }) => {
  const nexus = useNexusContext();

  React.useEffect(() => {
    // First get the expanded resource
    // So we can see the expanded
    // _contstrainedBy value
    nexus
      .httpGet({
        path: `${resource._self}?format=expanded`,
        headers: {
          Accept: 'application/json', // in case its a file
        },
      })
      .then(({ [expandedConstrainedByKey]: constrainedBy }) => {
        console.log({ constrainedBy });
      })
      .catch(error => {
        // TODO: implement error message?
      });
  }, [resource._self]);

  return DefaultSchemaLink({ resource });
};

export default SchemaLinkContainer;
