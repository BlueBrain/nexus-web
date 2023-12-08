import { cleanup, render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

import { server } from '../__mocks__/server';

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };
export { server };
export { cleanup };
