import { MoreOutlined, UserOutlined } from '@ant-design/icons';
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

export type Analyses = {
  id: string;
  name: string;
  description: string;

  analyses: {
    saved: boolean;
    id: string;
    name: string;
    filePath: string; // expect this is an image for now
    preview: ({
      scale,
    }: {
      scale: number;
      mode: 'edit' | 'view';
    }) => React.ReactElement;
  }[];
}[];

enum ActionType {
  RESCALE = 'rescale',
  EDIT = 'edit',
  INITIALIZE = 'initialize',
  SELECT_ASSET = 'select_asset',
  ACTIVATE_ANALYSES = 'activate_analyses',
  CHANGE_ANALYSIS_NAME = 'change_analysis_name',
  CHANGE_ANALYSIS_DESCRIPTION = 'change_analysis_description',
  OPEN_UPLOAD_DIALOG = 'open_upload_dialog',
  CLOSE_UPLOAD_DIALOG = 'close_upload_dialog',
}

const DEFAULT_SCALE = 50;

type AnalysesAction =
  | { type: ActionType.RESCALE; payload: number }
  | {
      type: ActionType.EDIT;
      payload: {
        analysisId: string;
        analaysisName: string;
        analysisDescription: string;
      };
    }
  | { type: ActionType.INITIALIZE }
  | { type: ActionType.SELECT_ASSET; payload: { assetId: string } }
  | { type: ActionType.ACTIVATE_ANALYSES; payload: { analyses: string[] } }
  | { type: ActionType.CHANGE_ANALYSIS_NAME; payload: { name: string } }
  | {
      type: ActionType.CHANGE_ANALYSIS_DESCRIPTION;
      payload: { description: string };
    }
  | { type: ActionType.OPEN_UPLOAD_DIALOG }
  | { type: ActionType.CLOSE_UPLOAD_DIALOG };

type AnalysisPluginProps = {
  analyses: Analyses;
  mode: 'view' | 'edit';
  FileUpload: React.ReactNode;
  onSave: (id: string, name: string, description: string) => void;
  onCancel: () => void;
  onChangeMode: (mode: 'view' | 'edit') => void;
};

const AnalysisPlugin = ({
  analyses,
  onSave,
  FileUpload,
}: AnalysisPluginProps) => {
  type AnalysesState = {
    scale: number;
    mode: 'view' | 'edit';
    editing?: string;
    selected?: string[];
    activeAnalyses?: string[];
    activeAnalysisName?: string;
    activeAnalysisDescription?: string;
    isUploadAssetDialogOpen?: boolean;
  };
  const initState = ({
    scale,
    mode,
    activeAnalyses,
  }: AnalysesState): AnalysesState => ({
    scale,
    mode,
    activeAnalyses,
  });

  const reducer = (
    state: AnalysesState,
    action: AnalysesAction
  ): AnalysesState => {
    switch (action.type) {
      case ActionType.RESCALE:
        return { ...state, scale: action.payload };
      case ActionType.EDIT:
        return {
          ...state,
          mode: 'edit',
          editing: action.payload.analysisId,
          activeAnalysisName: action.payload.analaysisName,
          activeAnalysisDescription: action.payload.analysisDescription,
        };
      case ActionType.SELECT_ASSET:
        state.selected = state.selected ? state.selected : [];
        const selectedId = state.selected?.findIndex(
          a => a === action.payload.assetId
        );

        console.log(state.selected, selectedId, action.payload.assetId);

        if (state.selected && selectedId !== undefined && selectedId > -1) {
          const selectedCopy = [...state.selected];
          selectedCopy.splice(selectedId, 1);
          return {
            ...state,
            selected: selectedCopy,
          };
        }
        return {
          ...state,
          selected: [...state.selected, action.payload.assetId],
        };
      case ActionType.ACTIVATE_ANALYSES:
        return {
          ...state,
          activeAnalyses: action.payload.analyses,
        };
      case ActionType.INITIALIZE:
        return analyses.length > 0
          ? initState({
              mode: 'view',
              scale: state.scale,
              activeAnalyses: firstAnalysis ? [firstAnalysis] : [],
            })
          : initState({
              mode: 'view',
              scale: state.scale,
              activeAnalyses: [],
            });
      case ActionType.CHANGE_ANALYSIS_NAME:
        return {
          ...state,
          activeAnalysisName: action.payload.name,
        };
      case ActionType.CHANGE_ANALYSIS_DESCRIPTION:
        return {
          ...state,
          activeAnalysisDescription: action.payload.description,
        };
      case ActionType.OPEN_UPLOAD_DIALOG:
        return {
          ...state,
          isUploadAssetDialogOpen: true,
        };
      case ActionType.CLOSE_UPLOAD_DIALOG:
        return {
          ...state,
          isUploadAssetDialogOpen: false,
        };
      default:
        throw new Error();
    }
  };

  const firstAnalysis = analyses.length > 0 ? analyses[0].id : undefined;

  const [
    {
      scale,
      mode,
      editing,
      selected,
      activeAnalyses,
      activeAnalysisName,
      activeAnalysisDescription,
      isUploadAssetDialogOpen,
    },
    dispatch,
  ] = React.useReducer(
    reducer,
    {
      scale: DEFAULT_SCALE,
      mode: 'view',
      activeAnalyses: firstAnalysis ? [firstAnalysis] : [],
    },
    initState
  );

  const { Option } = Select;

  const onAnalysesChange = (value: string[]) => {
    dispatch({
      type: ActionType.ACTIVATE_ANALYSES,
      payload: { analyses: value },
    });
  };

  const onSearch = (value: string) => {
    const res = analyses.filter(a =>
      a.name.toLowerCase().includes(value.toLowerCase())
    );
    console.log('SEARCH', res);
    return res;
  };

  const fileUploadModal = (
    <Modal
      visible={isUploadAssetDialogOpen}
      footer={false}
      onCancel={() => dispatch({ type: ActionType.CLOSE_UPLOAD_DIALOG })}
    >
      {FileUpload}
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
                value={activeAnalyses}
                showSearch
                mode="multiple"
                placeholder="Select Analysis"
                style={{ width: '100%' }}
                optionFilterProp="children"
                onChange={onAnalysesChange}
                onSearch={onSearch}
                filterOption={(input, option) =>
                  ((option!.children as unknown) as string)
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) > -1
                }
              >
                {analyses.map((a, i) => (
                  <Option key={a.id} value={a.id}>
                    {a.name ? a.name : a.id}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8} offset={4}>
              <Slider
                tooltipVisible={false}
                value={scale}
                onChange={(value: number) =>
                  dispatch({ type: ActionType.RESCALE, payload: value })
                }
                included={false}
                className="slider-scale"
              />
            </Col>
          </Row>
        )}
        {analyses
          .filter(a => activeAnalyses?.includes(a.id))
          .map((analysis, i) => (
            <section key={i}>
              <h1 aria-label="Analysis Name">
                {(mode === 'view' || editing !== analysis.id) && analysis.name}
                {mode === 'edit' && editing === analysis.id && (
                  <>
                    <Input
                      type="text"
                      placeholder="Analysis Name"
                      value={activeAnalysisName}
                      onChange={e =>
                        dispatch({
                          type: ActionType.CHANGE_ANALYSIS_NAME,
                          payload: { name: e.target.value },
                        })
                      }
                      style={{ width: '60%' }}
                    />
                    <Button
                      type="default"
                      onClick={() => dispatch({ type: ActionType.INITIALIZE })}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        activeAnalysisName &&
                          activeAnalysisDescription &&
                          onSave(
                            analysis.id,
                            activeAnalysisName,
                            activeAnalysisDescription
                          );
                        dispatch({ type: ActionType.INITIALIZE });
                      }}
                    >
                      Save
                    </Button>
                  </>
                )}
                {mode === 'view' && (
                  <Dropdown.Button
                    overlay={
                      <Menu onClick={() => {}}>
                        <Menu.Item
                          icon={<UserOutlined />}
                          onClick={() =>
                            dispatch({
                              type: ActionType.EDIT,
                              payload: {
                                analysisId: analysis.id,
                                analaysisName: analysis.name,
                                analysisDescription: analysis.description,
                              },
                            })
                          }
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => console.log('download')}
                          icon={<UserOutlined />}
                        >
                          Download
                        </Menu.Item>
                        <Menu.Item
                          onClick={() =>
                            console.log('visiting analysis report resource')
                          }
                          icon={<UserOutlined />}
                        >
                          View
                        </Menu.Item>
                      </Menu>
                    }
                    icon={<MoreOutlined />}
                  />
                )}
              </h1>
              <p aria-label="Analysis Description">
                {(mode === 'view' || editing !== analysis.id) &&
                  analysis.description}
                {mode === 'edit' && editing === analysis.id && (
                  <Input.TextArea
                    placeholder="Analysis Description"
                    value={activeAnalysisDescription}
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
                {mode === 'edit' && editing === analysis.id && (
                  <Button
                    onClick={() =>
                      dispatch({ type: ActionType.OPEN_UPLOAD_DIALOG })
                    }
                  >
                    Add
                  </Button>
                )}
                {analysis.analyses.map((asset, i) => (
                  <div
                    key={i}
                    aria-label="Analysis Asset"
                    className={`asset ${
                      selected && selected.findIndex(v => v === asset.id) > -1
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => {
                      console.log('div clicked');
                      dispatch({
                        type: ActionType.SELECT_ASSET,
                        payload: { assetId: asset.id },
                      });
                    }}
                  >
                    {asset.preview({ scale, mode })}
                    {mode === 'edit' && editing === analysis.id && (
                      <Checkbox
                        checked={selected && selected.some(v => v === asset.id)}
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
                ))}
              </section>
            </section>
          ))}
      </>
    </div>
  );
};

export default AnalysisPlugin;
