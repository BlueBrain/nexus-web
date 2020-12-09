import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { convertMarkdownHandlebarStringWithData } from '../../../shared/utils/markdownTemplate';
import useAsyncCall from '../../../shared/hooks/useAsynCall';
import { getResourceLabel } from '../../../shared/utils';
import { parseURL } from '../../../shared/utils/nexusParse';

const makeMarkdown = async (template: string, resource: Resource) => {
  const convertedTemplate = convertMarkdownHandlebarStringWithData(template, {
    ...resource,
    type: (Array.isArray(resource['@type'])
      ? resource['@type']
      : [resource['@type']]
    ).map(typeURL => typeURL?.split('/').reverse()[0]),
    resourceLabel: getResourceLabel(resource),
    resourceAdminData: parseURL(resource._self),
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
