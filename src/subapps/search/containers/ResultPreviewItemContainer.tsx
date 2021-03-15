import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import * as prettyBytes from 'pretty-bytes';
import { convertMarkdownHandlebarStringWithData } from '../../../shared/utils/markdownTemplate';
import { getResourceLabel } from '../../../shared/utils';
import { parseURL, ParsedNexusUrl } from '../../../shared/utils/nexusParse';
import MarkdownViewerContainer from '../../../shared/containers/MarkdownViewer';
import { FILE_SCHEMA } from '../../../shared/types/nexus';

const ResultPreviewItemContainer: React.FC<{
  resource: Resource;
  defaultPreviewItemTemplate: string;
}> = ({ resource, defaultPreviewItemTemplate }) => {
  const markdownHandlebarTemplate =
    resource.previewTemplate || defaultPreviewItemTemplate;

  let parsedUrl: ParsedNexusUrl | undefined;

  try {
    parsedUrl = parseURL(resource._self);
  } catch {
    // fail silently
    console.error(resource._self);
  }

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
        resourceAdminData: parsedUrl ? parsedUrl : '',
        fileData: resource._constrainedBy === FILE_SCHEMA && {
          humanReadableFileSize: prettyBytes(resource._bytes),
        },
      }}
    />
  );
};

export default ResultPreviewItemContainer;
