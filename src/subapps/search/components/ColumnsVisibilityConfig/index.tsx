import { EyeInvisibleOutlined } from '@ant-design/icons';
import { Button, Form, Modal, Switch } from 'antd';
import * as React from 'react';
import './ColumnsVisibility.less';

export type ColumnVisibility = {
  key: string;
  name: string;
  visible: boolean;
};

const ColumnsVisibilityConfig: React.FunctionComponent<{
  columns: ColumnVisibility[];
  onSetColumnVisibility: (columnVisibility: ColumnVisibility) => void;
  onSetAllColumnVisibile: () => void;
}> = ({ columns, onSetColumnVisibility, onSetAllColumnVisibile }) => {
  const isAllColumnsVisible = () =>
    columns.filter(el => !el.visible).length === 0;

  const [
    isColumnsVisiblilityConfigVisible,
    setIsColumnsVisiblilityConfigVisible,
  ] = React.useState(false);

  const countHiddenFields = () => columns.filter(el => !el.visible).length;

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
          <div className="column-visibility-container">
            <Form>
              <Form.Item style={{ marginBottom: 0 }}>
                <label>
                  <Switch
                    size="small"
                    onChange={() => onSetAllColumnVisibile()}
                    disabled={isAllColumnsVisible()}
                    checked={isAllColumnsVisible()}
                  />{' '}
                  (Show all Columns)
                </label>
              </Form.Item>
              {columns.map((el, ix) => (
                <Form.Item key={el.key} style={{ marginBottom: 0 }}>
                  <label>
                    <Switch
                      size="small"
                      checked={el.visible}
                      onChange={checked =>
                        onSetColumnVisibility({
                          key: el.key,
                          name: el.name,
                          visible: checked,
                        })
                      }
                    />{' '}
                    {el.name}
                  </label>
                </Form.Item>
              ))}
            </Form>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ColumnsVisibilityConfig;
