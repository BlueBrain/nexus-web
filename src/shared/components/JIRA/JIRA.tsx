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
        <p>A Jira issue will be created and linked to this Nexus resource.</p>
        <Input
          type="text"
          value={summary}
          onChange={e => setSummary(e.currentTarget.value)}
          placeholder="Issue Summary"
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
          Search for issue in Jira
        </a>
        <br />
        <br />
        <Input
          type="text"
          value={issueKey}
          onChange={e => setIssueKey(e.currentTarget.value)}
          placeholder="Jira Issue Key"
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
        <div style={{ width: '100%', display: 'flex', marginBottom: '10px' }}>
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
            <Button type="primary" style={{ marginLeft: 'auto' }}>
              Add <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      )}

      {issues.length === 0 && (
        <Empty description="No linked issues.">
          <Button type="primary" onClick={() => setCreateIssueVisible(true)}>
            Create Issue
          </Button>{' '}
          or{' '}
          <Button type="default" onClick={() => setLinkIssueVisible(true)}>
            Link Existing Issue
          </Button>
        </Empty>
      )}

      {issues.length > 0 && (
        <Table
          size="small"
          dataSource={issues}
          columns={[
            {
              title: 'Issue',
              render: issue => {
                return (
                  <>
                    {issue.summary} ({issue.key})
                  </>
                );
              },
            },
            {
              title: 'Last updated',
              render: issue => {
                return <>{issue.updated}</>;
              },
            },
            {
              title: 'Status',
              render: issue => {
                return <>{issue.status}</>;
              },
            },
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
