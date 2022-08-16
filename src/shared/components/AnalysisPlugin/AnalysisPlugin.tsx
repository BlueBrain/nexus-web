import {
  CalendarOutlined,
  LeftSquareFilled,
  MoreOutlined,
  PlusOutlined,
  UpOutlined,
  UserOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Slider,
  Select,
  Checkbox,
  Modal,
} from 'antd';
import * as React from 'react';
import { getUsername } from '../../../shared/utils';
import FriendlyTimeAgo from '../FriendlyDate';
import './AnalysisPlugin.less';
import * as moment from 'moment';
import {
  ActionType,
  AnalysesAction,
} from '../../../shared/containers/AnalysisPlugin/AnalysisPluginContainer';

export type Asset = {
  analysisReportId?: string;
  saved: boolean;
  id: string;
  name: string;
  description?: string;
  encodingFormat: string;
  contentSize?: {
    unitCode: 'bytes';
    value: number;
  };
  digest?: {
    algorithm: string;
    value: string;
  };
  filePath: string;
  filename?: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
  preview: ({ mode }: { mode: 'view' | 'edit' }) => React.ReactElement;
};

export type AnalysisReport = {
  id?: string;
  containerId?: string;
  containerName?: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  assets: Asset[];
};

type AnalysisPluginProps = {
  analysisResourceType: 'report_container' | 'individual_report';
  containerId?: string;
  containerName?: string;
  analysisReports: AnalysisReport[];
  FileUpload: (analysisReportId?: string) => JSX.Element;
  onSave: (name: string, description?: string, id?: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onClickRelatedResource: (resourceId: string) => void;
  imagePreviewScale: number;
  mode: 'view' | 'edit' | 'create';
  selectedAnalysisReports?: string[];
  currentlyBeingEditedAnalysisReportId?: string;
  currentlyBeingEditingAnalysisReportName?: string;
  currentlyBeingEditedAnalysisReportDescription?: string;
  selectedAssets?: string[];
  isUploadAssetDialogOpen?: boolean;
  dispatch: (action: AnalysesAction) => void;
};

const AnalysisPlugin = ({
  analysisResourceType,
  containerId,
  containerName,
  analysisReports,
  onSave,
  onDelete,
  FileUpload,
  imagePreviewScale,
  mode,
  selectedAnalysisReports,
  currentlyBeingEditedAnalysisReportDescription,
  currentlyBeingEditedAnalysisReportId,
  currentlyBeingEditingAnalysisReportName,
  selectedAssets,
  isUploadAssetDialogOpen,
  dispatch,
  onClickRelatedResource,
}: AnalysisPluginProps) => {
  const { Option } = Select;

  const onChangeAnalysisReports = (value: string[]) => {
    dispatch({
      type: ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS,
      payload: { analysisReportIds: value },
    });
  };

  const onSearch = (value: string) => {
    const res = analysisReports.filter(a =>
      a.name.toLowerCase().includes(value.toLowerCase())
    );

    return res;
  };

  const fileUploadModal = (
    <Modal
      visible={isUploadAssetDialogOpen}
      footer={false}
      onCancel={() => dispatch({ type: ActionType.CLOSE_FILE_UPLOAD_DIALOG })}
      className="file-upload-modal"
      destroyOnClose={true}
    >
      {FileUpload(currentlyBeingEditedAnalysisReportId)}
    </Modal>
  );

  return (
    <div className="analysis">
      <>
        {analysisResourceType === 'individual_report' && containerId && (
          <>
            {' '}
            <Button
              type="link"
              onClick={() => onClickRelatedResource(containerId)}
              style={{ padding: 0 }}
              aria-label="Go to parent resource"
            >
              <UpOutlined /> Go to parent resource
            </Button>
          </>
        )}

        {fileUploadModal}
        {mode === 'view' && (
          <>
            {analysisResourceType === 'report_container' && (
              <div className="analysisTools">
                <Select
                  value={selectedAnalysisReports}
                  showSearch
                  mode="multiple"
                  placeholder="Select Analysis"
                  className="select-analysis"
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  onChange={onChangeAnalysisReports}
                  onSearch={onSearch}
                  filterOption={(input, option) =>
                    ((option!.children as unknown) as string)
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) > -1
                  }
                >
                  {analysisReports
                    .filter(a => a.id !== undefined)
                    .map((a, i) => {
                      return (
                        a.id && (
                          <Option key={a.id} value={a.id}>
                            {a.name ? a.name : a.id}
                          </Option>
                        )
                      );
                    })}
                </Select>
                <Button
                  shape="circle"
                  type="primary"
                  icon={<PlusOutlined />}
                  title="Add Analysis Report"
                  aria-label="Add Analysis Report"
                  onClick={() =>
                    dispatch({ type: ActionType.ADD_ANALYSIS_REPORT })
                  }
                ></Button>
              </div>
            )}
            {selectedAnalysisReports &&
              selectedAnalysisReports.length > 0 &&
              analysisReports.filter(
                r =>
                  r.id &&
                  selectedAnalysisReports.includes(r.id) &&
                  r.assets.length > 0
              ).length > 0 && (
                <div
                  className="zoom-control"
                  aria-label="Increase/Decrease image thumnbail size"
                >
                  <ZoomOutOutlined title="Reduce thumbnail size" />
                  <Slider
                    tooltipVisible={false}
                    value={imagePreviewScale}
                    onChange={(value: number) =>
                      dispatch({ type: ActionType.RESCALE, payload: value })
                    }
                    included={false}
                    className="slider-scale"
                  />
                  <ZoomInOutlined title="Increase thumbnail size" />
                </div>
              )}
          </>
        )}
        {analysisReports
          .filter(
            a =>
              (mode === 'create' && a.id === undefined) ||
              (['edit', 'view'].includes(mode) &&
                a.id !== undefined &&
                selectedAnalysisReports?.includes(a.id))
          )
          .map((analysisReport, i) => (
            <section key={i} style={{ marginBottom: '40px' }}>
              <h1
                aria-label="Analysis Name"
                style={{
                  display: 'flex',
                  ...(mode === 'view' && { marginBottom: '0.1em' }),
                }}
              >
                {(mode === 'view' ||
                  ('id' in analysisReport &&
                    currentlyBeingEditedAnalysisReportId !==
                      analysisReport.id)) && (
                  <div style={{ display: 'inline-block' }}>
                    {analysisReport.name}
                  </div>
                )}
                {((mode === 'create' && analysisReport.id === undefined) ||
                  (mode === 'edit' &&
                    'id' in analysisReport &&
                    currentlyBeingEditedAnalysisReportId ===
                      analysisReport.id)) && (
                  <>
                    <Input
                      type="text"
                      placeholder="Analysis Name"
                      aria-label="Analysis Name"
                      required={true}
                      value={currentlyBeingEditingAnalysisReportName}
                      onChange={e =>
                        dispatch({
                          type: ActionType.CHANGE_ANALYSIS_NAME,
                          payload: { name: e.target.value },
                        })
                      }
                      style={{ width: '60%' }}
                    />
                    <div
                      className="actions"
                      style={{ marginLeft: 'auto', marginRight: '20px' }}
                    >
                      <Button
                        style={{ marginRight: '10px' }}
                        type="default"
                        aria-label="Cancel"
                        onClick={() =>
                          dispatch({
                            type: ActionType.INITIALIZE,
                            payload: {
                              scale: imagePreviewScale,
                              analysisReportId: analysisReport.id
                                ? [analysisReport.id]
                                : [],
                            },
                          })
                        }
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        aria-label="Save"
                        onClick={() => {
                          currentlyBeingEditingAnalysisReportName &&
                            onSave(
                              currentlyBeingEditingAnalysisReportName,
                              currentlyBeingEditedAnalysisReportDescription,
                              analysisReport.id
                            );
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                )}
                {mode === 'view' && (
                  <Dropdown.Button
                    style={{ margin: 'auto 0' }}
                    overlay={
                      <Menu onClick={() => {}}>
                        <Menu.Item
                          onClick={() =>
                            analysisReport.id &&
                            dispatch({
                              type: ActionType.EDIT_ANALYSIS_REPORT,
                              payload: {
                                analysisId: analysisReport.id,
                                analaysisName: analysisReport.name,
                                analysisDescription: analysisReport.description,
                              },
                            })
                          }
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          hidden={true}
                          onClick={() => console.log('download')}
                          icon={<LeftSquareFilled />}
                        >
                          Download
                        </Menu.Item>
                        <Menu.Item
                          hidden={analysisResourceType === 'individual_report'}
                          onClick={() =>
                            analysisReport.id &&
                            onClickRelatedResource(analysisReport.id)
                          }
                        >
                          Go to resource
                        </Menu.Item>
                      </Menu>
                    }
                    icon={
                      <span aria-label="Options">
                        <MoreOutlined />
                      </span>
                    }
                  />
                )}
              </h1>
              {mode === 'view' && (
                <section
                  aria-label="Analysis Metadata"
                  className="analysis-metadata"
                >
                  <label>
                    Created{' '}
                    {analysisReport.createdAt && (
                      <FriendlyTimeAgo
                        date={moment(analysisReport.createdAt)}
                      />
                    )}
                  </label>{' '}
                  <label>
                    by{' '}
                    <span>
                      {analysisReport.createdBy &&
                        getUsername(analysisReport.createdBy)}
                    </span>
                  </label>
                </section>
              )}
              <p
                aria-label="Analysis Description"
                style={{ maxWidth: '900px', marginRight: '50px' }}
              >
                {(mode === 'view' ||
                  ('id' in analysisReport &&
                    currentlyBeingEditedAnalysisReportId !==
                      analysisReport.id)) &&
                  analysisReport.description}
                {((mode === 'create' && analysisReport.id === undefined) ||
                  (mode === 'edit' &&
                    'id' in analysisReport &&
                    currentlyBeingEditedAnalysisReportId ===
                      analysisReport.id)) && (
                  <Input.TextArea
                    placeholder="Analysis Description"
                    aria-label="Analysis Description"
                    value={currentlyBeingEditedAnalysisReportDescription}
                    onChange={e =>
                      dispatch({
                        type: ActionType.CHANGE_ANALYSIS_DESCRIPTION,
                        payload: { description: e.currentTarget.value },
                      })
                    }
                  />
                )}
              </p>
              <section aria-label="Analysis Assets" className="assets">
                {((mode === 'create' && analysisReport.id === undefined) ||
                  (mode === 'edit' &&
                    'id' in analysisReport &&
                    currentlyBeingEditedAnalysisReportId ===
                      analysisReport.id)) && (
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Button
                      type="link"
                      style={{ marginLeft: 'auto', marginBottom: '10px' }}
                      onClick={() =>
                        dispatch({ type: ActionType.OPEN_FILE_UPLOAD_DIALOG })
                      }
                    >
                      Add Files to Analysis
                    </Button>
                  </div>
                )}
                <ul>
                  {analysisReport.assets.map((asset, i) => {
                    const minThumbnailSize = 100;
                    return (
                      <li
                        key={asset.id}
                        className="asset-container"
                        aria-label={
                          asset.name !== '' ? asset.name : asset.filename
                        }
                      >
                        <div
                          aria-label="Analysis File"
                          className={`asset ${
                            selectedAssets &&
                            selectedAssets.findIndex(v => v === asset.id) > -1
                              ? 'selected'
                              : ''
                          }`}
                          style={{
                            overflow: 'hidden',
                            height:
                              minThumbnailSize +
                              imagePreviewScale * (imagePreviewScale / 30),
                            width:
                              minThumbnailSize +
                              imagePreviewScale * (imagePreviewScale / 30),
                          }}
                          onClick={() => {
                            if (
                              mode === 'edit' &&
                              'id' in analysisReport &&
                              currentlyBeingEditedAnalysisReportId ===
                                analysisReport.id
                            ) {
                              dispatch({
                                type: ActionType.SELECT_ASSET,
                                payload: { assetId: asset.id },
                              });
                            }
                          }}
                        >
                          {asset.preview({
                            mode: mode === 'create' ? 'edit' : mode,
                          })}
                          {mode === 'edit' &&
                            'id' in analysisReport &&
                            currentlyBeingEditedAnalysisReportId ===
                              analysisReport.id && (
                              <Checkbox
                                checked={
                                  selectedAssets &&
                                  selectedAssets.some(v => v === asset.id)
                                }
                                className="selectedCheckbox"
                                onClick={e => {
                                  e.stopPropagation();
                                }}
                                onChange={e => {
                                  dispatch({
                                    type: ActionType.SELECT_ASSET,
                                    payload: { assetId: asset.id },
                                  });
                                }}
                              ></Checkbox>
                            )}
                        </div>
                        <div
                          aria-label="Asset Details"
                          className="asset-details"
                          style={{
                            width:
                              minThumbnailSize +
                              imagePreviewScale * (imagePreviewScale / 30),
                          }}
                        >
                          <label
                            className="asset-details__name"
                            title={
                              asset.name !== '' ? asset.name : asset.filename
                            }
                          >
                            {asset.name ? asset.name : asset.filename}
                          </label>
                          <div>
                            <label className="asset-details__last-updated-by">
                              <UserOutlined />
                              &nbsp;
                              {asset.lastUpdatedBy &&
                                getUsername(asset.lastUpdatedBy)}
                            </label>
                            <label
                              className="asset-details__last-updated"
                              aria-label="Last Updated"
                            >
                              <CalendarOutlined />
                              &nbsp;
                              <FriendlyTimeAgo
                                date={moment(asset.lastUpdated)}
                              />
                            </label>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
              {mode === 'edit' && selectedAssets && selectedAssets.length > 0 && (
                <section>
                  <Button
                    type="primary"
                    danger
                    style={{ float: 'right', marginRight: '20px' }}
                    aria-label="Delete"
                    onClick={() => {
                      onDelete();
                    }}
                  >
                    Delete
                  </Button>
                </section>
              )}
            </section>
          ))}
      </>
    </div>
  );
};

export default AnalysisPlugin;
