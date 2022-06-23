import {
  DownloadOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Input,
  Menu,
  Slider,
  Select,
  Row,
  Col,
  Checkbox,
  Modal,
} from 'antd';
import * as React from 'react';
import './AnalysisPlugin.less';

export type Asset = {
  analysisReportId: string;
  saved: boolean;
  id: string;
  name: string;
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
  preview: ({
    scale,
    mode,
  }: {
    scale: number;
    mode: 'view' | 'edit';
  }) => React.ReactElement;
};

export type AnalysisReport = {
  id: string;
  name: string;
  description: string;
  assets: Asset[];
};

enum ActionType {
  RESCALE = 'rescale',
  EDIT_ANALYSIS_REPORT = 'edit_analysis_report',
  INITIALIZE = 'initialize',
  SELECT_ASSET = 'select_asset',
  CHANGE_SELECTED_ANALYSIS_REPORTS = 'change_selected_analysis_reports',
  CHANGE_ANALYSIS_NAME = 'change_analysis_name',
  CHANGE_ANALYSIS_DESCRIPTION = 'change_analysis_description',
  OPEN_FILE_UPLOAD_DIALOG = 'open_file_upload_dialog',
  CLOSE_FILE_UPLOAD_DIALOG = 'close_file_upload_dialog',
}

const DEFAULT_SCALE = 50;

type AnalysesAction =
  | { type: ActionType.RESCALE; payload: number }
  | {
      type: ActionType.EDIT_ANALYSIS_REPORT;
      payload: {
        analysisId: string;
        analaysisName: string;
        analysisDescription: string;
      };
    }
  | { type: ActionType.INITIALIZE }
  | { type: ActionType.SELECT_ASSET; payload: { assetId: string } }
  | {
      type: ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS;
      payload: { analysisReportIds: string[] };
    }
  | { type: ActionType.CHANGE_ANALYSIS_NAME; payload: { name: string } }
  | {
      type: ActionType.CHANGE_ANALYSIS_DESCRIPTION;
      payload: { description: string };
    }
  | { type: ActionType.OPEN_FILE_UPLOAD_DIALOG }
  | { type: ActionType.CLOSE_FILE_UPLOAD_DIALOG };

type AnalysisPluginProps = {
  analysisReports: AnalysisReport[];
  FileUpload: (analysisReportId: string) => JSX.Element;
  onSave: (id: string, name: string, description: string) => void;
  onCancel: () => void;
};

const AnalysisPlugin = ({
  analysisReports,
  onSave,
  FileUpload,
}: AnalysisPluginProps) => {
  type AnalysesState = {
    imagePreviewScale: number;
    mode: 'view' | 'edit';
    selectedAnalysisReports?: string[];
    currentlyBeingEditedAnalysisReportId?: string;
    currentlyBeingEditingAnalysisReportName?: string;
    currentlyBeingEditedAnalysisReportDescription?: string;
    selectedAssets?: string[];
    isUploadAssetDialogOpen?: boolean;
  };
  const initState = ({
    mode,
    selectedAnalysisReports,
    imagePreviewScale: scale,
  }: AnalysesState): AnalysesState => ({
    mode,
    selectedAnalysisReports,
    imagePreviewScale: scale,
  });

  const analysisUIReducer = (
    state: AnalysesState,
    action: AnalysesAction
  ): AnalysesState => {
    switch (action.type) {
      case ActionType.RESCALE:
        return { ...state, imagePreviewScale: action.payload };
      case ActionType.EDIT_ANALYSIS_REPORT:
        return {
          ...state,
          mode: 'edit',
          currentlyBeingEditedAnalysisReportId: action.payload.analysisId,
          currentlyBeingEditingAnalysisReportName: action.payload.analaysisName,
          currentlyBeingEditedAnalysisReportDescription:
            action.payload.analysisDescription,
        };
      case ActionType.SELECT_ASSET:
        state.selectedAssets = state.selectedAssets ? state.selectedAssets : [];
        const selectedId = state.selectedAssets?.findIndex(
          a => a === action.payload.assetId
        );

        if (
          state.selectedAssets &&
          selectedId !== undefined &&
          selectedId > -1
        ) {
          const selectedCopy = [...state.selectedAssets];
          selectedCopy.splice(selectedId, 1);
          return {
            ...state,
            selectedAssets: selectedCopy,
          };
        }
        return {
          ...state,
          selectedAssets: [...state.selectedAssets, action.payload.assetId],
        };
      case ActionType.CHANGE_SELECTED_ANALYSIS_REPORTS:
        return {
          ...state,
          selectedAnalysisReports: action.payload.analysisReportIds,
        };
      case ActionType.INITIALIZE:
        return analysisReports.length > 0
          ? initState({
              mode: 'view',
              imagePreviewScale: state.imagePreviewScale,
              selectedAnalysisReports:
                state.currentlyBeingEditedAnalysisReportId !== undefined
                  ? [state.currentlyBeingEditedAnalysisReportId]
                  : firstAnalysis !== undefined
                  ? [firstAnalysis]
                  : [],
            })
          : initState({
              mode: 'view',
              imagePreviewScale: state.imagePreviewScale,
              selectedAnalysisReports: [],
            });
      case ActionType.CHANGE_ANALYSIS_NAME:
        return {
          ...state,
          currentlyBeingEditingAnalysisReportName: action.payload.name,
        };
      case ActionType.CHANGE_ANALYSIS_DESCRIPTION:
        return {
          ...state,
          currentlyBeingEditedAnalysisReportDescription:
            action.payload.description,
        };
      case ActionType.OPEN_FILE_UPLOAD_DIALOG:
        return {
          ...state,
          isUploadAssetDialogOpen: true,
        };
      case ActionType.CLOSE_FILE_UPLOAD_DIALOG:
        return {
          ...state,
          isUploadAssetDialogOpen: false,
        };
      default:
        throw new Error();
    }
  };

  const firstAnalysis =
    analysisReports.length > 0 ? analysisReports[0].id : undefined;

  const [
    {
      imagePreviewScale,
      mode,
      currentlyBeingEditedAnalysisReportId,
      selectedAssets,
      selectedAnalysisReports,
      currentlyBeingEditingAnalysisReportName,
      currentlyBeingEditedAnalysisReportDescription,
      isUploadAssetDialogOpen,
    },
    dispatch,
  ] = React.useReducer(
    analysisUIReducer,
    {
      imagePreviewScale: DEFAULT_SCALE,
      mode: 'view',
      selectedAnalysisReports: firstAnalysis ? [firstAnalysis] : [],
    },
    initState
  );

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
      {currentlyBeingEditedAnalysisReportId &&
        FileUpload(currentlyBeingEditedAnalysisReportId)}
    </Modal>
  );

  return (
    <div className="analysis">
      <>
        {fileUploadModal}
        {mode === 'view' && (
          <Row className="analysisTools">
            <Col span={12}>
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
                {analysisReports.map((a, i) => (
                  <Option key={a.id} value={a.id}>
                    {a.name ? a.name : a.id}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8} offset={4}>
              <Slider
                tooltipVisible={false}
                value={imagePreviewScale}
                onChange={(value: number) =>
                  dispatch({ type: ActionType.RESCALE, payload: value })
                }
                included={false}
                className="slider-scale"
              />
            </Col>
          </Row>
        )}
        {analysisReports
          .filter(a => selectedAnalysisReports?.includes(a.id))
          .map((analysisReport, i) => (
            <section key={i} style={{ marginBottom: '40px' }}>
              <h1 aria-label="Analysis Name" style={{ display: 'flex' }}>
                {(mode === 'view' ||
                  currentlyBeingEditedAnalysisReportId !==
                    analysisReport.id) && (
                  <div style={{ display: 'inline-block' }}>
                    {analysisReport.name}
                  </div>
                )}
                {mode === 'edit' &&
                  currentlyBeingEditedAnalysisReportId ===
                    analysisReport.id && (
                    <>
                      <Input
                        type="text"
                        placeholder="Analysis Name"
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
                          onClick={() =>
                            dispatch({ type: ActionType.INITIALIZE })
                          }
                        >
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            currentlyBeingEditingAnalysisReportName &&
                              currentlyBeingEditedAnalysisReportDescription &&
                              onSave(
                                analysisReport.id,
                                currentlyBeingEditingAnalysisReportName,
                                currentlyBeingEditedAnalysisReportDescription
                              );
                            dispatch({ type: ActionType.INITIALIZE });
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
                          icon={<EditOutlined />}
                          onClick={() =>
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
                          onClick={() => console.log('download')}
                          icon={<DownloadOutlined />}
                        >
                          Download
                        </Menu.Item>
                      </Menu>
                    }
                    icon={<MoreOutlined />}
                  />
                )}
              </h1>
              <p
                aria-label="Analysis Description"
                style={{ maxWidth: '900px', marginRight: '50px' }}
              >
                {(mode === 'view' ||
                  currentlyBeingEditedAnalysisReportId !== analysisReport.id) &&
                  analysisReport.description}
                {mode === 'edit' &&
                  currentlyBeingEditedAnalysisReportId ===
                    analysisReport.id && (
                    <Input.TextArea
                      placeholder="Analysis Description"
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
                {mode === 'edit' &&
                  currentlyBeingEditedAnalysisReportId ===
                    analysisReport.id && (
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
                {analysisReport.assets.map((asset, i) => {
                  const minThumbnailSize = 100;
                  return (
                    <div
                      key={asset.id}
                      aria-label="Analysis Asset"
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
                      {asset.preview({ mode, scale: imagePreviewScale })}
                      {mode === 'edit' &&
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
                  );
                })}
              </section>
            </section>
          ))}
      </>
    </div>
  );
};

export default AnalysisPlugin;
