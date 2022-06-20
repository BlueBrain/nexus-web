import * as React from 'react';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient, Resource } from '@bbp/nexus-sdk';
import VideoPluginContainer from '../VideoPluginContainer/VideoPluginContainer';
import { QueryClient, QueryClientProvider } from 'react-query';
import fetch from 'node-fetch';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  server,
} from '../../../utils/testUtil';
import { rest } from 'msw';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
describe('VideoPluginContainer', () => {
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

  it('renders with well formatted data', async () => {
    const resource = ({
      '@context': [
        'https://bbp.neuroshapes.org',
        'https://bluebrain.github.io/nexus/contexts/resource.json',
      ],
      '@id': 'videoresourceId',
      '@type': [
        'Entity',
        'InVitroSliceReconstructedPatchedNeuron',
        'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
        'ReconstructedPatchedCell',
        'ReconstructedCell',
        'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
        'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
        'Dataset',
      ],
      video: [
        {
          name: 'video',
          embedUrl: 'https://youtu.be/d4gSor3KyIw',
        },
        {
          name: 'cool brain video',

          embedUrl: 'https://www.example.com/embed/123',
        },
      ],
      distribution: [
        {
          '@type': 'DataDownload',
          contentSize: {
            unitCode: 'bytes',
            value: 245427,
          },
          contentUrl:
            'https://bbp.epfl.ch/neurosciencegraph/data/a91043da-0527-4414-b7e8-3484d426c11f',
          digest: {
            algorithm: 'SHA-256',
            value:
              '02c666b5ba8ba806470f77f52b5b6b105662bc63f8b3f2da9a560af0bbc6fc07',
          },
          encodingFormat: 'application/swc',
          name: 'file',
        },
        {
          '@type': 'DataDownload',
          contentUrl: 'http://microcircuits.epfl.ch/#/article/article_3_mph',
          repository: {
            '@id': 'http://microcircuits.epfl.ch/#/article/article_3_mph',
          },
        },
      ],
    } as unknown) as Resource;
    server.use(
      rest.get(
        'https://localhost:3000/resources/org/project/_/videoresourceId',
        (req, res, ctx) => {
          const mockResponse = {
            '@context': [
              'https://bbp.neuroshapes.org',
              'https://bluebrain.github.io/nexus/contexts/resource.json',
            ],
            '@id': 'video_resource_id',
            '@type': [
              'Entity',
              'InVitroSliceReconstructedPatchedNeuron',
              'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
              'ReconstructedPatchedCell',
              'ReconstructedCell',
              'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
              'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
              'Dataset',
            ],
            video: [
              {
                name: 'video',
                embedUrl: 'https://youtu.be/d4gSor3KyIw',
              },
              {
                name: 'cool brain video',
                embedUrl: 'https://www.example.com/embed/123',
              },
            ],
            distribution: [
              {
                '@type': 'DataDownload',
                contentSize: {
                  unitCode: 'bytes',
                  value: 245427,
                },
                contentUrl:
                  'https://bbp.epfl.ch/neurosciencegraph/data/a91043da-0527-4414-b7e8-3484d426c11f',
                digest: {
                  algorithm: 'SHA-256',
                  value:
                    '02c666b5ba8ba806470f77f52b5b6b105662bc63f8b3f2da9a560af0bbc6fc07',
                },
                encodingFormat: 'application/swc',
                name: 'file',
              },
              {
                '@type': 'DataDownload',
                contentUrl:
                  'http://microcircuits.epfl.ch/#/article/article_3_mph',
                repository: {
                  '@id': 'http://microcircuits.epfl.ch/#/article/article_3_mph',
                },
              },
            ],
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );
    await act(async () => {
      const { container } = await render(
        <NexusProvider nexusClient={nexus}>
          <VideoPluginContainer
            resource={resource}
            orgLabel="org"
            projectLabel="project"
            collapsed={false}
            handleCollapseChanged={jest.fn}
          ></VideoPluginContainer>
        </NexusProvider>
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('fails to render when json does not match schema', async () => {
    const resource = ({
      '@context': [
        'https://bbp.neuroshapes.org',
        'https://bluebrain.github.io/nexus/contexts/resource.json',
      ],
      '@id': 'videoresourceId',
      '@type': [
        'Entity',
        'InVitroSliceReconstructedPatchedNeuron',
        'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
        'ReconstructedPatchedCell',
        'ReconstructedCell',
        'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
        'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
        'Dataset',
      ],
      video: [
        {
          name: 'video',
          embedurl: ['yyy'],
        },
        {
          name: 'cool brain video',
          embedurl: ['yyy'],
        },
      ],
    } as unknown) as Resource;
    server.use(
      rest.get(
        'https://localhost:3000/resources/org/project/_/videoresourceId',
        (req, res, ctx) => {
          const mockResponse = {
            '@context': [
              'https://bbp.neuroshapes.org',
              'https://bluebrain.github.io/nexus/contexts/resource.json',
            ],
            '@id': 'video_resource_id',
            '@type': ['Entity'],
            video: [
              {
                name: 'video',
                embedurl: ['yyy'],
              },
              {
                name: 'cool brain video',
                embedurl: ['yyy'],
              },
            ],
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );
    await act(async () => {
      const { container } = await render(
        <NexusProvider nexusClient={nexus}>
          <VideoPluginContainer
            resource={resource}
            orgLabel="org"
            projectLabel="project"
            collapsed={false}
            handleCollapseChanged={jest.fn}
          ></VideoPluginContainer>
        </NexusProvider>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
