import { EditTwoTone, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, Slider, Select, Row, Col } from 'antd';
import * as React from 'react';
import { useState, useRef } from 'react';
import './AnalysisPlugin.less';

export type analyses = {
  name: string;
  description: string;
  id: string;
  analyses: {
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

type AnalysisPluginProps = {
  analyses: analyses;
  mode: 'view' | 'edit';
  onSave: (analyses: analyses) => void;
  onCancel: () => void;
  onChangeMode: (mode: 'view' | 'edit') => void;
};

enum ActionType {
  RESCALE = 'rescale',
  EDIT = 'edit',
  INITIALIZE = 'initialize',
  SELECT_ASSET = 'select_asset',
  ACTIVATE_ANALYSES = 'activate_analyses',
}

const DEFAULT_SCALE = 50;

type AnalysesAction =
  | { type: ActionType.RESCALE; payload: number }
  | { type: ActionType.EDIT; payload: { analysisId: string } }
  | { type: ActionType.INITIALIZE }
  | { type: ActionType.SELECT_ASSET; payload: { assetId: string } }
  | { type: ActionType.ACTIVATE_ANALYSES; payload: { analyses: string[] } };

type AnalysesState = {
  scale: number;
  mode: 'view' | 'edit';
  editing?: string;
  selected?: string[];
  activeAnalyses?: string[];
};
const initState = (activeAnalysisId?: string): AnalysesState => ({
  scale: DEFAULT_SCALE,
  mode: 'view',
  activeAnalyses: activeAnalysisId ? [activeAnalysisId] : [],
});

export default ({ analyses }: AnalysisPluginProps) => {
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
          scale: DEFAULT_SCALE,
        };
      case ActionType.SELECT_ASSET:
        const selectedId = state.selected?.findIndex(
          a => a === action.payload.assetId
        );

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
          selected: [
            ...(state.selected ? state.selected : []),
            action.payload.assetId,
          ],
        };
      case ActionType.ACTIVATE_ANALYSES:
        return {
          ...state,
          activeAnalyses: action.payload.analyses,
        };
      case ActionType.INITIALIZE:
        console.log('ANALYSES LENGTH', analyses.length > 0);
        console.log('ANALYSES FIRST', analyses[0].id);
        return analyses.length > 0 ? initState(analyses[0].id) : initState();
      default:
        throw new Error();
    }
  };

  const [
    { scale, mode, editing, selected, activeAnalyses },
    dispatch,
  ] = React.useReducer(reducer, {
    scale: DEFAULT_SCALE,
    mode: 'view',
  });

  const { Option } = Select;

  const onAnalysesChange = (value: string[]) => {
    dispatch({
      type: ActionType.ACTIVATE_ANALYSES,
      payload: { analyses: value },
    });
  };

  const onSearch = (value: string) => {
    let res = analyses.filter(a =>
      a.name.toLowerCase().includes(value.toLowerCase())
    );
    console.log('SEARCH', res);
    return res;
  };

  // alert(`editing`);
  return (
    <div className="analysis">
      <label>Selected</label>
      {selected}
      <br />
      {activeAnalyses}
      <>
        {mode === 'view' && (
          <Row className="analysisTools">
            <Col span={8}>
              <Select
                showSearch
                mode="multiple"
                placeholder="Please select"
                style={{ width: '100%' }}
                optionFilterProp="children"
                onChange={onAnalysesChange}
                onSearch={onSearch}
                filterOption={(input, option) =>
                  ((option!.children as unknown) as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {analyses.map((a, i) => (
                  <Option value={a.id}>{a.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={3}>
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
          .map((a, i) => (
            <section key={i}>
              <h1 aria-label="Analysis Name">
                {(mode === 'view' || editing !== a.id) && a.name}
                {mode === 'edit' && editing === a.id && (
                  <>
                    <Input
                      type="text"
                      value={a.name}
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
                      onClick={() => dispatch({ type: ActionType.INITIALIZE })}
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
                          onClick={() =>
                            dispatch({
                              type: ActionType.EDIT,
                              payload: { analysisId: a.id },
                            })
                          }
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item onClick={() => console.log('download')}>
                          Download
                        </Menu.Item>
                      </Menu>
                    }
                    icon={<MoreOutlined />}
                  />
                )}
              </h1>
              <p aria-label="Analysis Description">
                {(mode === 'view' || editing !== a.id) && a.description}
                {mode === 'edit' && editing === a.id && (
                  <Input.TextArea value={a.description} />
                )}
              </p>
              <section aria-label="Analysis Assets" className="assets">
                {a.analyses.map((asset, i) => (
                  <div
                    key={i}
                    aria-label="Analysis Asset"
                    className={`asset ${
                      selected && selected.findIndex(v => v === asset.id) > -1
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => {
                      if (!(mode === 'edit' && editing === a.id)) {
                        return;
                      }
                      dispatch({
                        type: ActionType.SELECT_ASSET,
                        payload: { assetId: asset.id },
                      });
                    }}
                  >
                    {asset.preview({ scale: scale, mode: mode })}
                  </div>
                ))}
              </section>
            </section>
          ))}
      </>
    </div>
  );
};
