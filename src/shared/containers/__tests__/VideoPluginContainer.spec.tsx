import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient, Resource } from '@bbp/nexus-sdk';
import VideoPluginContainer from '../VideoPluginContainer/VideoPluginContainer';
import fetch from 'node-fetch';
import { render, server, screen, fireEvent } from '../../../utils/testUtil';
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

  // react-player component used by VideoPluginContainer calls window.fetch so specify the node one
  // @ts-ignore
  window.fetch = fetch;

  const resource = ({
    '@context': [
      'https://bbp.neuroshapes.org',
      'https://bluebrain.github.io/nexus/contexts/resource.json',
    ],
    '@id': 'videoresourceId',
    '@type': ['Entity'],
    video: [
      {
        name: 'video',
        embedUrl: 'https://youtu.be/d4gSor3KyIw',
      },
      {
        name: 'cool brain video',
        uploadDate: '2020-07-10 15:00:00.000',
        embedUrl: 'https://www.example.com/embed/123',
      },
    ],
  } as unknown) as Resource;
  server.use(
    rest.get(
      'https://localhost:3000/resources/org/project/_/videoresourceId',
      (req, res, ctx) => {
        const mockResponse = resource;

        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      }
    )
  );
  it('renders with well formatted data', async () => {
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

  it('When clicked fires collapse event handler', async () => {
    const collapseHandler = jest.fn();
    await act(async () => {
      const { container } = await render(
        <NexusProvider nexusClient={nexus}>
          <VideoPluginContainer
            resource={resource}
            orgLabel="org"
            projectLabel="project"
            collapsed={false}
            handleCollapseChanged={collapseHandler}
          ></VideoPluginContainer>
        </NexusProvider>
      );
      const panel = await screen.getByRole('button');
      expect(panel).toBeVisible();
      fireEvent.click(panel);
      expect(collapseHandler).toHaveBeenCalled();
    });
  });
});
