#!/bin/bash -x
cypress run --config-file cypress.config.ts --browser chrome
# cypress run --headed --config-file cypress.config.ts --browser chrome --spec "cypress/e2e/AnalysisPlugin.cy.ts"
