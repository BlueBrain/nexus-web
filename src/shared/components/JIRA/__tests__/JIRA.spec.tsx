import * as React from 'react';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import JIRA from '../JIRA';
import { QueryClient, QueryClientProvider } from 'react-query';
import fetch from 'node-fetch';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  server,
} from '../../../../utils/testUtil';
import { rest } from 'msw';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
describe('JIRA', () => {
  it('renders with empty prop values', () => {
    const { container } = render(
      <JIRA
        projects={[]}
        issues={[]}
        onCreateIssue={jest.fn()}
        onLinkIssue={jest.fn()}
        onUnlinkIssue={jest.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={jest.fn()}
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
        onCreateIssue={jest.fn()}
        onLinkIssue={jest.fn()}
        onUnlinkIssue={jest.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={jest.fn()}
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
        onCreateIssue={jest.fn()}
        onLinkIssue={jest.fn()}
        onUnlinkIssue={jest.fn()}
        searchJiraLink={''}
        displayType="project"
        onNavigateToResource={jest.fn()}
        isLoading={false}
      ></JIRA>
    );
    expect(container).toMatchSnapshot();
    expect(container).not.toHaveTextContent('No linked issues.');
    expect(container).not.toHaveTextContent('Create Issue');
    expect(container).not.toHaveTextContent('Link Existing Issue');
  });
  xit('renders with projects', async () => {
    const createIssue = jest.fn();
    const { container } = render(
      <JIRA
        projects={[]}
        issues={[]}
        onCreateIssue={createIssue}
        onLinkIssue={jest.fn()}
        onUnlinkIssue={jest.fn()}
        searchJiraLink={''}
        displayType="resource"
        onNavigateToResource={jest.fn()}
        isLoading={false}
      ></JIRA>
    );
    const createButton = await screen.findByText('Create Issue');
    act(() => {
      fireEvent.click(createButton);
    });
    screen.debug();
    const createIssueModal = screen.getAllByAltText(
      'A Jira issue will be created and linked to this Nexus'
    );
    expect(createIssueModal).toHaveLength(1);
  });
});
