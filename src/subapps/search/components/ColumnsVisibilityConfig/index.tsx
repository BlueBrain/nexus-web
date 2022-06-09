import { EyeInvisibleOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Switch } from 'antd';
import * as React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import {
  fieldVisibilityActionType,
  FieldsVisibilityState,
} from '../../hooks/useGlobalSearch';
import './ColumnsVisibility.less';

export type ColumnVisibility = {
  key: string;
  name: string;
  visible: boolean;
};

const ColumnsVisibilityConfig: React.FunctionComponent<{
  columnsVisibility: FieldsVisibilityState;
  dispatchFieldVisibility: React.Dispatch<fieldVisibilityActionType>;
}> = ({ columnsVisibility, dispatchFieldVisibility }) => {
  const isAllColumnsVisible = () =>
    columnsVisibility.fields.filter(el => !el.visible).length === 0;

  const [
    isColumnsVisiblilityConfigVisible,
    setIsColumnsVisiblilityConfigVisible,
  ] = React.useState(false);

  const countHiddenFields = () =>
    columnsVisibility.fields.filter(el => !el.visible).length;

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const positionModal = () => {
    const buttonRects = buttonRef.current?.getBoundingClientRect();

    return { top: buttonRects?.bottom, left: buttonRects?.left };
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setIsColumnsVisiblilityConfigVisible(true)}
        type="link"
      >
        <EyeInvisibleOutlined />
        {countHiddenFields() > 0 ? (
          <> {countHiddenFields()} hidden columns</>
        ) : (
          <> hide columns</>
        )}
      </Button>
      {isColumnsVisiblilityConfigVisible && (
        <Modal
          onCancel={() => setIsColumnsVisiblilityConfigVisible(false)}
          visible={isColumnsVisiblilityConfigVisible}
          style={{ ...positionModal(), position: 'fixed' }}
          mask={false}
          footer={null}
          closable={false}
          className="column-visibility-config-modal"
        >
          <DragDropContext
            onDragEnd={result => {
              const { destination, source } = result;
              if (!destination) {
                return;
              }
              const fields = columnsVisibility.fields;
              const saved = fields[destination.index];
              fields[destination.index] = fields[source.index];
              fields[source.index] = saved;
              dispatchFieldVisibility({
                type: 'reOrder',
                payload: fields,
              });
            }}
          >
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  className="column-visibility-container"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Form>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <MoreOutlined className="drag-icon-spacer" />
                      <label>
                        <Switch
                          size="small"
                          onChange={() =>
                            dispatchFieldVisibility({
                              type: 'setAllVisible',
                            })
                          }
                          disabled={isAllColumnsVisible()}
                          checked={isAllColumnsVisible()}
                        />{' '}
                        (Show all Columns)
                      </label>
                    </Form.Item>
                    {columnsVisibility.fields.map((el, ix) => (
                      <Draggable key={el.key} draggableId={el.key} index={ix}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Form.Item key={el.key} style={{ marginBottom: 0 }}>
                              <MoreOutlined />
                              <label>
                                <Switch
                                  size="small"
                                  checked={el.visible}
                                  onChange={checked =>
                                    dispatchFieldVisibility({
                                      type: 'update',
                                      payload: {
                                        key: el.key,
                                        name: el.name,
                                        visible: checked,
                                      },
                                    })
                                  }
                                />{' '}
                                {el.name}
                              </label>
                            </Form.Item>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </Form>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Modal>
      )}
    </>
  );
};

export default ColumnsVisibilityConfig;
