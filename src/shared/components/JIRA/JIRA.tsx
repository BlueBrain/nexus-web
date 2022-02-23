import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Empty, Input, Menu, Modal, Table } from 'antd';
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

const LinkIssueUI = ({
  onOk,
  onCancel,
  searchJiraLink,
}: {
  onOk: (issueKey: string) => void;
  onCancel: () => void;
  searchJiraLink: string;
}) => {
  const [issueKey, setIssueKey] = React.useState('');
  return (
    <>
      <Modal
        title="Link Issue"
        visible={true}
        onOk={() => onOk(issueKey)}
        onCancel={() => onCancel()}
      >
        <a href={searchJiraLink} target="_blank">
          Search in Jira
        </a>
        Link issue
        <Input
          type="text"
          value={issueKey}
          onChange={e => setIssueKey(e.currentTarget.value)}
        />
      </Modal>
    </>
  );
};

type JIRAPluginUIProps = {
  issues: any[];
  onCreateIssue: (summary: string) => void;
  onLinkIssue: (issueKey: string) => void;
  onUnlinkIssue: (issueKey: string) => void;
  searchJiraLink: string;
};
const JIRAPluginUI = ({
  issues,
  onCreateIssue,
  onLinkIssue,
  onUnlinkIssue,
  searchJiraLink,
}: JIRAPluginUIProps) => {
  const [createIssueVisible, setCreateIssueVisible] = React.useState(false);
  const [linkIssueVisible, setLinkIssueVisible] = React.useState(false);

  const confirmUnlinkIssue = (issueKey: string) => {
    Modal.confirm({
      title: 'Unlink Issue',
      content:
        'Are you sure you want to unlink the issue from this Nexus resource?',
      onOk: () => {
        onUnlinkIssue(issueKey);
        return Promise.resolve();
      },
    });
  };

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
      {linkIssueVisible && (
        <LinkIssueUI
          searchJiraLink={searchJiraLink}
          onOk={issueKey => {
            onLinkIssue(issueKey);
            setLinkIssueVisible(false);
          }}
          onCancel={() => setLinkIssueVisible(false)}
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
              <Menu.Item key="link" onClick={() => setLinkIssueVisible(true)}>
                Link issue
              </Menu.Item>
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
                          <Menu.Item
                            key="unlink"
                            onClick={() => confirmUnlinkIssue(issue.key)}
                          >
                            Unlink
                          </Menu.Item>
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
