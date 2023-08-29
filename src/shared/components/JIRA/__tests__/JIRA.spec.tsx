import '@testing-library/jest-dom';
import JIRA, { AuthorizeJiraUI, CreateIssueUI, LinkIssueUI } from '../JIRA';
import { render, fireEvent, waitFor, screen } from '../../../../utils/testUtil';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';

window.computedStyle = vi.fn();

describe('JIRA', () => {
  it('renders with empty prop values', () => {
    const { container } = render(
      <JIRA
        projects={[]}
        issues={[]}
        onCreateIssue={vi.fn()}
        onLinkIssue={vi.fn()}
        onUnlinkIssue={vi.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={vi.fn()}
        isLoading={false}
      ></JIRA>
    );
    expect(container).toMatchSnapshot();
    expect(container).toHaveTextContent('No linked issues.');
    expect(container).toHaveTextContent('Create Issue');
    expect(container).toHaveTextContent('Link Existing Issue');
  });
  it('renders with issues', () => {
    const issues = [
      {
        resourceId: 'testId',
        summary: 'An issue summary',
        resourceLabel: 'self url',
        updated: '2020-01-08',
        status: '',
        commentCount: 0,
        key: 'blah',
      },
    ];
    const { container } = render(
      <JIRA
        projects={[]}
        issues={issues}
        onCreateIssue={vi.fn()}
        onLinkIssue={vi.fn()}
        onUnlinkIssue={vi.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={vi.fn()}
        isLoading={false}
      ></JIRA>
    );
    expect(container).toMatchSnapshot();
    expect(container).not.toHaveTextContent('No linked issues.');
    expect(container).not.toHaveTextContent('Create Issue');
    expect(container).not.toHaveTextContent('Link Existing Issue');
  });
  it('renders with projects', () => {
    const issues = [
      {
        summary: 'An issue summary',
        resourceLabel: 'self url',
        updated: '2020-01-08',
        status: '',
        commentCount: 0,
        key: 'blah',
      },
    ];
    const { container } = render(
      <JIRA
        projects={[]}
        issues={issues}
        onCreateIssue={vi.fn()}
        onLinkIssue={vi.fn()}
        onUnlinkIssue={vi.fn()}
        searchJiraLink={''}
        displayType="project"
        onNavigateToResource={vi.fn()}
        isLoading={false}
      ></JIRA>
    );
    expect(container).toMatchSnapshot();
    expect(container).not.toHaveTextContent('No linked issues.');
    expect(container).not.toHaveTextContent('Create Issue');
    expect(container).not.toHaveTextContent('Link Existing Issue');
  });
  it('shows loading spinner', async () => {
    const createIssue = vi.fn();
    const { container } = render(
      <JIRA
        projects={[]}
        issues={[]}
        onCreateIssue={createIssue}
        onLinkIssue={vi.fn()}
        onUnlinkIssue={vi.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={vi.fn()}
        isLoading={true}
      />
    );
    expect(container).toMatchSnapshot();
    expect(container).toHaveTextContent('Loading');
  });
  it('shows create modal', async () => {
    const createIssue = vi.fn();
    const { container } = render(
      <JIRA
        projects={[]}
        issues={[]}
        onCreateIssue={createIssue}
        onLinkIssue={vi.fn()}
        onUnlinkIssue={vi.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={vi.fn()}
        isLoading={false}
      ></JIRA>
    );
    const createButton = await screen.findByRole('button', {
      name: 'Create Issue',
    });
    act(() => {
      fireEvent.click(createButton);
    });
    await waitFor(async () => {
      const x = await screen.findAllByText(
        'A Jira issue will be created and linked to this Nexus resource'
      );
      expect(x).toHaveLength(1);
    });
  });
  it('renders createIssue UI', async () => {
    const createIssueCallBack = vi.fn();
    const cancelBack = vi.fn();
    const { container } = render(
      <CreateIssueUI
        displayType={'resource'}
        projects={[
          {
            name: 'test',
            key: 'test',
          },
        ]}
        onOk={createIssueCallBack}
        onCancel={cancelBack}
      />
    );
    const buttons = await screen.findAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(cancelBack).toHaveBeenCalled();
  });
  it('renders linkIssue UI', async () => {
    const linkIssueCallBack = vi.fn();
    const cancelBack = vi.fn();
    const { container } = render(
      <LinkIssueUI
        searchJiraLink={'jiralink'}
        onOk={linkIssueCallBack}
        onCancel={cancelBack}
      />
    );

    const buttons = await screen.findAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(cancelBack).toHaveBeenCalled();
    fireEvent.click(buttons[2]);
    expect(linkIssueCallBack).toHaveBeenCalled();
  });
  it('shows link modal', async () => {
    const { container } = render(
      <JIRA
        projects={[]}
        issues={[]}
        onCreateIssue={vi.fn()}
        onLinkIssue={vi.fn()}
        onUnlinkIssue={vi.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={vi.fn()}
        isLoading={false}
      ></JIRA>
    );
    const createLinkButton = await screen.findAllByRole('button');
    act(() => {
      fireEvent.click(createLinkButton[1]);
    });
    await waitFor(async () => {
      const x = await screen.findAllByText('Search for issue in Jira');
      expect(x).toHaveLength(1);
    });
  });
  it('renders authraizeJIRAUI', async () => {
    const { container } = render(
      <AuthorizeJiraUI
        jiraAuthUrl={'jirurri'}
        onSubmitVerificationCode={vi.fn()}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
