import * as _ from 'lodash';

const PUBLIC_STUDIOS = [
  {
    id: 'thalamus',
    title: 'public | thalamus',
    url:
      'https://bbp.epfl.ch/nexus/web/studios/public/thalamus/studios/e9ceee28-b2c2-4c4d-bff9-d16f43c3eb0f?workspaceId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F52e9c443-534b-4b2f-bd6a-ad340ae10d00&dashboardId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fcaea33ce-2333-40af-a9cb-3149077f1ec9',
    expectedColumns: 7,
    expectedRows: 157,
  },
  {
    id: 'topological-sampling',
    title: 'public | topological-sampling',
    url:
      'https://bbp.epfl.ch/nexus/web/studios/public/topological-sampling/studios/https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fa7cc7e9f-53c5-4940-929c-95f4c4f57728?workspaceId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F165e54c5-e8f6-4d85-ac94-53bc3dfe5cd4&dashboardId=https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Ff7f58b8a-fe14-4956-9c20-44a60729893a',
    expectedColumns: 8,
    expectedRows: 15,
  },
];

describe('Public Studios', () => {
  const RowsPerPage = 50;

  const sparqlEndpoint = (name: string) =>
    `https://bbp.epfl.ch/nexus/v1/views/public/${name}/https%3A%2F%2Fbluebrain.github.io%2Fnexus%2Fvocabulary%2FdefaultSparqlIndex/sparql`;

  const RowSelector = 'tr.data-table-row';
  const PaginationButtonsSelector = 'li.ant-pagination-item';

  it('can visit public studios', () => {
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

      cy.wait('@studioQueryResult', { timeout: 15000 }).then(interception => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.head.vars.length).to.be.equal(
          publicStudio.expectedColumns
        );

        expect(interception.response.body.results.bindings.length).to.be.equal(
          publicStudio.expectedRows
        );

        cy.wrap(assertColumns(interception.response.body.head.vars));
        cy.wrap(assertRows(publicStudio.expectedRows));
      });
    });
  });

  const assertColumns = async (columnsData: string[]) => {
    columnsData.forEach(column => {
      if (column !== 'self') cy.findByLabelText(_.startCase(column));
    });
  };

  const assertRows = async (expectedTotalRows: number) => {
    const totalPaginationButtons = Math.ceil(expectedTotalRows / RowsPerPage);

    cy.findByText(new RegExp(`${expectedTotalRows} Results`));

    if (expectedTotalRows > RowsPerPage) {
      cy.get(RowSelector).should('have.length.at.least', RowsPerPage);

      cy.get(PaginationButtonsSelector).should(
        'have.length',
        totalPaginationButtons
      );
    } else {
      cy.get(RowSelector).should('have.length.at.least', expectedTotalRows);
    }
  };
});
