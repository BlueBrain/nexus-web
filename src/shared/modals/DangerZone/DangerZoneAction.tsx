import React, { useState } from 'react';
import { Button, Col, Form, Input, Modal, Row } from 'antd';

export type TDangerZoneActionProps = {
  open: boolean;
  onClose(): void;
  matchTerm: string;
  handler(values: any): void;
  action: 'deprecate' | 'delete' | 'undo-deprecate';
  title: string;
  description: string;
  status: boolean;
};
const DangerZoneAction = ({
  open,
  onClose,
  matchTerm,
  handler,
  action,
  title,
  description,
  status,
}: TDangerZoneActionProps) => {
  const [matchTermValue, setMatchTermValue] = useState('');
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMatchTermValue(e.target.value);
  return (
    <Modal
      open={open}
      onCancel={onClose}
      maskClosable={false}
      footer={null}
      centered
      title={<strong>{title}</strong>}
    >
      <Form onFinish={handler}>
        <Row>
          <p>
            {description} {matchTerm}.
            <br />
            Please type <strong>{matchTerm}</strong> to confirm.
          </p>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              name="projectName"
              rules={[
                {
                  required: true,
                  message: 'This is required field',
                },
                {
                  validator: (_, value) => {
                    if (value.toLowerCase() === matchTerm) {
                      return Promise.resolve();
                    }
                    return Promise.reject();
                  },
                },
              ]}
            >
              <Input
                onPaste={e => {
                  e.preventDefault();
                  return false;
                }}
                onDrop={e => {
                  e.preventDefault();
                  return false;
                }}
                value={matchTermValue}
                onChange={handleValueChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const projectName = getFieldValue('projectName');
                const disabled =
                  (projectName as string)?.toLowerCase() !== matchTerm;
                return (
                  <Button
                    loading={status}
                    disabled={disabled}
                    type="primary"
                    htmlType="submit"
                    danger
                  >
                    I understand the consequences, {action} this project
                  </Button>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DangerZoneAction;
