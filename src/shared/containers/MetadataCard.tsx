import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import MetadataCardComponent from '../components/MetadataCard';

const MetadataCardContainer: React.FunctionComponent<{
  resource: Resource;
}> = props => {
  // TODO: previews are broken until the new SDK version with resource.GET updates is released
  const preview = null;
  return (
    <MetadataCardComponent
      resource={props.resource}
      preview={preview}
    ></MetadataCardComponent>
  );
};

export default MetadataCardContainer;
