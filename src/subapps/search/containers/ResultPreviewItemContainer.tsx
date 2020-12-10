import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import * as prettyByes from 'pretty-bytes';
import { convertMarkdownHandlebarStringWithData } from '../../../shared/utils/markdownTemplate';
import useAsyncCall from '../../../shared/hooks/useAsynCall';
import { getResourceLabel } from '../../../shared/utils';
import { parseURL } from '../../../shared/utils/nexusParse';

export const FILE_SCHEMA =
  'https://bluebrain.github.io/nexus/schemas/file.json';

const makeMarkdown = async (template: string, resource: Resource) => {
  const convertedTemplate = convertMarkdownHandlebarStringWithData(template, {
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
      humanReadableFileSize: prettyByes(resource._bytes),
    },
  });

  return convertedTemplate;
};

const ResultPreviewItemContainer: React.FC<{
  resource: Resource;
  defaultPreviewItemTemplate: string;
}> = ({ resource, defaultPreviewItemTemplate }) => {
  const markdownHandlebarTemplate =
    resource.previewTemplate || defaultPreviewItemTemplate;

  const markdownData = useAsyncCall<string, Error>(
    makeMarkdown(markdownHandlebarTemplate, resource),
    [resource, defaultPreviewItemTemplate]
  );

  return !markdownData.error && markdownData.data ? (
    <div dangerouslySetInnerHTML={{ __html: markdownData.data }}></div>
  ) : null;
};

export default ResultPreviewItemContainer;
