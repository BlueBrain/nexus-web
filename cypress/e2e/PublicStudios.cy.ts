import * as _ from 'lodash';

describe('Public Studios', () => {
  const MaxRowsPerPage = 50;

  const sparqlEndpoint = (name: string) =>
    `https://bbp.epfl.ch/nexus/v1/views/public/${name}/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultSparqlIndex/sparql`;

  const RowSelector = 'tr.data-table-row';
  const PaginationButtonsSelector = 'li.ant-pagination-item';
  const WorkspaceItemsSelector =
    '.workspace-list-container li.ant-menu-submenu-horizontal:not(.ant-menu-submenu-disabled)';

  it('visiting public studios loads default dashboard', () => {
    PUBLIC_STUDIOS.forEach(publicStudio => {
      cy.intercept('POST', sparqlEndpoint(publicStudio.id)).as(
        'studioQueryResult'
      );

      cy.visit(publicStudio.url, {
        onBeforeLoad(window) {
          window.localStorage.setItem(
            'consentToTracking',
            JSON.stringify({ consentToTracking: true, hasSetPreferences: true })
          );
        },
      });

      cy.findByRole('heading', { name: new RegExp(publicStudio.title, 'i') });
      cy.get('table').scrollIntoView(); // Scrolling the table into view triggers the request to fetch rows for the table.

      cy.wait('@studioQueryResult', { timeout: 30000 }).then(interception => {
        expect(interception.response.statusCode).to.equal(300);
        expect(interception.response.body.head.vars.length).to.be.equal(
          publicStudio.defaultDashboardColumnsCount
        );

        expect(interception.response.body.results.bindings.length).to.be.equal(
          publicStudio.defaultDashboardRowsCount
        );

        cy.wrap(assertColumns(interception.response.body.head.vars, true));
        cy.wrap(assertRowCount(publicStudio.defaultDashboardRowsCount));
      });
    });
  });

  it('shows correct tabs for all workspaces', () => {
    PUBLIC_STUDIOS.forEach(studio => {
      cy.visit(studio.url, {
        onBeforeLoad: window => dismissConsentToTrackingModal(window),
      });
      cy.get('table').scrollIntoView(); // Scrolling the table into view triggers the request to fetch rows for the table.

      cy.get(WorkspaceItemsSelector).should(
        'have.length',
        studio.workspaces.length
      );

      studio.workspaces.forEach(workspace => {
        cy.findByRole('menuitem', { name: new RegExp(workspace.name, 'i') });
      });
    });
  });

  it(
    'loads data for each dashboard in workspace',
    {
      retries: {
        runMode: 3,
      },
    },
    () => {
      PUBLIC_STUDIOS.forEach(studio => {
        cy.visit(studio.url, {
          onBeforeLoad: window => dismissConsentToTrackingModal(window),
        });
        cy.get('table').scrollIntoView(); // Scrolling the table into view triggers the request to fetch rows for the table.

        studio.workspaces.forEach(workspace => {
          workspace.dashboards.forEach((dashboard, index) => {
            // First dashboard is already tested in the first `it` as it is the default dashboard
            if (index !== 0) {
              cy.findByRole('menuitem', {
                name: new RegExp(workspace.name, 'i'),
              }).click();

              cy.intercept('POST', sparqlEndpoint(studio.id)).as(
                `dashboardSparqlRequest-${dashboard.name}`
              );

              cy.findByRole('menuitem', {
                name: dashboard.name,
              }).click();

              cy.wait(`@dashboardSparqlRequest-${dashboard.name}`, {
                timeout: 30000,
              }).then(interception => {
                cy.log(
                  `Testing dashboard ${dashboard.name} in workspace ${workspace.name} in studio ${studio.title}`
                );
                cy.wrap(
                  assertColumns(
                    interception.response.body.head.vars,
                    dashboard.sortable
                  )
                );
                cy.wrap(
                  assertRowCount(
                    interception.response.body.results.bindings.length
                  )
                );
              });
            }
          });
        });
      });
    }
  );

  const dismissConsentToTrackingModal = window => {
    window.localStorage.setItem(
      'consentToTracking',
      JSON.stringify({ consentToTracking: true, hasSetPreferences: true })
    );
  };

  const assertColumns = async (columnsData: string[], sortable: boolean) => {
    columnsData.forEach(column => {
      if (column !== 'self')
        // cy.findByRole('cell', { name: _.startCase(column) });
        cy.findByText(_.startCase(column), {
          selector: sortable ? 'th .ant-table-column-title' : 'th',
        });
    });
  };

  const assertRowCount = async (expectedTotalRows: number) => {
    const totalPaginationButtons = Math.ceil(
      expectedTotalRows / MaxRowsPerPage
    );

    cy.findByText(new RegExp(`${expectedTotalRows} Results`));

    if (expectedTotalRows > MaxRowsPerPage) {
      cy.get(RowSelector).should('have.length.at.least', MaxRowsPerPage);

      cy.get(PaginationButtonsSelector).should(
        'have.length',
        totalPaginationButtons
      );
    } else {
      cy.get(RowSelector).should('have.length.at.least', expectedTotalRows);
    }
  };
});

export const PUBLIC_STUDIOS = [
  {
    id: 'thalamus',
    title: 'public | thalamus',
    url:
      'https://bbp.epfl.ch/nexus/web/studios/public/thalamus/studios/e9ceee28-b2c2-4c4d-bff9-d16f43c3eb0f?workspaceId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F52e9c443-534b-4b2f-bd6a-ad340ae10d00&dashboardId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fcaea33ce-2333-40af-a9cb-3149077f1ec9',
    defaultDashboardColumnsCount: 7,
    defaultDashboardRowsCount: 157,
    workspaces: [
      {
        name: 'Experimental data',
        dashboards: [
          {
            name: '1-Neuron morphology',
            sortable: true,
          },
          {
            name: '2-Neuron electrophysiology',
            sortable: true,
          },
          {
            name: '3-Layer anatomy',
            sortable: true,
          },
          {
            name: '4-Neuron density',
            sortable: true,
          },
          {
            name: '5-Bouton density',
            sortable: true,
          },
        ],
      },
      {
        name: 'Digital reconstructions',
        dashboards: [
          {
            name: '1-Single cell model',
            sortable: true,
          },
          {
            name: '2-Neuron morphology',
            sortable: true,
          },
          {
            name: '3-Neuron electrophysiology',
            sortable: true,
          },
          {
            name: '4-Factsheet',
            sortable: true,
          },
          {
            name: '5-Microcircuit reconstruction',
            sortable: true,
          },
        ],
      },
      {
        name: 'Network simulations',
        dashboards: [
          {
            name:
              'Video 1-Evoked sensory activity, in vivo-like condition (related to Figure 4)',
            sortable: false,
          },
          {
            name:
              'Video 2-Sensory adaptation, control vs. cortical input, in vivo-like condition (related to Figure 5)',
            sortable: false,
          },
          {
            name:
              'Video 3-Transition from wakefulness-like states to simulated cortical UP and DOWN activity, with spindle-like oscillations appearing during the UP state (related to Figure 6)',
            sortable: false,
          },
          {
            name:
              'Video 4-Spindle-like oscillations, in vitro-like condition (related to Figure 7)',
            sortable: false,
          },
          {
            name:
              'Video 5-Spindle-like oscillations, control vs. gap-junctions removed (related to Figure 7)',
            sortable: false,
          },
        ],
      },
    ],
  },
  {
    id: 'topological-sampling',
    title: 'public | topological-sampling',
    url:
      'https://bbp.epfl.ch/nexus/web/studios/public/topological-sampling/studios/https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fa7cc7e9f-53c5-4940-929c-95f4c4f57728?workspaceId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F165e54c5-e8f6-4d85-ac94-53bc3dfe5cd4&dashboardId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Ff7f58b8a-fe14-4956-9c20-44a60729893a',
    defaultDashboardColumnsCount: 8,
    defaultDashboardRowsCount: 15,
    workspaces: [
      {
        name: 'Data dashboards',
        dashboards: [
          {
            name: 'All data',
            sortable: true,
          },
          {
            name: 'Analysis results',
            sortable: true,
          },
          {
            name: 'Configurations',
            sortable: true,
          },
          {
            name: 'Input data',
            sortable: true,
          },
          {
            name: 'Notebooks',
            sortable: true,
          },
        ],
      },
    ],
  },
];
