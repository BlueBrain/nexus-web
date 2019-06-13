import * as React from 'react';
import Nexus from '@bbp/nexus-sdk';

const defaultNexus = new Nexus({ environment: window.location.host });

const context = React.createContext<Nexus>(defaultNexus);

export default context;
