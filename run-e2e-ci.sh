#!/bin/bash -x
#Xvfb -screen 0 1024x768x24 :99 &
#cypress run --headed --config-file cypress.config.ts --browser chrome --record
cypress run --config-file cypress.config.ts --browser chrome --record
