import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { withKnobs, text } from '@storybook/addon-knobs';
import GraphVisualizer from './GraphVisualizer';

const exampleGraph = 'digraph {Hello->World}';
const badDotGraph = `digraph {
  "http://some_nexus.instance.io/v1/resources/myorg/myproject/_/user1" ->
}`;

storiesOf('Components/GraphVisualizer', module)
  .addDecorator(withKnobs)
  .add(
    'GraphVizualizer',
    withInfo(`
    📈 A delicious d3 graph specially seasoned for displaying dotgraph input as nodes and edges!

    ~~~js
    <GraphVisualizer dotGraph={dotGraph} />
  />
    ~~~
  `)(() => {
      const dotGraph = text(`DotGraph`, exampleGraph);
      return (
        <>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Graph Visualizer</h2>
            <GraphVisualizer dotGraph={exampleGraph} />
          </div>
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>Graph with Error</h2>
            <GraphVisualizer dotGraph={badDotGraph} />
          </div>
        </>
      );
    })
  );
