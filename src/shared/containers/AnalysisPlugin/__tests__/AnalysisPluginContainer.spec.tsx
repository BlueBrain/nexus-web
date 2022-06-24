import { NexusProvider } from '@bbp/react-nexus'
import { createNexusClient, Resource } from '@bbp/nexus-sdk'
import * as React from 'react'
import fetch from 'node-fetch'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import AnalysisPluginContainer from '../AnalysisPluginContainer'
import {
  render,
  server,
  fireEvent,
  waitFor,
  screen,
} from '../../../../utils/testUtil'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

describe('Analysis Plugin', () => {
  // establish API mocking before all tests
  beforeAll(() => server.listen())
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers())
  // clean up once the tests are done
  afterAll(() => server.close())

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  })
  const mockState = {
    config: {
      apiEndpoint: 'https://localhost:3000',
      analysisPluginSparqlDataQuery: 'detailedCircuit',
    },
  }
  const queryClient = new QueryClient()
  const mockStore = configureStore()
  jest.mock('react-redux', () => {
    const ActualReactRedux = jest.requireActual('react-redux')
    return {
      ...ActualReactRedux,
      useSelector: jest.fn().mockImplementation(() => {
        return mockState
      }),
    }
  })

  it('renders with  prop values', async () => {
    const store = mockStore(mockState)
    await act(async () => {
      const { container } = await render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel='projectLabel'
                orgLabel='orgLabel'
                resourceId='resourceId'
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
