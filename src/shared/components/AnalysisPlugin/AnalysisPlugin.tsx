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
}

const DEFAULT_SCALE = 50;

type AnalysesAction =
  | { type: ActionType.RESCALE; payload: number }
  | { type: ActionType.EDIT; payload: { analysisId: string } }
  | { type: ActionType.INITIALIZE }
  | { type: ActionType.SELECT_ASSET; payload: { assetId: string } };

type AnalysesState = {
  scale: number;
  mode: 'view' | 'edit';
  editing?: string;
  selected?: string[];
};
const initState = (): AnalysesState => ({
  scale: DEFAULT_SCALE,
  mode: 'view',
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
      case ActionType.INITIALIZE:
        return initState();

      default:
        throw new Error();
    }
  };

  const [{ scale, mode, editing, selected }, dispatch] = React.useReducer(
    reducer,
    {
      scale: DEFAULT_SCALE,
      mode: 'view',
    }
  );
  const { Option } = Select;

  const onChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };
  // alert(`editing`);
  return (
    <div className="analysis">
      <label>Selected</label>
      {selected}
      <>
        {mode === 'view' && (
          <Row className="analysisTools">
            <Col span={2}>
              <Select
                showSearch
                placeholder="Select Analysis"
                optionFilterProp="children"
                onChange={onChange}
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
            <Col span={2}>
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
        {analyses.map((a, i) => (
          <section key={i}>
            <h1 aria-label="Analysis Name">
              {(mode === 'view' || editing !== a.id) && a.name}
              {mode === 'edit' && editing === a.id && (
                <>
                  <Input type="text" value={a.name} style={{ width: '60%' }} />
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
