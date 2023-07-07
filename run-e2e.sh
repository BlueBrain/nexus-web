#!/bin/bash -x
cypress cache clear
cypress run --config-file cypress.config.ts --browser chrome
# cypress run --headed --config-file cypress.config.ts --browser chrome --spec "cypress/e2e/AnalysisPlugin.cy.ts"
