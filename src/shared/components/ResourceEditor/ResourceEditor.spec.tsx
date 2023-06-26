import '@testing-library/jest-dom';
import { createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import { createMemoryHistory } from 'history';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { RenderResult, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { cleanup, render, screen, waitFor } from '../../../utils/testUtil';
import {
    resource
} from '__mocks__/handlers/ResourceEditor/handlers';
import { deltaPath } from '__mocks__/handlers/handlers';
import configureStore from '../../store';
import ResourceEditor from './';


describe('AdvancedModeToggle', () => {
    const queryClient = new QueryClient();
    let resourceEditor: JSX.Element;
    let container: HTMLElement;
    let rerender: (ui: React.ReactElement) => void;
    let user: UserEvent;
    let server: ReturnType<typeof setupServer>;
    let component: RenderResult;

    beforeAll(() => {
        server = setupServer(
        );
        server.listen();
    });

    beforeEach(async () => {
        const history = createMemoryHistory({});

        const nexus = createNexusClient({
            fetch,
            uri: deltaPath(),
        });
        const store = configureStore(history, { nexus }, {});
        resourceEditor = (
            <Provider store={store}>
                <Router history={history}>
                    <QueryClientProvider client={queryClient}>
                        <NexusProvider nexusClient={nexus}>
                            {/* <ResourceEditor
                                key={(resource as Resource)._self}
                                busy={busy}
                                rawData={resource}
                                onSubmit={onSubmit}
                                onFormatChange={handleFormatChange}
                                onMetadataChange={handleMetaDataChange}
                                editable={editable && !expanded && !showMetadata}
                                expanded={expanded}
                                showMetadata={showMetadata}
                                showMetadataToggle={showMetadataToggle}
                                orgLabel={orgLabel}
                                projectLabel={projectLabel}
                                showFullScreen={showFullScreen}
                                onFullScreen={handleFullScreen}
                                showExpanded={showExpanded}
                                showControlPanel={showControlPanel}
                            /> */}
                        </NexusProvider>
                    </QueryClientProvider>
                </Router>
            </Provider>
        );

        component = render(resourceEditor);
        container = component.container;
        rerender = component.rerender;
        user = userEvent.setup();
    });

});