import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Empty, Input, Menu, Table } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import * as React from 'react';

const CreateIssueUI = ({
  onOk,
  onCancel,
}: {
  onOk: (summary: string) => void;
  onCancel: () => void;
}) => {
  const [summary, setSummary] = React.useState('');
  return (
    <>
      <Modal
        title="Create Issue"
        visible={true}
        onOk={() => onOk(summary)}
        onCancel={() => onCancel()}
      >
        Create new issue
        <Input
          type="text"
          value={summary}
          onChange={e => setSummary(e.currentTarget.value)}
        />
      </Modal>
    </>
  );
};

type JIRAPluginUIProps = {
  issues: any[];
  onCreateIssue: (summary: string) => void;
};
const JIRAPluginUI = ({ issues, onCreateIssue }: JIRAPluginUIProps) => {
  const [createIssueVisible, setCreateIssueVisible] = React.useState(false);
  return (
    <>
      {createIssueVisible && (
        <CreateIssueUI
          onOk={summary => {
            onCreateIssue(summary);
            setCreateIssueVisible(false);
          }}
          onCancel={() => setCreateIssueVisible(false)}
        />
      )}
      {issues.length > 0 && (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="create"
                onClick={() => setCreateIssueVisible(true)}
              >
                Create issue
              </Menu.Item>
              <Menu.Item key="link">Link issue</Menu.Item>
            </Menu>
          }
        >
          <Button>
            Add <DownOutlined />
          </Button>
        </Dropdown>
      )}

      {issues.length === 0 && (
        <Empty description="No linked issues.">
          <Button type="primary" onClick={() => setCreateIssueVisible(true)}>
            Create Issue
          </Button>{' '}
          or <Button type="default">Link Existing Issue</Button>
        </Empty>
      )}

      {issues.length > 0 && (
        <Table
          dataSource={issues}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            {
              key: 'id',
              render: issue => {
                return (
                  <>
                    <Dropdown.Button
                      overlay={
                        <Menu>
                          <Menu.Item key="unlink">Unlink</Menu.Item>
                        </Menu>
                      }
                      onClick={() => window.open(issue.url, '_blank')}
                    >
                      Open
                    </Dropdown.Button>
                  </>
                );
              },
            },
          ]}
        />
      )}
    </>
  );
};

export default JIRAPluginUI;
