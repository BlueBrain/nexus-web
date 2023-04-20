import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks';
import fetch from 'node-fetch';
import { act } from 'react-dom/test-utils';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import {
    render,
    fireEvent,
    waitFor,
    screen,
    server,
} from '../../utils/testUtil';
import configureStore from '../../shared/store';
import OrganizationListPage, { useInfiniteOrganizationQuery } from './OrganizationListPage';

describe('OrganizationListPage', () => {
    const history = createBrowserHistory({ basename: '/' });

    // establish API mocking before all tests
    beforeAll(() => {
        server.listen();
    });
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
    const store = configureStore(history, { nexus }, {});
    xit('renders organization projects in a list', async () => {
        await act(async () => {
            await render(
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <NexusProvider nexusClient={nexus}>
                            <QueryClientProvider client={queryClient}>
                                <OrganizationListPage />
                            </QueryClientProvider>
                        </NexusProvider>
                    </ConnectedRouter>
                </Provider>
            );
        });

        await waitFor(async () => {
            const organizations = await screen.getAllByRole('routeitem-org');
            expect(organizations.length).toBe(3);
            const pageTitleExtra = await screen.findAllByText('Total of 3 Projects')
            expect(pageTitleExtra).toBeInTheDocument();
        });
    });
    it('Test inifinite fetching of organisation list', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          );
          
          const { result, waitFor } = renderHook(() => useInfiniteOrganizationQuery({
            nexus, query: "", sort: "",
          }), { wrapper });
          
          await waitFor(() => result.current.status === 'success');
          expect(result.current.data).toBeTruthy();
          // @ts-ignore
          expect(result.current.data?.pages?.[0]._total).toEqual(3);

    });
    
    // it('check if search (orgs) functionality is working', async () => {
    //     await act(async () => {
    //         await render(
    //             <Provider store={store}>
    //                 <ConnectedRouter history={history}>
    //                     <NexusProvider nexusClient={nexus}>
    //                         <QueryClientProvider client={queryClient}>
    //                             <OrganizationListPage />
    //                         </QueryClientProvider>
    //                     </NexusProvider>
    //                 </ConnectedRouter>
    //             </Provider>
    //         );
    //     });

    //     const search = screen.getByRole('search');
    //     await fireEvent.change(search, { target: { value: 'test1' } });
    //     await waitFor(async () => {
    //         const organizations = await screen.getAllByRole('routeitem-org');
    //         expect(organizations.length).toBe(1);
    //     });
    // });
});
