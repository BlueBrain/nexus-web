import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { convertMarkdownHandlebarStringWithData } from '../../../shared/utils/markdownTemplate';

const ResultPreviewItemContainer: React.FC<{
  resource: Resource;
  defaultPreviewItemTemplate: string;
}> = ({ resource, defaultPreviewItemTemplate }) => {
  const markdownHandlebarTemplate =
    resource.previewTemplate || defaultPreviewItemTemplate;

  const convertedTemplate = convertMarkdownHandlebarStringWithData(
    markdownHandlebarTemplate,
    resource
  );

  return <div dangerouslySetInnerHTML={{ __html: convertedTemplate }}></div>;
};

export default ResultPreviewItemContainer;
