import {
  CalendarOutlined,
  LeftSquareFilled,
  MoreOutlined,
  PlusOutlined,
  UpOutlined,
  UserOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  InfoCircleOutlined,
  RightOutlined,
  FolderAddOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Collapse,
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
import './Categories.less';
import * as moment from 'moment';
import {
  ActionType,
  AnalysesAction,
} from '../../../shared/containers/AnalysisPlugin/AnalysisPluginContainer';

const { Panel } = Collapse;

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
  deprecated?: boolean;
  preview: ({ mode }: { mode: 'view' | 'edit' }) => React.ReactElement;
};

export type AnalysisReport = {
  id?: string;
  containerId?: string;
  containerName?: string;
  containerType?: string;
  name: string;
  type?: string;
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

const CATEGORIES = {
  circuit: [
    'Anatomical',
    'Connectivity',
    'Volumetric',
    'Morphometric',
    'Synapse',
  ],
  simulation: ['Spiking', 'Soma voltage', 'LFP', 'VSD', 'Plasticity'],
};
const TYPES = ['Validation', 'Prediction', 'Analysis'];
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
    console.log('ONCHANGE TRIGGERED');
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

  const selectCategory = (value: string) => {
    const res = analysisReports.filter(
      a => a.type?.toLowerCase() === value.toLowerCase()
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
  console.log(analysisReports);
  return (
    <div className="analysis">
      <div className="categories">
        <h3>
          Categories{' '}
          <Button
            type="primary"
            title="Add Analysis Report"
            aria-label="Add Analysis Report"
            onClick={() => dispatch({ type: ActionType.ADD_ANALYSIS_REPORT })}
          >
            Add Report
            <FolderAddOutlined />
          </Button>
        </h3>
        <p>you may select one or multiple from the list</p>
        {CATEGORIES.circuit.map((object, i) => (
          <Button type="default">
            <h5>
              {object}
              <InfoCircleOutlined />
            </h5>
          </Button>
        ))}
      </div>
      <div className="types">
        <h3>Report Type</h3>
        <p>you may select one or multiple from the list</p>
        {TYPES.map((object, i) => (
          <Button type="default">
            <h5>
              {object}
              <InfoCircleOutlined />
            </h5>
          </Button>
        ))}
      </div>
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
              <div className="analysisTools"></div>
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
            // <Collapse className="panel">
            <Collapse
              expandIconPosition="right"
              key={i}
              style={{ marginBottom: '40px' }}
            >
              <Panel key={`analysisReport.id`} header={analysisReport.name}>
                <h1
                  aria-label="Analysis Name"
                  style={{
                    display: 'flex',
                    ...(mode === 'view' && { marginBottom: '0.1em' }),
                  }}
                >
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
                </h1>
                {mode === 'view' && (
                  <>
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
                  </>
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
                <section className='actions' aria-label="actions">
                  <Button
                    type="default"
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
                  </Button>
                  <Button
                    type="default"
                    hidden={true}
                    onClick={() => console.log('download')}
                    icon={<LeftSquareFilled />}
                  >
                    Download
                  </Button>
                  <Button
                    type="default"
                    hidden={analysisResourceType === 'individual_report'}
                    onClick={() =>
                      analysisReport.id &&
                      onClickRelatedResource(analysisReport.id)
                    }
                  >
                    Go to resource
                  </Button>
                </section>
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
                {mode === 'edit' &&
                  selectedAssets &&
                  selectedAssets.length > 0 && (
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
              </Panel>
            </Collapse>
          ))}
      </>
    </div>
  );
};

export default AnalysisPlugin;
