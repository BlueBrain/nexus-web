import * as React from 'react';
import {
  Resource,
  NexusClient,
  GetFileOptions,
  NexusFile,
} from '@bbp/nexus-sdk';
import { Button, Collapse, Table } from 'antd';
import PDFViewer from './PDFPreview';
import useNotification from '../../hooks/useNotification';

const parseResourceId = (url: string) => {
  const fileUrlPattern = /files\/([\w-]+)\/([\w-]+)\/(.*)/;
  if (fileUrlPattern.test(url)) {
    const [, , , resourceId] = url.match(fileUrlPattern) as string[];
    return decodeURIComponent(resourceId);
  }

  if (/[w-]+/.test(url)) {
    return url;
  }

  return '';
};

const parseProjectUrl = (projectUrl: string) => {
  const projectUrlR = /projects\/([\w-]+)\/([\w-]+)\/?$/;
  const [, org, proj] = projectUrl.match(projectUrlR) as string[];
  return [org, proj];
};

const Preview: React.FC<{
  resource: Resource;
  nexus: NexusClient;
}> = ({ resource, nexus }) => {
  const notification = useNotification();
  const [previewAsset, setPreviewAsset] = React.useState<any | undefined>();

  const [orgLabel, projectLabel] = parseProjectUrl(resource._project);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: 'Asset Type',
      dataIndex: 'encodingFormat',
      key: 'encodingFormat',
      render: (text: string) => (text ? text : '-'),
    },
    {
      title: '',
      dataIndex: 'asset',
      key: 'actions',
      render: (asset: {
        url: string;
        name: string;
        encodingFormat: string;
      }) => {
        return (
          <>
            <Button onClick={() => setPreviewAsset(asset)}>Preview</Button>
            <Button onClick={() => copyURI(asset.url)}>Copy URI</Button>
            <Button
              onClick={() => download(nexus, orgLabel, projectLabel, asset)}
            >
              Download
            </Button>
          </>
        );
      },
    },
  ];

  const copyURI = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      notification.success({ message: 'URL Copied to clipboard' });
    } catch {
      notification.error({
        message: 'Failed to copy the url',
      });
    }
  };

  const download = async (
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string,
    asset: { url: string; name: string }
  ) => {
    const resourceId = parseResourceId(asset.url);
    let contentUrl = resourceId;
    const options: GetFileOptions = {
      as: 'blob',
    };

    if (resourceId.includes('?rev=')) {
      const [url, rev] = resourceId.split('?rev=');
      contentUrl = url;
      options.rev = parseInt(rev, 10);
    }

    try {
      const rawData = await nexus.File.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(contentUrl),
        options
      );

      downloadBlobHelper(rawData, asset.name);
    } catch (error) {
      notification.error({
        message: 'Failed to download the file',
        description: error.reason || error.message,
      });
    }
  };

  const downloadBlobHelper = (
    rawData: string | NexusFile | Blob | FormData,
    name: string
  ) => {
    const blob = new Blob([rawData as string], {
      type: 'octet/stream',
    });
    const src = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.download = name;
    document.body.appendChild(a);
    a.href = src;
    a.click();
    URL.revokeObjectURL(src);
  };

  const getResourceAssets = (resource: Resource) => {
    let data: any = [];

    /* get assets dependening on type of resource */
    if (resource.distribution) {
      const { distribution } = resource;
      data = data.concat(
        [distribution].flat().map((d, i) => {
          return {
            key: i,
            name: d.name || d.repository.name || d.repository['@id'],
            asset: {
              url: d.contentUrl || d.url,
              name: d.name,
              encodingFormat: d.encodingFormat,
            },
            encodingFormat: d.encodingFormat || '-',
            contentSize: d.contentSize,
          };
        })
      );
    }
    return data;
  };

  return (
    <div>
      {previewAsset && previewAsset.encodingFormat === 'application/pdf' && (
        <PDFViewer
          url={previewAsset.url}
          closePreview={() => setPreviewAsset(undefined)}
        />
      )}
      <Collapse onChange={() => {}}>
        <Collapse.Panel header="Preview" key="99">
          <Table
            columns={columns}
            dataSource={getResourceAssets(resource)}
          ></Table>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default Preview;
