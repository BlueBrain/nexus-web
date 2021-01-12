import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import * as prettyBytes from 'pretty-bytes';
import { convertMarkdownHandlebarStringWithData } from '../../../shared/utils/markdownTemplate';
import { getResourceLabel } from '../../../shared/utils';
import { parseURL } from '../../../shared/utils/nexusParse';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import { FILE_SCHEMA } from '../../../shared/types/nexus';

const ResultPreviewItemContainer: React.FC<{
  resource: Resource;
  defaultPreviewItemTemplate: string;
}> = ({ resource, defaultPreviewItemTemplate }) => {
  const markdownHandlebarTemplate =
    resource.previewTemplate || defaultPreviewItemTemplate;

  return (
    <MarkdownViewerContainer
      template={markdownHandlebarTemplate}
      data={{
        ...resource,
        description: convertMarkdownHandlebarStringWithData(
          resource.description || '',
          resource
        ),
        type: (Array.isArray(resource['@type'])
          ? resource['@type']
          : [resource['@type']]
        ).map(typeURL => typeURL?.split('/').reverse()[0]),
        resourceLabel: getResourceLabel(resource),
        resourceAdminData: parseURL(resource._self),
        fileData: resource._constrainedBy === FILE_SCHEMA && {
          humanReadableFileSize: prettyBytes(resource._bytes),
        },
      }}
    />
  );
};

export default ResultPreviewItemContainer;
