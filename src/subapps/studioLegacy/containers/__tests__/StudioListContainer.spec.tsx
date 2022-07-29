import * as React from 'react';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import StudioListContainer from '../StudioListContainer';
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
import { deltaPath } from '__mocks__/handlers/handlers';
describe('StudioListContainer', () => {
  // establish API mocking before all tests
  beforeAll(() => server.listen());
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());
  const nexus = createNexusClient({
    fetch,
    uri: deltaPath(),
  });
  const queryClient = new QueryClient();

  it('renders studios in a list', async () => {
    await act(async () => {
      await render(
        <NexusProvider nexusClient={nexus}>
          <QueryClientProvider client={queryClient}>
            <StudioListContainer
              orgLabel="org"
              projectLabel="project"
            ></StudioListContainer>
          </QueryClientProvider>
        </NexusProvider>
      );
    });
    await waitFor(() => screen.findAllByRole('listitem'));
    const studioItems = await screen.findAllByRole('listitem');
    expect(studioItems[0]).toHaveTextContent('label for id-1');
    expect(studioItems[1]).toHaveTextContent('label for id-2');
  });

  it('renders empty componenet with error message when server returns an error', async () => {
    server.use(
      // override the initial "GET /greeting" request handler
      // to return a 500 Server Error
      rest.get(deltaPath('/resources/org/project'), (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    await act(async () => {
      await render(
        <NexusProvider nexusClient={nexus}>
          <QueryClientProvider client={queryClient}>
            <StudioListContainer
              orgLabel="org"
              projectLabel="project"
            ></StudioListContainer>
          </QueryClientProvider>
        </NexusProvider>
      );
    });
    await waitFor(() => screen.getAllByText('Sorry, something went wrong'));
    const errorMessage = await screen.getAllByText(
      'Sorry, something went wrong'
    );
    expect(errorMessage.length).toBe(1);
  });

  it('allows pagination of studio list on scroll', async () => {
    server.use(
      rest.get(deltaPath('/resources/org/project'), (req, res, ctx) => {
        const after = req.url.searchParams.get('after');
        if (after) {
          const mockResponse = {
            '@context': [
              'https://bluebrain.github.io/nexus/contexts/metadata.json',
              'https://bluebrain.github.io/nexus/contexts/search.json',
              'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
            ],
            _total: 11,
            _results: [
              {
                '@id': 'id-11',
                label: 'test-label-11',
              },
            ],
            _next: deltaPath('/resources/org/project?after=id-10'),
          };
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
        const mockResponse = {
          '@context': [
            'https://bluebrain.github.io/nexus/contexts/metadata.json',
            'https://bluebrain.github.io/nexus/contexts/search.json',
            'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
          ],
          _total: 19,
          _results: [
            {
              '@id': 'id-1',
              label: 'test-label-1',
            },
            {
              '@id': 'id-2',
              label: 'test-label-2',
            },
            {
              '@id': 'id-3',
              label: 'test-label-3',
            },
            {
              '@id': 'id-4',
              label: 'test-label-4',
            },
            {
              '@id': 'id-5',
              label: 'test-label-5',
            },
            {
              '@id': 'id-6',
              label: 'test-label-6',
            },
            {
              '@id': 'id-7',
              label: 'test-label-7',
            },
            {
              '@id': 'id-8',
              label: 'test-label-8',
            },
            {
              '@id': 'id-9',
              label: 'test-label-9',
            },
            {
              '@id': 'id-10',
              label: 'test-label-10',
            },
          ],
          _next: deltaPath('/resources/org/project?after=id-10'),
        };
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      })
    );
    await act(async () => {
      const { container } = await render(
        <NexusProvider nexusClient={nexus}>
          <QueryClientProvider client={queryClient}>
            <StudioListContainer
              orgLabel="org"
              projectLabel="project"
            ></StudioListContainer>
          </QueryClientProvider>
        </NexusProvider>
      );

      const infiniteScroll = screen.getByTestId('infinite-search').firstChild
        ?.nextSibling?.firstChild;
      if (infiniteScroll) {
        await fireEvent.scroll(infiniteScroll);
      }
    });

    await waitFor(async () => {
      const studioItems = await screen.findAllByRole('listitem');
      expect(studioItems.length).toBe(10);
    });
  });

  it('allows  searching on studio list', async () => {
    server.use(
      rest.get(deltaPath('/resources/org/project'), (req, res, ctx) => {
        const q = req.url.searchParams.getAll('q');
        if (q[0] === 'label for id-1') {
          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json({
              '@context': [
                'https://bluebrain.github.io/nexus/contexts/metadata.json',
                'https://bluebrain.github.io/nexus/contexts/search.json',
                'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
              ],
              _total: 1,
              _results: [
                {
                  '@id': 'id-1',
                  label: 'test-label-1',
                },
              ],
            })
          );
        }
        const mockResponse = {
          '@context': [
            'https://bluebrain.github.io/nexus/contexts/metadata.json',
            'https://bluebrain.github.io/nexus/contexts/search.json',
            'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
          ],
          _total: 19,
          _results: [
            {
              '@id': 'id-1',
              label: 'test-label-1',
            },
            {
              '@id': 'id-2',
              label: 'test-label-2',
            },
            {
              '@id': 'id-3',
              label: 'test-label-3',
            },
            {
              '@id': 'id-4',
              label: 'test-label-4',
            },
            {
              '@id': 'id-5',
              label: 'test-label-5',
            },
            {
              '@id': 'id-6',
              label: 'test-label-6',
            },
            {
              '@id': 'id-7',
              label: 'test-label-7',
            },
            {
              '@id': 'id-8',
              label: 'test-label-8',
            },
            {
              '@id': 'id-9',
              label: 'test-label-9',
            },
            {
              '@id': 'id-10',
              label: 'test-label-10',
            },
          ],
          _next: deltaPath('/resources/org/project?after=id10'),
        };
        return res(
          // Respond with a 200 status code
          ctx.status(200),
          ctx.json(mockResponse)
        );
      })
    );
    await act(async () => {
      await render(
        <NexusProvider nexusClient={nexus}>
          <QueryClientProvider client={queryClient}>
            <StudioListContainer
              orgLabel="org"
              projectLabel="project"
            ></StudioListContainer>
          </QueryClientProvider>
        </NexusProvider>
      );
    });
    await waitFor(() => screen.findByRole('textbox'));
    const search = await screen.findByRole('textbox');
    await act(async () => {
      await fireEvent.change(search, { target: { value: 'label for id-1' } });
      await waitFor(() => {
        const items = screen.getAllByText('label for id-1');
        expect(items[0]).toBeVisible();
      });
    });
    await act(async () => {
      await waitFor(async () => {
        const studioItems = await screen.findAllByRole('listitem');
        expect(studioItems.length).toBe(1);
      });
    });
  });
});
