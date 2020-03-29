import * as React from 'react';
import { Table, Button } from 'antd';
import { Resource, NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { parseProjectUrl } from '../utils/index';

const DataAccessContainer: React.FC<{
  resource: Resource;
}> = ({ resource }) => {
  const nexus = useNexusContext();
  const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'URI',
      dataIndex: 'contentUrl',
      key: 'contentUrl',
    },
    {
      title: 'Action',
      dataIndex: 'contentUrl',
      key: 'contentUrl',
      render: (text: string) => makeDownloadButton(text),
    },
  ];

  const makeDownloadButton = (url: string) => {
    try {
      const URI = new URL(url);

      if (URI.hostname.indexOf(window.location.hostname) >= 0) {
        const [orgLabel, projectLabel] = parseProjectUrl(url);
        const downloadCallback = downloader(nexus, orgLabel, projectLabel);
        return <Button onClick={() => downloadCallback(url)}>Download</Button>;
      }
      return (
        <Button
          onClick={() => {
            try {
              navigator.clipboard.writeText(url);
            } catch {
              console.log('Copy failed ..');
            }
          }}
        >
          Copy
        </Button>
      );
    } catch {
      const downloadCallback = downloader(nexus, orgLabel, projectLabel);
      return <Button onClick={() => downloadCallback(url)}>Download</Button>;
    }
  };

  const downloader = (
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string
  ) => {
    return (resourceId: string) => {
      nexus.File.get(orgLabel, projectLabel, encodeURIComponent(resourceId), {
        as: 'blob',
      })
        .then(rawData => {
          const blob = new Blob([rawData as string], { type: 'octet/stream' });
          const src = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          document.body.appendChild(a);
          a.href = src;
          a.click();
          URL.revokeObjectURL(src);
        })
        .catch(error => {
          console.log('Download failed due to error');
          console.error(error);
        });
    };
  };

  const renderTable = (resource: Resource) => {
    let data: any = [];
    if (
      resource['@type'] === 'Entity' ||
      resource['@type']?.includes('Entity')
    ) {
      if (resource['distribution'] && resource['distribution'].length > 0) {
        data = resource['distribution'].map((d: any) => {
          return {
            name: d['name'],
            contentUrl: d['contentUrl'],
          };
        });
      }
      return <Table columns={columns} dataSource={data} />;
    }
    return null;
  };

  return <>{renderTable(resource)}</>;
};

export default DataAccessContainer;
