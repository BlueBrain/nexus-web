import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import fetch from 'node-fetch';
import { QueryClient, QueryClientProvider } from 'react-query';
import JIRAPluginContainer from '../JIRAPluginContainer';
import { rest } from 'msw';
import { render, server, waitFor, screen } from '../../../../utils/testUtil';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from '../../../../shared/hooks/useNotification';

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
  const mockState = {
    config: {
      apiEndpoint: 'https://localhost:3000',
      analysisPluginSparqlDataQuery: 'detailedCircuit',
      jiraUrl: 'https://bbpteam.epfl.ch/project/devissues',
    },
  };
  const queryClient = new QueryClient();
  const mockStore = configureStore();
  jest.mock('react-redux', () => {
    const ActualReactRedux = jest.requireActual('react-redux');
    return {
      ...ActualReactRedux,
      useSelector: jest.fn().mockImplementation(() => {
        return mockState;
      }),
    };
  });

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
    '@id':
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
    '@type': 'Analysis',
    generated: {
      '@id':
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/TestAnalysisReport_A',
      '@type': 'AnalysisReport',
    },
    _constrainedBy:
      'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
    _createdAt: '2022-06-20T09:07:18.137Z',
    _createdBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
    _deprecated: false,
    _incoming:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA/incoming',
    _outgoing:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA/outgoing',
    _project:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
    _rev: 5,
    _schemaProject:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
    _self:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
    _updatedAt: '2022-06-23T09:14:59.359Z',
    _updatedBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
  };

  const mockResponseProjects = {
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/projects.json',
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
    ],
    '@id': 'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
    '@type': 'Project',
    apiMappings: [],
    base:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/',
    description: '',
    vocab: 'https://dev.nise.bbp.epfl.ch/nexus/v1/vocabs/bbp-users/nicholas/',
    _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/projects.json',
    _createdAt: '2022-05-20T13:39:32.260Z',
    _createdBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
    _deprecated: false,
    _effectiveApiMappings: [
      {
        _namespace: 'https://bluebrain.github.io/nexus/vocabulary/',
        _prefix: 'nxv',
      },
      {
        _namespace:
          'https://bluebrain.github.io/nexus/vocabulary/defaultElasticSearchIndex',
        _prefix: 'documents',
      },
      {
        _namespace:
          'https://bluebrain.github.io/nexus/vocabulary/defaultInProject',
        _prefix: 'defaultResolver',
      },
      {
        _namespace:
          'https://bluebrain.github.io/nexus/schemas/shacl-20170720.ttl',
        _prefix: 'schema',
      },
      {
        _namespace:
          'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
        _prefix: 'resource',
      },
      {
        _namespace:
          'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
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
        _namespace:
          'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex',
        _prefix: 'graph',
      },
      {
        _namespace: 'https://bluebrain.github.io/nexus/schemas/archives.json',
        _prefix: 'archive',
      },
      {
        _namespace:
          'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
        _prefix: 'defaultStorage',
      },
    ],
    _label: 'nicholas',
    _markedForDeletion: false,
    _organizationLabel: 'bbp-users',
    _organizationUuid: '66525817-7e21-42ab-b2b0-ed1798292e87',
    _rev: 1,
    _self: 'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
    _updatedAt: '2022-05-20T13:39:32.260Z',
    _updatedBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
    _uuid: 'ea47e75b-aac6-4841-a729-a17350432adb',
  };

  const mockJiraProjectResponse = [
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15065',
      key: 'ACCS',
      name: 'Analyses of circuits, connectivity and simulations',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15065',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14577',
      key: 'ANALYSIS',
      name: 'Analysis',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14577',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15362',
      key: 'BBPP123',
      name: 'API Test [X]',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15362',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14178',
      key: 'AA',
      name: 'Atlas Alignment',
      projectCategory: {
        description:
          'Issues arising within a particular area of the project (archived Jira project)',
        id: '10422',
        name: '[Archive] General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10422',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14178',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14170',
      key: 'ANDI',
      name: 'Atlas Nexus Data Integration',
      projectCategory: {
        description:
          'Issues arising within a particular area of the project (archived Jira project)',
        id: '10422',
        name: '[Archive] General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10422',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14170',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13960',
      key: 'BB5',
      name: 'BB5 Phase 1 and 2',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13960',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14361',
      key: 'BB5P2',
      name: 'BB5-P2',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14361',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14060',
      key: 'BBPDP',
      name: 'BBP Data Portal',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14060',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12166&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12166&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12166&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12166&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12166',
      key: 'BGP',
      name: 'BBP General Project',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12166',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14568',
      key: 'LEGAL',
      name: 'BBP Legal',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14568',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14272',
      key: 'BSD',
      name: 'BBP Software Deployment',
      projectCategory: {
        description: 'Projects that involve/represent software development',
        id: '10000',
        name: 'Development',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10000',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14272',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14271',
      key: 'BBPP88',
      name: 'BBP Summer School 2020',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14271',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12764&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12764&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12764&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12764&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12764',
      key: 'HBO',
      name: 'BBP Travel',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12764',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14265',
      key: 'BBPV2019',
      name: 'BBP Video 2019',
      projectCategory: {
        description:
          'Issues arising within a particular area of the project (archived Jira project)',
        id: '10422',
        name: '[Archive] General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10422',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14265',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11563&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11563&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11563&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11563&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11563',
      key: 'BBPPROD',
      name: 'BBP-Production',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11563',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13460&avatarId=12670',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13460&avatarId=12670',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13460&avatarId=12670',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13460&avatarId=12670',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13460',
      key: 'BBPHR',
      name: 'BBPHR (TEST)',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13460',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10031&avatarId=10162',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10031&avatarId=10162',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10031&avatarId=10162',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10031&avatarId=10162',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10031',
      key: 'BBPSDK',
      name: 'BBPSDK',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10031',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11362&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11362&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11362&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11362&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11362',
      key: 'BGLPY',
      name: 'BGLibPy',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11362',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15365',
      key: 'BBPP100',
      name: 'Biophysical Modeling of the Mouse C2 Barrel Cortex (BMC2BACX)',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15365',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14573',
      key: 'BBBE',
      name: 'Blue Brain BioExplorer',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14573',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14960&avatarId=12668',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14960&avatarId=12668',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14960&avatarId=12668',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14960&avatarId=12668',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14960',
      key: 'BBGLUCOSE',
      name: 'Blue Brain Glucose Metabolism',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14960',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14574',
      key: 'BBG',
      name: 'Blue Brain Graph (COVID-19 BBG)',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14574',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14566',
      key: 'NEXUS',
      name: 'Blue Brain Nexus',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14566',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14962&avatarId=12666',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14962&avatarId=12666',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14962&avatarId=12666',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14962&avatarId=12666',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14962',
      key: 'BBOP',
      name: 'Blue Brain Outreach Portal design & back-end support',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14962',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14264',
      key: 'BBPR',
      name: 'Blue Brain Portal Refinement',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14264',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14964&avatarId=12666',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14964&avatarId=12666',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14964&avatarId=12666',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14964&avatarId=12666',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14964',
      key: 'SCIEXPL',
      name: 'Blue Brain Science Explorer',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14964',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14572',
      key: 'BBS',
      name: 'Blue Brain Search (COVID-19 BBS)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14572',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10077&avatarId=10761',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10077&avatarId=10761',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10077&avatarId=10761',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10077&avatarId=10761',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10077',
      key: 'BLBLD',
      name: 'Blue builder',
      projectCategory: {
        description: 'Building and simulation tools (archived Jira project)',
        id: '10420',
        name: '[Archive] Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10420',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10077',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10073&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10073&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10073&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10073&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10073',
      key: 'BLCLN',
      name: 'Blue clone',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10073',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10069&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10069&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10069&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10069&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10069',
      key: 'BLHUB',
      name: 'Blue hub',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10069',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10760&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10760&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10760&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10760&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10760',
      key: 'MSSDK',
      name: 'Blue Morphology Stats SDK',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10760',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13761',
      key: 'BNAAS',
      name: 'BlueNaaS (Blue Neuron as a Service)',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13761',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10961&avatarId=10660',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10961&avatarId=10660',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10961&avatarId=10660',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10961&avatarId=10660',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10961',
      key: 'BLPY',
      name: 'BluePy',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10961',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14860',
      key: 'BPEM',
      name: 'BluePyEModel',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14860',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10063&avatarId=10160',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10063&avatarId=10160',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10063&avatarId=10160',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10063&avatarId=10160',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10063',
      key: 'BREP',
      name: 'BlueRepairSDK',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10063',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11261&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11261&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11261&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11261&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11261',
      key: 'BLUR',
      name: 'Bluron',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11261',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13160&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13160&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13160&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13160&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13160',
      key: 'BSP',
      name: 'Brain Simulation Platform',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13160',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10167&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10167&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10167&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10167&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10167',
      key: 'SCIVOL',
      name: 'Brain spaces',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10167',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13664&avatarId=12667',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13664&avatarId=12667',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13664&avatarId=12667',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13664&avatarId=12667',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13664',
      key: 'BRBLD',
      name: 'BrainBuilder',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13664',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13660',
      key: 'BRAYNS',
      name: 'Brayns',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13660',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=15061&avatarId=10764',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=15061&avatarId=10764',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=15061&avatarId=10764',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=15061&avatarId=10764',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15061',
      key: 'BCS',
      name: 'Brayns Circuit Studio',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15061',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15063',
      key: 'BCSB',
      name: 'Brayns Circuit Studio Backend',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15063',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15064',
      key: 'BV',
      name: 'Brayns Viewer',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15064',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14162',
      key: 'CA',
      name: 'Cell atlas',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14162',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10168&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10168&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10168&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10168&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10168',
      key: 'SCIDIST',
      name: 'Cell distribution',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10168',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14576',
      key: 'CELLS',
      name: 'CELLS',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14576',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11865&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11865&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11865&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11865&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11865',
      key: 'CHLM',
      name: 'Channelome',
      projectCategory: {
        description: 'Lateral research projects',
        id: '10023',
        name: 'Research projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10023',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11865',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10071&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10071&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10071&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10071&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10071',
      key: 'CHPED',
      name: 'Channelpedia',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10071',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10165&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10165&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10165&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10165&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10165',
      key: 'SCICIRC',
      name: 'Circuit',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10165',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10002&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10002&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10002&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10002&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10002',
      key: 'BBPCIRCUITBUILDING',
      name: 'Circuit building',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10002',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13662',
      key: 'HPCCBP',
      name: 'Circuit Building Plumbing',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13662',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14063',
      key: 'CIRPOR',
      name: 'Circuit-Portal',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14063',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14260',
      key: 'CLOCK',
      name: 'CLOCK',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14260',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11360&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11360&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11360&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11360&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11360',
      key: 'CMAKE',
      name: 'CMake',
      projectCategory: {
        description:
          'Projects that involve/represent software development (archived Jira project)',
        id: '10421',
        name: '[Archive] Development',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10421',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11360',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15062',
      key: 'CODES',
      name: 'Code Sharing',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15062',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10260&avatarId=10009',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10260&avatarId=10009',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10260&avatarId=10009',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10260&avatarId=10009',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10260',
      key: 'LBK',
      name: 'Collaboratory',
      projectCategory: {
        description: 'Software tools for the simulation platform',
        id: '10220',
        name: 'Platform development',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10220',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10260',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14760',
      key: 'CONAN',
      name: 'Conan',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14760',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12670&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12670&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12670&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12670&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12670',
      key: 'CNEUR',
      name: 'CoreNeuron',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12670',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12960&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12960&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12960&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12960&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12960',
      key: 'CEPR',
      name: 'CSCS/EPFL Platform Readiness',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12960',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14167',
      key: 'DKE',
      name: 'Data & Knowledge Engineering',
      projectCategory: {
        description: 'Software tools for the simulation platform',
        id: '10220',
        name: 'Platform development',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10220',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14167',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14180&avatarId=10767',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14180&avatarId=10767',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14180&avatarId=10767',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14180&avatarId=10767',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14180',
      key: 'DI',
      name: 'Data Integration',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14180',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14274',
      key: 'IMESPRT',
      name: 'DDN support on IME',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14274',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15363',
      key: 'BBPP92',
      name: 'DDN support on IME test',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15363',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14578',
      key: 'DEAL',
      name: 'Deep Atlas',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14578',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14266',
      key: 'DEEP',
      name: 'DeepMorphs',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14266',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10661&avatarId=10000',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10661&avatarId=10000',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10661&avatarId=10000',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10661&avatarId=10000',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10661',
      key: 'DEMO',
      name: 'DEMO',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10661',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11862&avatarId=10764',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11862&avatarId=10764',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11862&avatarId=10764',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11862&avatarId=10764',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11862',
      key: 'DISCL',
      name: 'DisplayCluster',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11862',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14579',
      key: 'DLM',
      name: 'DLM - Data lifecycle management',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14579',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13260&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13260&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13260&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13260&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13260',
      key: 'BBPEC',
      name: 'eCode',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13260',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10164&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10164&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10164&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10164&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10164',
      key: 'SCIETYPES',
      name: 'Electrical models',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10164',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13863&avatarId=12669',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13863&avatarId=12669',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13863&avatarId=12669',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13863&avatarId=12669',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13863',
      key: 'EVENTS',
      name: 'Events',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'service_desk',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13863',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10050&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10050&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10050&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10050&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10050',
      key: 'FELIB',
      name: 'Feature extraction library',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10050',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14563',
      key: 'FMHIPP',
      name: 'Full Mouse Hippocampus',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14563',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12863&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12863&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12863&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12863&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12863',
      key: 'FUNCZ',
      name: 'Functionalizer (FUNCZ)',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12863',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10000&avatarId=10030',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10000&avatarId=10030',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10000&avatarId=10030',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10000&avatarId=10030',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10000',
      key: 'BBPGENERAL',
      name: 'General - Blue Brain Project',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10000',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14660&avatarId=14161',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14660&avatarId=14161',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14660&avatarId=14161',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14660&avatarId=14161',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14660',
      key: 'GITLAB',
      name: 'GITLAB',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14660',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13763',
      key: 'GSOC2017',
      name: 'Google Summer Of Code 2017',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13763',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12861&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12861&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12861&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12861&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12861',
      key: 'HCOR',
      name: 'HBP communications coordination',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12861',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11460&avatarId=10770',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11460&avatarId=10770',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11460&avatarId=10770',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11460&avatarId=10770',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11460',
      key: 'HBPWS',
      name: 'HBP Portal',
      projectCategory: {
        description: 'Projects that involve/represent software development',
        id: '10000',
        name: 'Development',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10000',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11460',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10461&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10461&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10461&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10461&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10461',
      key: 'HBPPS',
      name: 'HBP Preparatory Study Website',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10461',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13865',
      key: 'SP5NEXUS',
      name: 'HBP SP5 - BBP Nexus collaboration',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13865',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10662&avatarId=10460',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10662&avatarId=10460',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10662&avatarId=10460',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10662&avatarId=10460',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10662',
      key: 'HELP',
      name: 'Helpdesk support',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'service_desk',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10662',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12762&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12762&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12762&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12762&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12762',
      key: 'SCIHIPPO',
      name: 'Hippocampal Modeling',
      projectCategory: {
        description:
          'Issues arising within a particular area of the project (archived Jira project)',
        id: '10422',
        name: '[Archive] General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10422',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12762',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14571',
      key: 'HIPPCONN',
      name: 'Hippocampus Inter-regional connectivity',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14571',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14570',
      key: 'HIPPDISS',
      name: 'Hippocampus network dissemination',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14570',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11760&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11760&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11760&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11760&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11760',
      key: 'BBPP16',
      name: 'HPC production and profiling of production software',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11760',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13964',
      key: 'HPCSUBMOL',
      name: 'HPC SubMolecular',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13964',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12165&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12165&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12165&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12165&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12165',
      key: 'HPCTM',
      name: 'HPC Team',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12165',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14963&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14963&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14963&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14963&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14963',
      key: 'HCM2021',
      name: 'Human Cortical Microcircuit 2021',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14963',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14182',
      key: 'HNCMV1',
      name: 'Human Neocortical Cell Models v1',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14182',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10040&avatarId=10010',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10040&avatarId=10010',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10040&avatarId=10010',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10040&avatarId=10010',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10040',
      key: 'INFRA',
      name: 'Infrastructure',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10040',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14461',
      key: 'IHNM',
      name: 'Initial Human Neocortical Microcircuit',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14461',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12760&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12760&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12760&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12760&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12760',
      key: 'SCIEXP',
      name: 'InSilico Experiments',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12760',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11863&avatarId=10769',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11863&avatarId=10769',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11863&avatarId=10769',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11863&avatarId=10769',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11863',
      key: 'ISC',
      name: 'Interactive Super Computing',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11863',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14261',
      key: 'BBPP74',
      name: 'Ion Channel - Na Families',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14261',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14362',
      key: 'ICPLATFORM',
      name: 'Ion Channel Platform',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14362',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14262',
      key: 'BBPP75',
      name: 'LDAP Groups Clean-Up',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14262',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13663',
      key: 'HBPLE',
      name: 'Learning Engine',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13663',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11861&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11861&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11861&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11861&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11861',
      key: 'LIV',
      name: 'Livre',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11861',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14560',
      key: 'LNMCE',
      name: 'LNMC Electrophysiology Data Standarization',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14560',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15060',
      key: 'LTAPP',
      name: 'LT Approval PoC',
      projectTypeKey: 'service_desk',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15060',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10067&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10067&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10067&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10067&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10067',
      key: 'MPALG',
      name: 'Mapping algorithm',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10067',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12062&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12062&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12062&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12062&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12062',
      key: 'MA',
      name: 'Marwan Abdellah (Viz)',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12062',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10070&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10070&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10070&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10070&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10070',
      key: 'MOPRO',
      name: 'Media Design',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10070',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14263',
      key: 'MEETCD',
      name: 'Meeting: Computing Division',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14263',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14168',
      key: 'MSPTI',
      name: 'membrane synthesis platform transfer and implementation',
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14168',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11560&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11560&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11560&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11560&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11560',
      key: 'CBGAS',
      name: 'Memory-Intensive Supercomputing',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11560',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10068&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10068&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10068&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10068&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10068',
      key: 'MSGEN',
      name: 'Mesh generation',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10068',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12761&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12761&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12761&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12761&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12761',
      key: 'SCIPLAST',
      name: 'Microcircuit plasticity',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12761',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13362&avatarId=12365',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13362&avatarId=12365',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13362&avatarId=12365',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13362&avatarId=12365',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13362',
      key: 'MINAPP',
      name: 'Mini-app',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13362',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14965&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14965&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14965&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14965&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14965',
      key: 'MMB2022',
      name: 'MMB-YR.1',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14965',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10075&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10075&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10075&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10075&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10075',
      key: 'MDMGT',
      name: 'Model management',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10075',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10960&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10960&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10960&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10960&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10960',
      key: 'MOLSYN',
      name: 'Molecular Synapse',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10960',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14567',
      key: 'MS',
      name: 'Molecular Systems',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14567',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14275',
      key: 'MORPH2PIX',
      name: 'Morph2Pix',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14275',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10163&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10163&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10163&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10163&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10163',
      key: 'SCIMORPH',
      name: 'Morphologies and synthesis',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10163',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10660&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10660&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10660&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10660&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10660',
      key: 'MPREC',
      name: 'Morphology Reconstruction',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10660',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10060&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10060&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10060&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10060&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10060',
      key: 'MPREP',
      name: 'Morphology repair',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10060',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10072&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10072&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10072&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10072&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10072',
      key: 'MPTRK',
      name: 'Morphology tracker',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10072',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10064&avatarId=10008',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10064&avatarId=10008',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10064&avatarId=10008',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10064&avatarId=10008',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10064',
      key: 'MUK',
      name: 'Morphology Utility Kit',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10064',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13661&avatarId=13571',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13661&avatarId=13571',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13661&avatarId=13571',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13661&avatarId=13571',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13661',
      key: 'BBPP60',
      name: 'Mouse Hippocampus',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13661',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13966',
      key: 'MOUSSCX',
      name: 'MouseSSCxSGA1',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13966',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11562&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11562&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11562&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11562&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11562',
      key: 'MGL',
      name: 'MultiLevel Graph Library (MGL)',
      projectCategory: {
        description: 'Lateral research projects (archived Jira project)',
        id: '10427',
        name: '[Archive] Research projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10427',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11562',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14163&avatarId=13466',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14163&avatarId=13466',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14163&avatarId=13466',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14163&avatarId=13466',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14163',
      key: 'NCX',
      name: 'Neocortex2018',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14163',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14183',
      key: 'NCMV2',
      name: 'Neocortical Cell Models v.2',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14183',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14564',
      key: 'NCMV3',
      name: 'Neocortical Cell Models v.3',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14564',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14363',
      key: 'NETPLAST',
      name: 'Network plasticity - PhD thesis of András Ecker',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14363',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11864&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11864&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11864&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11864&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11864',
      key: 'NMAY',
      name: 'NeuMaya',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11864',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10001&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10001&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10001&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10001&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10001',
      key: 'BBPBGLIB',
      name: 'Neurodamus',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10001',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14166',
      key: 'NISE',
      name: 'Neuroinformatics Software Engineering',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14166',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12164&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12164&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12164&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12164&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12164',
      key: 'NBA',
      name: 'Neuroinformatics: Brain Atlassing',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12164',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12163&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12163&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12163&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12163&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12163',
      key: 'NDA',
      name: 'Neuroinformatics: Data Analysis',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12163',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12161&avatarId=10760',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12161&avatarId=10760',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12161&avatarId=10760',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12161&avatarId=10760',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12161',
      key: 'NDI',
      name: 'Neuroinformatics: Data integration',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12161',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12162&avatarId=10001',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12162&avatarId=10001',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12162&avatarId=10001',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12162&avatarId=10001',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12162',
      key: 'NDM',
      name: 'Neuroinformatics: Data Platform',
      projectCategory: {
        description: 'Neuroinformatics and workflows tools',
        id: '10021',
        name: 'Neuroinformatics and workflows',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10021',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12162',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14175',
      key: 'NMV',
      name: 'NeuroMorphoVis',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14175',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10161&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10161&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10161&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10161&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10161',
      key: 'NRN',
      name: 'Neuron',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10161',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11361&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11361&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11361&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11361&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11361',
      key: 'NRNPT',
      name: 'Neuronpainter',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11361',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13665',
      key: 'NSETM',
      name: 'Neuroscientific Software Engineering',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13665',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14061',
      key: 'NGV',
      name: 'NGV',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14061',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14561',
      key: 'NGVDISS',
      name: 'NGV Dissemination',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14561',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13962',
      key: 'NOCMODL',
      name: 'nocmodl',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13962',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14565&avatarId=10769',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14565&avatarId=10769',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14565&avatarId=10769',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14565&avatarId=10769',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14565',
      key: 'ODC',
      name: 'OpenDeck Controller',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14565',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14062&avatarId=10760',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14062&avatarId=10760',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14062&avatarId=10760',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14062&avatarId=10760',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14062',
      key: 'OPENSOURCE',
      name: 'OpenSource License',
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14062',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10032&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10032&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10032&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10032&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10032',
      key: 'BBPOPTIFMK',
      name: 'Optimizer framework',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10032',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11160&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11160&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11160&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11160&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11160',
      key: 'OSGTR',
      name: 'OSG Transparency',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11160',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13363&avatarId=12362',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13363&avatarId=12362',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13363&avatarId=12362',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13363&avatarId=12362',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13363',
      key: 'PENG',
      name: 'Performance engineering',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13363',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13060&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13060&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13060&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13060&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13060',
      key: 'PHD2',
      name: 'PhD Cremonesi',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13060',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13061&avatarId=10765',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13061&avatarId=10765',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13061&avatarId=10765',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13061&avatarId=10765',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13061',
      key: 'PHD3',
      name: 'PhD Magalhaes',
      projectCategory: {
        description: '',
        id: '10429',
        name: '[Archive] No category',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10429',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13061',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14562',
      key: 'PIAC',
      name: 'PIACEM',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14562',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14165&avatarId=10763',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14165&avatarId=10763',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14165&avatarId=10763',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14165&avatarId=10763',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14165',
      key: 'PFO',
      name: 'Procurement & Facilities',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'service_desk',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14165',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14181&avatarId=12664',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14181&avatarId=12664',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14181&avatarId=12664',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14181&avatarId=12664',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14181',
      key: 'PMO',
      name: 'Project Management Office',
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14181',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11566&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11566&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11566&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11566&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11566',
      key: 'BBPP10',
      name: 'Project: proj10 (BBPP10)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11566',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11565&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11565&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11565&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11565&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11565',
      key: 'BBPP11',
      name: 'Project: proj11 (BBPP11)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11565',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11660&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11660&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11660&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11660&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11660',
      key: 'BBPP15',
      name: 'Project: proj15 (BBPP15)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11660',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12860&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12860&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12860&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12860&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12860',
      key: 'BBPP26',
      name: 'Project: proj26 (BBPP26)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12860',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12360&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12360&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12360&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12360&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12360',
      key: 'BBPP29',
      name: 'Project: proj29 (BBPP29)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12360',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12361&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12361&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12361&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12361&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12361',
      key: 'BBPP30',
      name: 'Project: proj30 (BBPP30)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12361',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12962&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12962&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12962&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12962&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12962',
      key: 'BBPP32',
      name: 'Project: proj32 (BBPP32)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12962',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12677&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12677&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12677&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12677&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12677',
      key: 'BBPP34',
      name: 'Project: proj34 (BBPP34)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12677',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12560&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12560&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12560&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12560&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12560',
      key: 'BBPP35',
      name: 'Project: proj35 (BBPP35)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12560',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12676&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12676&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12676&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12676&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12676',
      key: 'BBPP36',
      name: 'Project: proj36 (BBPP36)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12676',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12673&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12673&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12673&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12673&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12673',
      key: 'BBPP37',
      name: 'Project: proj37 (BBPP37)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12673',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12674&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12674&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12674&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12674&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12674',
      key: 'BBPP38',
      name: 'Project: proj38 (BBPP38)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12674',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12675&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12675&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12675&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12675&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12675',
      key: 'BBPP39',
      name: 'Project: proj39 (BBPP39)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12675',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12864&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12864&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12864&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12864&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12864',
      key: 'BBPP40',
      name: 'Project: proj40 (BBPP40)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12864',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12862&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12862&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12862&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12862&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12862',
      key: 'BBPP41',
      name: 'Project: proj41 (BBPP41)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12862',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12961&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12961&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12961&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12961&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12961',
      key: 'BBPP45',
      name: 'Project: proj45 (BBPP45)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12961',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13062&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13062&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13062&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13062&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13062',
      key: 'BBPP46',
      name: 'Project: proj46 (BBPP46)',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13062',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13163&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13163&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13163&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13163&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13163',
      key: 'BBPP47',
      name: 'Project: proj47 (BBPP47)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13163',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13164&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13164&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13164&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13164&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13164',
      key: 'BBPP48',
      name: 'Project: proj48 (BBPP48)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13164',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13165&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13165&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13165&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13165&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13165',
      key: 'BBPP49',
      name: 'Project: proj49 (BBPP49)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13165',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13961',
      key: 'BBPP55',
      name: 'Project: proj55 (BBPP55)',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13961',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13360&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13360&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13360&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13360&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13360',
      key: 'BBPP56',
      name: 'Project: proj56 (BBPP56)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13360',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13361&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13361&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13361&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13361&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13361',
      key: 'BBPP57',
      name: 'Project: proj57 (BBPP57)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13361',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11564&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11564&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11564&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11564&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11564',
      key: 'BBPP6',
      name: 'Project: proj6 (BBPP6)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11564',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13762',
      key: 'BBPP64',
      name: 'Project: proj64 (BBPP64)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13762',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13963',
      key: 'BBPP65',
      name: 'Project: proj65 (BBPP65)',
      projectCategory: {
        description: 'External projects (archived Jira project)',
        id: '10426',
        name: '[Archive] Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10426',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13963',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14164',
      key: 'BBPP68',
      name: 'Project: proj68 (BBPP68)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14164',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12260&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12260&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12260&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12260&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12260',
      key: 'BBPP9',
      name: 'Project: proj9 (BBPP9)',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12260',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14174',
      key: 'PUBLISH',
      name: 'Publications',
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14174',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10860&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10860&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10860&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10860&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10860',
      key: 'PNMAT',
      name: 'Python Neuronal Morphology Analysis Toolkit',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10860',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12865&avatarId=13570',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12865&avatarId=13570',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12865&avatarId=13570',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12865&avatarId=13570',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12865',
      key: 'BBPP42',
      name: 'Rat Hippocampus',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12865',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11060&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11060&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11060&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11060&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11060',
      key: 'RENCCSUPP',
      name: 'ReNCC Supplementary Site',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11060',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11260&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11260&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11260&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11260&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11260',
      key: 'REP',
      name: 'ReportingLib',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11260',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10861&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10861&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10861&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10861&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10861',
      key: 'RSHST',
      name: 'Research Stream - Martin',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10861',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15361',
      key: 'BBPP132',
      name: 'Roadmap2021-2024',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15361',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10030&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10030&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10030&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10030&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10030',
      key: 'BBPRTN',
      name: 'RTNeuron',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10030',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=13166&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=13166&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=13166&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=13166&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13166',
      key: 'HBPSTC',
      name: 'Science and Technology Coordination',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13166',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14273&avatarId=12666',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14273&avatarId=12666',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14273&avatarId=12666',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14273&avatarId=12666',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14273',
      key: 'SCIFIG',
      name: 'Scientific Figures',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14273',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14575',
      key: 'SGA3',
      name: 'SGA3- Collaboration',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14575',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14177',
      key: 'SIM',
      name: 'Simwriter',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14177',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15160',
      key: 'SCEM',
      name: 'Single Cell Model Building Pipeline',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15160',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10076&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10076&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10076&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10076&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10076',
      key: 'SPIND',
      name: 'Spatial indexer',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10076',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '13764',
      key: 'SSCX',
      name: 'SSCX',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/13764',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14270',
      key: 'SSCXDIS',
      name: 'SSCx Dissemination',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14270',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14267',
      key: 'STORGEN',
      name: 'Storage Geneva',
      projectCategory: {
        description: 'External projects',
        id: '10320',
        name: 'Projects',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10320',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14267',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10166&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10166&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10166&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10166&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10166',
      key: 'SCISYN',
      name: 'Synapse models',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10166',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14364',
      key: 'SCMSNC',
      name: 'Synaptic consolidation and memory storage in the neocortex',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14364',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12460&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12460&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12460&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12460&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12460',
      key: 'ALGSYN',
      name: 'Synthesizer',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12460',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14269',
      key: 'TEMPLATE',
      name: 'Template Project',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14269',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15360',
      key: 'BB111',
      name: 'Test BBP Project',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15360',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15260',
      key: 'TP',
      name: 'Test Project',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15260',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14268',
      key: 'BBPP82',
      name: 'Thalamo-NeoCortex',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14268',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14161&avatarId=13464',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14161&avatarId=13464',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14161&avatarId=13464',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14161&avatarId=13464',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14161',
      key: 'THAL2018',
      name: 'Thalamus2018',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14161',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14179',
      key: 'THAL2019',
      name: 'Thalamus2019',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14179',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=14569&avatarId=12667',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=14569&avatarId=12667',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=14569&avatarId=12667',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=14569&avatarId=12667',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14569',
      key: 'TIDEJS',
      name: 'Tide.js',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14569',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14460',
      key: 'TASSCX',
      name: 'Topological analysis of the rat somatosensory cortex model',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14460',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '15364',
      key: 'BBPP102',
      name: 'Topological analysis of the rat somatosensory cortex model-test',
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/15364',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10078&avatarId=10769',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10078&avatarId=10769',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10078&avatarId=10769',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10078&avatarId=10769',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10078',
      key: 'BLDTC',
      name: 'Touch Detector',
      projectCategory: {
        description: 'Building and simulation tools',
        id: '10022',
        name: 'Building and simulation',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10022',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10078',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14861',
      key: 'TRAINING',
      name: 'Training Requests',
      projectCategory: {
        description: 'Issues arising within a particular area of the project',
        id: '10010',
        name: 'General',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10010',
      },
      projectTypeKey: 'business',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14861',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=12063&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=12063&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=12063&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=12063&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '12063',
      key: 'SCIVALID',
      name: 'Validation',
      projectCategory: {
        description:
          'Scientific issues related to correctness of the model/validation and data integration',
        id: '10120',
        name: 'Model refinement',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10120',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/12063',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
      },
      expand: 'description,lead,url,projectKeys',
      id: '14961',
      key: 'VEEONE',
      name: 'VeeOne',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14961',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11866&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11866&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11866&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11866&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11866',
      key: 'VIZTM',
      name: 'Visualization Team',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11866',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11061&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11061&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11061&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11061&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11061',
      key: 'VZJAM',
      name: 'Vizjam',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11061',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11960&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11960&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11960&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11960&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11960',
      key: 'VIZSH',
      name: 'VIZSH',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11960',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=10460&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=10460&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=10460&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=10460&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '10460',
      key: 'VOLTS',
      name: 'Volume tools',
      projectCategory: {
        description: 'Visualization and analysis tools (archived Jira project)',
        id: '10428',
        name: '[Archive] Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10428',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/10460',
    },
    {
      archived: false,
      avatarUrls: {
        '16x16':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&pid=11860&avatarId=10011',
        '24x24':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&pid=11860&avatarId=10011',
        '32x32':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&pid=11860&avatarId=10011',
        '48x48':
          'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?pid=11860&avatarId=10011',
      },
      expand: 'description,lead,url,projectKeys',
      id: '11860',
      key: 'WBRAYNS',
      name: 'Web Brayns',
      projectCategory: {
        description: 'Visualization and analysis tools',
        id: '10020',
        name: 'Visualization and analysis',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/projectCategory/10020',
      },
      projectTypeKey: 'software',
      self:
        'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/11860',
    },
  ];

  const mockJiraSearchResponse = {
    expand: 'names,schema',
    issues: [
      {
        expand:
          'operations,versionedRepresentations,editmeta,changelog,renderedFields',
        fields: {
          aggregateprogress: { progress: 0, total: 0 },
          components: [],
          created: '2022-06-24T14:57:27.000+0200',
          creator: {
            active: true,
            avatarUrls: {
              '16x16':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
              '24x24':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=small&avatarId=10082',
              '32x32':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=medium&avatarId=10082',
              '48x48':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?avatarId=10082',
            },
            displayName: 'Nicholas Stephen Wells',
            emailAddress: 'nicholas.wells@epfl.ch',
            key: 'JIRAUSER15008',
            name: 'wells',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/user?username=wells',
            timeZone: 'Europe/Zurich',
          },
          customfield_10210: {
            disabled: false,
            id: '10102',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/customFieldOption/10102',
            value: 'Low',
          },
          customfield_10211: {
            disabled: false,
            id: '10117',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/customFieldOption/10117',
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
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/customFieldOption/11431',
            value: 'No',
          },
          customfield_13517:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
          customfield_13518:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
          fixVersions: [],
          issuelinks: [],
          issuetype: {
            avatarId: 11478,
            description: 'A task that needs to be done.',
            iconUrl:
              'https://bbpteam.epfl.ch/project/devissues/secure/viewavatar?size=xsmall&avatarId=11478&avatarType=issuetype',
            id: '3',
            name: 'Task',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issuetype/3',
            subtask: false,
          },
          labels: ['discussion'],
          lastViewed: '2022-06-24T14:57:33.706+0200',
          priority: {
            iconUrl:
              'https://bbpteam.epfl.ch/project/devissues/images/icons/priorities/minor.svg',
            id: '10002',
            name: 'Low',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/priority/10002',
          },
          progress: { progress: 0, total: 0 },
          project: {
            avatarUrls: {
              '16x16':
                'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
              '24x24':
                'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
              '32x32':
                'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
              '48x48':
                'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
            },
            id: '14566',
            key: 'NEXUS',
            name: 'Blue Brain Nexus',
            projectTypeKey: 'software',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14566',
          },
          reporter: {
            active: true,
            avatarUrls: {
              '16x16':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
              '24x24':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=small&avatarId=10082',
              '32x32':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=medium&avatarId=10082',
              '48x48':
                'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?avatarId=10082',
            },
            displayName: 'Nicholas Stephen Wells',
            emailAddress: 'nicholas.wells@epfl.ch',
            key: 'JIRAUSER15008',
            name: 'wells',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/user?username=wells',
            timeZone: 'Europe/Zurich',
          },
          status: {
            description: '',
            iconUrl:
              'https://bbpteam.epfl.ch/project/devissues/images/icons/statuses/open.png',
            id: '10109',
            name: 'To Do',
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/status/10109',
            statusCategory: {
              colorName: 'blue-gray',
              id: 2,
              key: 'new',
              name: 'To Do',
              self:
                'https://bbpteam.epfl.ch/project/devissues/rest/api/2/statuscategory/2',
            },
          },
          subtasks: [],
          summary: 'test1',
          updated: '2022-06-24T14:57:27.000+0200',
          versions: [],
          votes: {
            hasVoted: false,
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issue/NEXUS-57/votes',
            votes: 0,
          },
          watches: {
            isWatching: true,
            self:
              'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issue/NEXUS-57/watchers',
            watchCount: 1,
          },
          workratio: -1,
        },
        id: '80811',
        key: 'NEXUS-57',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issue/80811',
      },
    ],
    maxResults: 50,
    startAt: 0,
    total: 1,
  };

  const mockJiraIssueResponse = {
    expand:
      'renderedFields,names,schema,operations,editmeta,changelog,versionedRepresentations',
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
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
          '24x24':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=small&avatarId=10082',
          '32x32':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=medium&avatarId=10082',
          '48x48':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?avatarId=10082',
        },
        displayName: 'Nicholas Stephen Wells',
        emailAddress: 'nicholas.wells@epfl.ch',
        key: 'JIRAUSER15008',
        name: 'wells',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/user?username=wells',
        timeZone: 'Europe/Zurich',
      },
      customfield_10210: {
        disabled: false,
        id: '10102',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/customFieldOption/10102',
        value: 'Low',
      },
      customfield_10211: {
        disabled: false,
        id: '10117',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/customFieldOption/10117',
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
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/customFieldOption/11431',
        value: 'No',
      },
      customfield_13517:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisA',
      customfield_13518:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
      fixVersions: [],
      issuelinks: [],
      issuetype: {
        avatarId: 11478,
        description: 'A task that needs to be done.',
        iconUrl:
          'https://bbpteam.epfl.ch/project/devissues/secure/viewavatar?size=xsmall&avatarId=11478&avatarType=issuetype',
        id: '3',
        name: 'Task',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issuetype/3',
        subtask: false,
      },
      labels: ['discussion'],
      lastViewed: '2022-06-24T14:57:33.706+0200',
      priority: {
        iconUrl:
          'https://bbpteam.epfl.ch/project/devissues/images/icons/priorities/minor.svg',
        id: '10002',
        name: 'Low',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/priority/10002',
      },
      progress: { progress: 0, total: 0 },
      project: {
        avatarUrls: {
          '16x16':
            'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=xsmall&avatarId=12663',
          '24x24':
            'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=small&avatarId=12663',
          '32x32':
            'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?size=medium&avatarId=12663',
          '48x48':
            'https://bbpteam.epfl.ch/project/devissues/secure/projectavatar?avatarId=12663',
        },
        id: '14566',
        key: 'NEXUS',
        name: 'Blue Brain Nexus',
        projectTypeKey: 'software',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/project/14566',
      },
      reporter: {
        active: true,
        avatarUrls: {
          '16x16':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=xsmall&avatarId=10082',
          '24x24':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=small&avatarId=10082',
          '32x32':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?size=medium&avatarId=10082',
          '48x48':
            'https://bbpteam.epfl.ch/project/devissues/secure/useravatar?avatarId=10082',
        },
        displayName: 'Nicholas Stephen Wells',
        emailAddress: 'nicholas.wells@epfl.ch',
        key: 'JIRAUSER15008',
        name: 'wells',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/user?username=wells',
        timeZone: 'Europe/Zurich',
      },
      status: {
        description: '',
        iconUrl:
          'https://bbpteam.epfl.ch/project/devissues/images/icons/statuses/open.png',
        id: '10109',
        name: 'To Do',
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/status/10109',
        statusCategory: {
          colorName: 'blue-gray',
          id: 2,
          key: 'new',
          name: 'To Do',
          self:
            'https://bbpteam.epfl.ch/project/devissues/rest/api/2/statuscategory/2',
        },
      },
      subtasks: [],
      summary: 'test1',
      timetracking: {},
      updated: '2022-06-24T14:57:27.962+0200',
      versions: [],
      votes: {
        hasVoted: false,
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issue/NEXUS-57/votes',
        votes: 0,
      },
      watches: {
        isWatching: true,
        self:
          'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issue/NEXUS-57/watchers',
        watchCount: 1,
      },
      worklog: { maxResults: 20, startAt: 0, total: 0, worklogs: [] },
      workratio: -1,
    },
    id: '80811',
    key: 'NEXUS-57',
    self: 'https://bbpteam.epfl.ch/project/devissues/rest/api/2/issue/80811',
  };

  it('displays table containing a row with the linked jira issue and a link to it', async () => {
    server.use(
      rest.get(
        'https://localhost:3000/projects/orgLabel/projectLabel',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponseProjects)
          );
        }
      ),
      rest.get('https://localhost:3000/jira/project', (req, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockJiraProjectResponse)
        );
      }),
      rest.post('https://localhost:3000/jira/search', (req, res, ctx) => {
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockJiraSearchResponse)
        );
      }),
      rest.get(
        'https://localhost:3000/jira/issue/NEXUS-57',
        (req, res, ctx) => {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockJiraIssueResponse)
          );
        }
      )
    );

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
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
                    fetch={fetch}
                  ></JIRAPluginContainer>
                </NexusProvider>
              </QueryClientProvider>
            </NotificationContext.Provider>
          </Provider>
        </Router>
      );
    };

    await act(async () => {
      await render(<App />);
    });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      const jiraIssueLink = screen.getByRole('link', {
        name: 'test1',
      });
      expect(jiraIssueLink).toHaveAttribute(
        'href',
        'https://bbpteam.epfl.ch/project/devissues/browse/NEXUS-57'
      );
    });
  });
});
