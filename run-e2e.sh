#!/bin/bash -x
Xvfb -screen 0 1024x768x24 :99 &
cypress run --config-file cypress.config.ts --browser chrome
# cypress run --headed --config-file cypress.config.ts --browser chrome --spec "cypress/e2e/AnalysisPlugin.cy.ts"
