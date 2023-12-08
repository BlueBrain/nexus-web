import '@testing-library/jest-dom';

import { createNexusClient } from '@bbp/nexus-sdk/es';
import { NexusProvider } from '@bbp/react-nexus';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from '../../../../shared/hooks/useNotification';
import { configureStore } from '../../../../store';
import { render, screen, server } from '../../../../utils/testUtil';
import JIRAPluginContainer from '../JIRAPluginContainer';

describe('Jira Plugin Container', () => {
  // establish API mocking before all tests
  beforeAll(() => server.listen());
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });

  const queryClient = new QueryClient();

  const mockResource = {
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
      {
        '@vocab': 'https://neuroshapes.org/',
        nsg: 'https://neuroshapes.org/',
        nxv: 'https://bluebrain.github.io/nexus/vocabulary/',
        prov: 'http://www.w3.org/ns/prov#',
      },
    ],
    '@id': 'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
    '@type': 'Analysis',
    generated: {
      '@id': 'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/TestAnalysisReport_A',
      '@type': 'AnalysisReport',
    },
    _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
    _createdAt: '2022-06-20T09:07:18.137Z',
    _createdBy: 'https://localhost:3000/nexus/v1/realms/local/users/localuser',
    _deprecated: false,
    _incoming:
      'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA/incoming',
    _outgoing:
      'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA/outgoing',
    _project: 'https://localhost:3000/nexus/v1/projects/bbp-users/nicholas',
    _rev: 5,
    _schemaProject: 'https://localhost:3000/nexus/v1/projects/bbp-users/nicholas',
    _self: 'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
    _updatedAt: '2022-06-23T09:14:59.359Z',
    _updatedBy: 'https://localhost:3000/nexus/v1/realms/local/users/localuser',
  };

  const mockResponseProjects = {
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/projects.json',
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
    ],
    '@id': 'https://localhost:3000/nexus/v1/projects/bbp-users/nicholas',
    '@type': 'Project',
    apiMappings: [],
    base: 'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/',
    description: '',
    vocab: 'https://localhost:3000/nexus/v1/vocabs/bbp-users/nicholas/',
    _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/projects.json',
    _createdAt: '2022-05-20T13:39:32.260Z',
    _createdBy: 'https://localhost:3000/nexus/v1/realms/local/users/localuser',
    _deprecated: false,
    _effectiveApiMappings: [
      {
        _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
        _prefix: 'nxv',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
        _prefix: 'documents',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
        _prefix: 'defaultResolver',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
        _prefix: 'schema',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
        _prefix: 'resource',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
        _prefix: '_',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/views.json',
        _prefix: 'view',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/storages.json',
        _prefix: 'storage',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/files.json',
        _prefix: 'file',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/resolvers.json',
        _prefix: 'resolver',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
        _prefix: 'graph',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/archives.json',
        _prefix: 'archive',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
        _prefix: 'defaultStorage',
      },
    ],
    _label: 'nicholas',
    _markedForDeletion: false,
    _organizationLabel: 'bbp-users',
    _organizationUuid: '66525817-7e21-42ab-b2b0-ed1798292e87',
    _rev: 1,
    _self: 'https://localhost:3000/nexus/v1/projects/bbp-users/nicholas',
    _updatedAt: '2022-05-20T13:39:32.260Z',
    _updatedBy: 'https://localhost:3000/nexus/v1/realms/local/users/localuser',
    _uuid: 'ea47e75b-aac6-4841-a729-a17350432adb',
  };

  const mockJiraProjectResponse = [
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15065',
      key: 'ACCS',
      name: 'Analyses of circuits, connectivity and simulations',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self: 'https://localhost:3000/jira/project/devissues/rest/api/2/project/15065',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14577',
      key: 'ANALYSIS',
      name: 'Analysis',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self: 'https://localhost:3000/jira/project/devissues/rest/api/2/project/14577',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://localhost:3000/jira/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15362',
      key: 'BBPP123',
      name: 'API Test [X]',
      projectTypeKey: 'software',
      self: 'https://localhost:3000/jira/project/devissues/rest/api/2/project/15362',
    },
  ];

  const mockJiraSearchResponse = {
    expand: 'names,schema',
    issues: [
      {
        expand: 'operations,versionedRepresentations,editmeta,changelog,renderedFields',
        fields: {
          aggregateprogress: { progress: 0, total: 0 },
          components: [],
          created: '2022-06-24T14:57:27.000+0200',
          creator: {
            active: true,
            avatarUrls: {
              '16x16':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
              '24x24':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?size=small&avatarId=10082',
              '32x32':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?size=medium&avatarId=10082',
              '48x48':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?avatarId=10082',
            },
            displayName: 'Nicholas Stephen Wells',
            emailAddress: 'nicholas.wells@epfl.ch',
            key: 'JIRAUSER15008',
            name: 'wells',
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/user?username=wells',
            timeZone: 'Europe/Zurich',
          },
          customfield_10210: {
            disabled: false,
            id: '10102',
            self:
              'https://localhost:3000/jira/project/devissues/rest/api/2/customFieldOption/10102',
            value: 'Low',
          },
          customfield_10211: {
            disabled: false,
            id: '10117',
            self:
              'https://localhost:3000/jira/project/devissues/rest/api/2/customFieldOption/10117',
            value: 'Low',
          },
          customfield_10310: '9223372036854775807',
          customfield_11010: '2|i015v3:',
          customfield_11310: [],
          customfield_11520: 'vendor',
          customfield_12410:
            '{summaryBean=com.atlassian.jira.plugin.devstatus.rest.SummaryBean@3caf1a59[summary={pullrequest=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@2abb21a4[overall=PullRequestOverallBean{stateCount=0, state=\'OPEN\', details=PullRequestOverallDetails{openCount=0, mergedCount=0, declinedCount=0}},byInstanceType={}], build=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@427e7956[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BuildOverallBean@31bbc6bc[failedBuildCount=0,successfulBuildCount=0,unknownBuildCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], review=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@6dd88878[overall=com.atlassian.jira.plugin.devstatus.summary.beans.ReviewsOverallBean@55170ca8[stateCount=0,state=<null>,dueDate=<null>,overDue=false,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], deployment-environment=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@64127b95[overall=com.atlassian.jira.plugin.devstatus.summary.beans.DeploymentOverallBean@b73cf8d[topEnvironments=[],showProjects=false,successfulCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], repository=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@22411dd3[overall=com.atlassian.jira.plugin.devstatus.summary.beans.CommitOverallBean@4fde377f[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], branch=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@386723c2[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BranchOverallBean@2dfd8ce4[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}]},errors=[],configErrors=[]], devSummaryJson={"cachedValue":{"errors":[],"configErrors":[],"summary":{"pullrequest":{"overall":{"count":0,"lastUpdated":null,"stateCount":0,"state":"OPEN","details":{"openCount":0,"mergedCount":0,"declinedCount":0,"total":0},"open":true},"byInstanceType":{}},"build":{"overall":{"count":0,"lastUpdated":null,"failedBuildCount":0,"successfulBuildCount":0,"unknownBuildCount":0},"byInstanceType":{}},"review":{"overall":{"count":0,"lastUpdated":null,"stateCount":0,"state":null,"dueDate":null,"overDue":false,"completed":false},"byInstanceType":{}},"deployment-environment":{"overall":{"count":0,"lastUpdated":null,"topEnvironments":[],"showProjects":false,"successfulCount":0},"byInstanceType":{}},"repository":{"overall":{"count":0,"lastUpdated":null},"byInstanceType":{}},"branch":{"overall":{"count":0,"lastUpdated":null},"byInstanceType":{}}}},"isStale":false}}',
          customfield_12597: {
            disabled: false,
            id: '11431',
            self:
              'https://localhost:3000/jira/project/devissues/rest/api/2/customFieldOption/11431',
            value: 'No',
          },
          customfield_13517:
            'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
          customfield_13518: 'https://localhost:3000/nexus/v1/projects/bbp-users/nicholas',
          fixVersions: [],
          issuelinks: [],
          issuetype: {
            avatarId: 11478,
            description: 'A task that needs to be done.',
            iconUrl:
              'https://localhost:3000/jira/project/devissues/secure/viewavatar?size=xsmall&avatarId=11478&avatarType=issuetype',
            id: '3',
            name: 'Task',
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issuetype/3',
            subtask: false,
          },
          labels: ['discussion'],
          lastViewed: '2022-06-24T14:57:33.706+0200',
          priority: {
            iconUrl:
              'https://localhost:3000/jira/project/devissues/images/icons/priorities/minor.svg',
            id: '10002',
            name: 'Low',
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/priority/10002',
          },
          progress: { progress: 0, total: 0 },
          project: {
            avatarUrls: {
              '16x16':
                'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
              '24x24':
                'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=small&avatarId=12663',
              '32x32':
                'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
              '48x48':
                'https://localhost:3000/jira/project/devissues/secure/projectavatar?avatarId=12663',
            },
            id: '14566',
            key: 'NEXUS',
            name: 'Blue Brain Nexus',
            projectTypeKey: 'software',
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/project/14566',
          },
          reporter: {
            active: true,
            avatarUrls: {
              '16x16':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
              '24x24':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?size=small&avatarId=10082',
              '32x32':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?size=medium&avatarId=10082',
              '48x48':
                'https://localhost:3000/jira/project/devissues/secure/useravatar?avatarId=10082',
            },
            displayName: 'Nicholas Stephen Wells',
            emailAddress: 'nicholas.wells@epfl.ch',
            key: 'JIRAUSER15008',
            name: 'wells',
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/user?username=wells',
            timeZone: 'Europe/Zurich',
          },
          status: {
            description: '',
            iconUrl: 'https://localhost:3000/jira/project/devissues/images/icons/statuses/open.png',
            id: '10109',
            name: 'To Do',
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/status/10109',
            statusCategory: {
              colorName: 'blue-gray',
              id: 2,
              key: 'new',
              name: 'To Do',
              self: 'https://localhost:3000/jira/project/devissues/rest/api/2/statuscategory/2',
            },
          },
          subtasks: [],
          summary: 'test1',
          updated: '2022-06-24T14:57:27.000+0200',
          versions: [],
          votes: {
            hasVoted: false,
            self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issue/NEXUS-57/votes',
            votes: 0,
          },
          watches: {
            isWatching: true,
            self:
              'https://localhost:3000/jira/project/devissues/rest/api/2/issue/NEXUS-57/watchers',
            watchCount: 1,
          },
          workratio: -1,
        },
        id: '80811',
        key: 'NEXUS-57',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issue/80811',
      },
    ],
    maxResults: 50,
    startAt: 0,
    total: 1,
  };

  const mockJiraIssueResponse = {
    expand: 'renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations',
    fields: {
      aggregateprogress: { progress: 0, total: 0 },
      attachment: [],
      comment: { comments: [], maxResults: 0, startAt: 0, total: 0 },
      components: [],
      created: '2022-06-24T14:57:27.962+0200',
      creator: {
        active: true,
        avatarUrls: {
          '16x16':
            'https://localhost:3000/jira/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
          '24x24':
            'https://localhost:3000/jira/project/devissues/secure/useravatar?size=small&avatarId=10082',
          '32x32':
            'https://localhost:3000/jira/project/devissues/secure/useravatar?size=medium&avatarId=10082',
          '48x48': 'https://localhost:3000/jira/project/devissues/secure/useravatar?avatarId=10082',
        },
        displayName: 'Nicholas Stephen Wells',
        emailAddress: 'nicholas.wells@epfl.ch',
        key: 'JIRAUSER15008',
        name: 'wells',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/user?username=wells',
        timeZone: 'Europe/Zurich',
      },
      customfield_10210: {
        disabled: false,
        id: '10102',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/customFieldOption/10102',
        value: 'Low',
      },
      customfield_10211: {
        disabled: false,
        id: '10117',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/customFieldOption/10117',
        value: 'Low',
      },
      customfield_10310: '9223372036854775807',
      customfield_11010: '2|i015v3:',
      customfield_11310: [],
      customfield_11520: 'vendor',
      customfield_12410:
        '{summaryBean=com.atlassian.jira.plugin.devstatus.rest.SummaryBean@7d0e2d60[summary={pullrequest=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@1e52fc78[overall=PullRequestOverallBean{stateCount=0, state=\'OPEN\', details=PullRequestOverallDetails{openCount=0, mergedCount=0, declinedCount=0}},byInstanceType={}], build=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@30117590[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BuildOverallBean@39a9fed6[failedBuildCount=0,successfulBuildCount=0,unknownBuildCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], review=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@49530c4[overall=com.atlassian.jira.plugin.devstatus.summary.beans.ReviewsOverallBean@7942b02e[stateCount=0,state=<null>,dueDate=<null>,overDue=false,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], deployment-environment=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@4244e763[overall=com.atlassian.jira.plugin.devstatus.summary.beans.DeploymentOverallBean@346dfeb3[topEnvironments=[],showProjects=false,successfulCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], repository=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@1953fbea[overall=com.atlassian.jira.plugin.devstatus.summary.beans.CommitOverallBean@757cfb2e[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], branch=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@1066651d[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BranchOverallBean@4ba589c4[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}]},errors=[],configErrors=[]], devSummaryJson={"cachedValue":{"errors":[],"configErrors":[],"summary":{"pullrequest":{"overall":{"count":0,"lastUpdated":null,"stateCount":0,"state":"OPEN","details":{"openCount":0,"mergedCount":0,"declinedCount":0,"total":0},"open":true},"byInstanceType":{}},"build":{"overall":{"count":0,"lastUpdated":null,"failedBuildCount":0,"successfulBuildCount":0,"unknownBuildCount":0},"byInstanceType":{}},"review":{"overall":{"count":0,"lastUpdated":null,"stateCount":0,"state":null,"dueDate":null,"overDue":false,"completed":false},"byInstanceType":{}},"deployment-environment":{"overall":{"count":0,"lastUpdated":null,"topEnvironments":[],"showProjects":false,"successfulCount":0},"byInstanceType":{}},"repository":{"overall":{"count":0,"lastUpdated":null},"byInstanceType":{}},"branch":{"overall":{"count":0,"lastUpdated":null},"byInstanceType":{}}}},"isStale":false}}',
      customfield_12597: {
        disabled: false,
        id: '11431',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/customFieldOption/11431',
        value: 'No',
      },
      customfield_13517:
        'https://localhost:3000/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
      customfield_13518: 'https://localhost:3000/nexus/v1/projects/bbp-users/nicholas',
      fixVersions: [],
      issuelinks: [],
      issuetype: {
        avatarId: 11478,
        description: 'A task that needs to be done.',
        iconUrl:
          'https://localhost:3000/jira/project/devissues/secure/viewavatar?size=xsmall&avatarId=11478&avatarType=issuetype',
        id: '3',
        name: 'Task',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issuetype/3',
        subtask: false,
      },
      labels: ['discussion'],
      lastViewed: '2022-06-24T14:57:33.706+0200',
      priority: {
        iconUrl: 'https://localhost:3000/jira/project/devissues/images/icons/priorities/minor.svg',
        id: '10002',
        name: 'Low',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/priority/10002',
      },
      progress: { progress: 0, total: 0 },
      project: {
        avatarUrls: {
          '16x16':
            'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
          '24x24':
            'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=small&avatarId=12663',
          '32x32':
            'https://localhost:3000/jira/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
          '48x48':
            'https://localhost:3000/jira/project/devissues/secure/projectavatar?avatarId=12663',
        },
        id: '14566',
        key: 'NEXUS',
        name: 'Blue Brain Nexus',
        projectTypeKey: 'software',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/project/14566',
      },
      reporter: {
        active: true,
        avatarUrls: {
          '16x16':
            'https://localhost:3000/jira/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
          '24x24':
            'https://localhost:3000/jira/project/devissues/secure/useravatar?size=small&avatarId=10082',
          '32x32':
            'https://localhost:3000/jira/project/devissues/secure/useravatar?size=medium&avatarId=10082',
          '48x48': 'https://localhost:3000/jira/project/devissues/secure/useravatar?avatarId=10082',
        },
        displayName: 'Nicholas Stephen Wells',
        emailAddress: 'nicholas.wells@epfl.ch',
        key: 'JIRAUSER15008',
        name: 'wells',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/user?username=wells',
        timeZone: 'Europe/Zurich',
      },
      status: {
        description: '',
        iconUrl: 'https://localhost:3000/jira/project/devissues/images/icons/statuses/open.png',
        id: '10109',
        name: 'To Do',
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/status/10109',
        statusCategory: {
          colorName: 'blue-gray',
          id: 2,
          key: 'new',
          name: 'To Do',
          self: 'https://localhost:3000/jira/project/devissues/rest/api/2/statuscategory/2',
        },
      },
      subtasks: [],
      summary: 'test1',
      timetracking: {},
      updated: '2022-06-24T14:57:27.962+0200',
      versions: [],
      votes: {
        hasVoted: false,
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issue/NEXUS-57/votes',
        votes: 0,
      },
      watches: {
        isWatching: true,
        self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issue/NEXUS-57/watchers',
        watchCount: 1,
      },
      worklog: { maxResults: 20, startAt: 0, total: 0, worklogs: [] },
      workratio: -1,
    },
    id: '80811',
    key: 'NEXUS-57',
    self: 'https://localhost:3000/jira/project/devissues/rest/api/2/issue/80811',
  };

  it('displays table containing a row with the linked jira issue and a link to it', async () => {
    server.use(
      rest.get('https://localhost:3000/projects/orgLabel/projectLabel', (_, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponseProjects)
        );
      }),
      rest.get('https://localhost:3000/jira/project', (_, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockJiraProjectResponse)
        );
      }),
      rest.post('https://localhost:3000/jira/search', (_, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockJiraSearchResponse)
        );
      }),
      rest.get('https://localhost:3000/jira/issue/NEXUS-57', (_, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockJiraIssueResponse)
        );
      })
    );

    const history = createMemoryHistory({});

    const store = configureStore(
      history,
      { nexus },
      {
        config: {
          apiEndpoint: 'https://localhost:3000',
          analysisPluginSparqlDataQuery: 'detailedCircuit',
          jiraUrl: 'https://localhost:3000/jira/project/devissues',
        },
      }
    );

    const App: React.FC = () => {
      const notificationData: NotificationContextType = getNotificationContextValue();

      return (
        <Router history={history}>
          <Provider store={store}>
            <NotificationContext.Provider value={notificationData}>
              <QueryClientProvider client={queryClient}>
                <NexusProvider nexusClient={nexus}>
                  <JIRAPluginContainer
                    projectLabel="projectLabel"
                    orgLabel="orgLabel"
                    resource={mockResource}
                  />
                </NexusProvider>
              </QueryClientProvider>
            </NotificationContext.Provider>
          </Provider>
        </Router>
      );
    };
    render(<App />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const jiraIssueLink = screen.getByRole('link', {
      name: 'test1',
    });
    expect(jiraIssueLink).toHaveAttribute(
      'href',
      'https://localhost:3000/jira/project/devissues/browse/NEXUS-57'
    );
  });
});
