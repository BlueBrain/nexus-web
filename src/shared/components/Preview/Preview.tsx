import * as React from 'react';
import {
  Resource,
  NexusClient,
  GetFileOptions,
  NexusFile,
  ArchivePayload,
} from '@bbp/nexus-sdk/es';
import { Button, Col, Collapse, Row, Table, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { AccessControl } from '@bbp/react-nexus';
import { uuidv4 } from '../../utils';
import PDFViewer from './PDFPreview';
import useNotification from '../../hooks/useNotification';
import TableViewerContainer from '../../containers/TableViewerContainer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import nexusUrlHardEncode from '../../utils/nexusEncode';
import { TError } from '../../../utils/types';

export const parseResourceId = (url: string) => {
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

export const parseProjectUrl = (projectUrl: string) => {
  const projectUrlR = /projects\/([\w-]+)\/([\w-]+)\/?$/;
  const [, org, proj] = projectUrl.match(projectUrlR) as string[];
  return [org, proj];
};

const isSupportedFile = (asset: any) =>
  asset.encodingFormat === 'application/pdf' ||
  asset.name?.endsWith('.csv') ||
  asset.name?.endsWith('.tsv');

const Preview: React.FC<{
  resource: Resource;
  nexus: NexusClient;
  collapsed: boolean;
  handleCollapseChanged: () => void;
}> = ({
  resource,
  nexus,
  collapsed,
  handleCollapseChanged: handleCollapsedChanged,
}) => {
    const { apiEndpoint } = useSelector((state: RootState) => state.config);
    const notification = useNotification();
    const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
    const [previewAsset, setPreviewAsset] = React.useState<any | undefined>();
    const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
    const renderFileSize = (contentSize: {
      value: string;
      unitCode?: string;
    }) => {
      if (!contentSize) {
        return '-';
      }
      if (contentSize.unitCode) {
        if (contentSize.unitCode.toLocaleLowerCase() === 'kilo bytes') {
          return `${contentSize.value} KB`;
        }
        if (contentSize.unitCode.toLocaleLowerCase() === 'mega bytes') {
          return `${contentSize.value} MB`;
        }
      }
      const sizeInMB = (parseInt(contentSize.value, 10) / 1000000).toFixed(2);
      if (sizeInMB !== '0.00') {
        return `${sizeInMB} MB`;
      }

      return `${contentSize.value} Bytes`;
    };

    const isNexusFile = (url: string) => {
      const resourceId = parseResourceId(url);
      return resourceId !== '';
    };

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => text || '-',
      },
      {
        title: 'Asset Type / Encoding Format',
        dataIndex: 'encodingFormat',
        key: 'encodingFormat',
        render: (text: string) => text || '-',
      },
      {
        title: 'File Size',
        dataIndex: 'contentSize',
        key: 'contentSize',
        render: renderFileSize,
      },
      {
        title: 'Actions',
        dataIndex: 'asset',
        key: 'actions',
        render: (asset: {
          url: string;
          name: string;
          encodingFormat: string;
        }) => {
          return (
            <Row gutter={5}>
              <Col>
                <Button
                  onClick={() =>
                    downloadSingleFile(nexus, orgLabel, projectLabel, asset)
                  }
                  disabled={!isNexusFile(asset.url)}
                >
                  Download
                </Button>
              </Col>
              <Col>
                <Button onClick={() => copyURI(asset.url)}>Copy Location</Button>
              </Col>
              <Col>
                <Button
                  onClick={() => setPreviewAsset(asset)}
                  disabled={!isSupportedFile(asset)}
                >
                  Preview
                </Button>
              </Col>
            </Row>
          );
        },
      },
    ];

    const downloadMultipleFiles = async () => {
      const resourcesPayload = selectedRows
        .map(row => {
          return row.asset.url;
        })
        .map(url => {
          const resourceId = parseResourceId(url);
          return {
            resourceId,
            '@type': 'File',
            project: `${orgLabel}/${projectLabel}`,
          };
        });
      const archiveId = uuidv4();
      const payload: ArchivePayload = {
        archiveId,
        resources: resourcesPayload,
      };

      try {
        // TODO: fix the SDK to handle empty response
        await fetch(
          `${apiEndpoint}/archives/${orgLabel}/${projectLabel}/${payload.archiveId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('nexus__token')}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } catch (error) {
        notification.error({
          message: 'Failed to download the file',
          description: (error as TError).reason || (error as TError).message,
        });
      }
      const archive = (await nexus.Archive.get(
        orgLabel,
        projectLabel,
        archiveId,
        {
          as: 'x-tar',
        }
      )) as string;
      const blob = new Blob([archive]);
      downloadBlobHelper(blob, `${archiveId}.tar.gz`);
    };

    const downloadButton = (disabled: boolean) => {
      const isDisabled = disabled || selectedRows.length <= 0;
      const disabledToolTip =
        selectedRows.length <= 0
          ? 'Please Select files to download'
          : 'You don’t have the required permissions to create an archive for some of the selected resources. Please contact your project administrator to request to be granted the required archives/write permission.';
      const btn = (
        <Button
          onClick={() => {
            downloadMultipleFiles();
          }}
          style={{
            float: 'right',
            marginBottom: '10px',
          }}
          type={'primary'}
          icon={<DownloadOutlined />}
          disabled={isDisabled}
        >
          Download Selected File(s)
        </Button>
      );

      if (isDisabled) {
        return <Tooltip title={disabledToolTip}>{btn}</Tooltip>;
      }

      return btn;
    };

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

    const downloadSingleFile = async (
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
          nexusUrlHardEncode(contentUrl),
          options
        );
        downloadBlobHelper(rawData, asset.name);
      } catch (error) {
        notification.error({
          message: 'Failed to download the file',
          description: (error as TError).reason || (error as TError).message,
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
              name:
                d.name ||
                (d.repository && (d.repository.name || d.repository['@id'])),
              asset: {
                url: d.contentUrl || d.url,
                name: d.name,
                encodingFormat: d.encodingFormat,
              },
              encodingFormat:
                d.encodingFormat ||
                (d.name?.includes('.') ? d.name.split('.').pop() : '-'),
              contentSize: d.contentSize,
            };
          })
        );
      }

      return data;
    };

    const fileFormat =
      previewAsset && previewAsset.name?.includes('.')
        ? previewAsset.name.split('.').pop()
        : '-';

    return (
      <div>
        {previewAsset && previewAsset.encodingFormat === 'application/pdf' && (
          <PDFViewer
            url={previewAsset.url}
            closePreview={() => setPreviewAsset(undefined)}
          />
        )}
        {previewAsset && (fileFormat === 'csv' || fileFormat === 'tsv') && (
          <TableViewerContainer
            resourceUrl={previewAsset.url}
            name={previewAsset.name}
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            onClickClose={() => setPreviewAsset(undefined)}
          />
        )}
        <Collapse
          onChange={handleCollapsedChanged}
          activeKey={collapsed ? 'preview' : undefined}
        >
          <Collapse.Panel header="Preview" key="preview">
            <AccessControl
              path={`/${orgLabel}/${projectLabel}`}
              permissions={['archives/write']}
              noAccessComponent={() => downloadButton(true)}
              loadingComponent={downloadButton(false)}
            >
              {downloadButton(false)}
            </AccessControl>
            <Table
              rowSelection={{
                checkStrictly: false,
                onSelect: (record: any, selected: any) => {
                  if (selected) {
                    setSelectedRows([...selectedRows, record]);
                  } else {
                    const currentRows = selectedRows.filter(
                      s => s.key !== record.key
                    );
                    setSelectedRows(currentRows);
                  }
                },
                onSelectAll: (select, selectedRows) => {
                  if (select) {
                    setSelectedRows(selectedRows);
                  } else {
                    setSelectedRows([]);
                  }
                },
              }}
              columns={columns}
              dataSource={getResourceAssets(resource)}
              bordered={true}
            ></Table>
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  };

export default Preview;
