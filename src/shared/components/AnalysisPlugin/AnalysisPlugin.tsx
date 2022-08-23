import {
  LeftSquareFilled,
  UpOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import {
  Button,
  Collapse,
  Input,
  Slider,
  Select,
  Modal,
} from 'antd';
import { without, flatten, map, uniq, intersection } from 'lodash';
import * as React from 'react';
import { getUsername } from '../../../shared/utils';
import FriendlyTimeAgo from '../FriendlyDate';
import './AnalysisPlugin.less';
import './Categories.less';
import * as moment from 'moment';
import CategoryWidget from './CategoryWidget';
import TypeWidget from './TypeWidget';
import ReportAssets from './ReportAssets';

import NewReportForm from './NewReportForm';

import {
  ActionType,
  AnalysesAction,
} from '../../../shared/containers/AnalysisPlugin/AnalysisPluginContainer';
import { useState } from '@storybook/addons';

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
  containerType?: string[];
  containerCategory?: string[];
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
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    []
  );
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);

  const onChangeAnalysisReports = (value: string[]) => {
    dispatch({
      type: ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS,
      payload: { analysisReportIds: value },
    });
  };

  const selectCategory = (value: string) => {
    !selectedCategories.includes(value)
      ? setSelectedCategories([...selectedCategories, value])
      : setSelectedCategories(without(selectedCategories, value));
  };
  const selectType = (value: string) => {
    !selectedTypes.includes(value)
      ? setSelectedTypes([...selectedTypes, value])
      : setSelectedTypes(without(selectedTypes, value));
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
    <>
      {mode === 'create' && (
        <NewReportForm
          dispatch={dispatch}
          analysisReportId={
            currentlyBeingEditedAnalysisReportId
              ? currentlyBeingEditedAnalysisReportId
              : undefined
          }
          imagePreviewScale={imagePreviewScale}
        />
      )}
      {mode !== 'create' && (
        <div className="analysis">
          <CategoryWidget
            dispatch={dispatch}
            mode={mode}
            selectedCategories={selectedCategories}
            selectCategory={selectCategory}
            analysisReports={analysisReports}
          />
          <TypeWidget
            dispatch={dispatch}
            mode={mode}
            selectedTypes={selectedTypes}
            selectType={selectType}
            analysisReports={analysisReports}
          />

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
              .filter(a => {
                if (['edit', 'view'].includes(mode) && a.id !== undefined) {
                  if (
                    selectedCategories.length > 0 &&
                    a.containerCategory !== undefined &&
                    intersection(selectedCategories, a.containerCategory)
                      .length === 0
                  )
                    return false;
                  if (
                    selectedTypes.length > 0 &&
                    a.containerType !== undefined &&
                    intersection(selectedTypes, a.containerType).length === 0
                  )
                    return false;
                  else return true;
                }
                return true;
              })
              .map((analysisReport, i) => (
                // <Collapse className="panel">

                <Collapse
                  expandIconPosition="right"
                  key={i}
                  style={{ marginBottom: '40px' }}
                >
                  <Panel
                    key={i}
                    header={
                      <>
                        {analysisReport.name}
                        {analysisReport.containerCategory &&
                          analysisReport.containerCategory?.length > 0 && (
                            <span className="cat">
                              {analysisReport.containerCategory?.map(c => (
                                <span>{c}</span>
                              ))}{' '}
                            </span>
                          )}
                        {analysisReport.containerType &&
                          analysisReport.containerType?.length > 0 && (
                            <span className="types">
                              {analysisReport.containerType?.map(t => (
                                <span>{t}</span>
                              ))}{' '}
                            </span>
                          )}
                      </>
                    }
                  >
                    <h1
                      aria-label="Analysis Name"
                      style={{
                        display: 'flex',
                        ...(mode === 'view' && { marginBottom: '0.1em' }),
                      }}
                    >
                      {mode === 'edit' &&
                        'id' in analysisReport &&
                        currentlyBeingEditedAnalysisReportId ===
                          analysisReport.id && (
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
                              style={{
                                marginLeft: 'auto',
                                marginRight: '20px',
                              }}
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
                      {mode === 'edit' &&
                        'id' in analysisReport &&
                        currentlyBeingEditedAnalysisReportId ===
                          analysisReport.id && (
                          <Input.TextArea
                            placeholder="Analysis Description"
                            aria-label="Analysis Description"
                            value={
                              currentlyBeingEditedAnalysisReportDescription
                            }
                            onChange={e =>
                              dispatch({
                                type: ActionType.CHANGE_ANALYSIS_DESCRIPTION,
                                payload: { description: e.currentTarget.value },
                              })
                            }
                          />
                        )}
                    </p>
                    <section className="actions" aria-label="actions">
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
                    <ReportAssets
                      mode={mode}
                      imagePreviewScale={imagePreviewScale}
                      dispatch={dispatch}
                      analysisReport={analysisReport}
                      currentlyBeingEditedAnalysisReportId={
                        currentlyBeingEditedAnalysisReportId
                          ? currentlyBeingEditedAnalysisReportId
                          : undefined
                      }
                    />
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
      )}
    </>
  );
};

export default AnalysisPlugin;
