import * as d3 from 'd3';
import * as d3Force from 'd3-force';
import * as dotParser from 'dotparser';
import dotToNodesParser from './dotToNodesParser';
import moment = require('moment');

function titleOf(string: string) {
  const slash = string.substring(string.lastIndexOf('/') + 1);
  const title = slash.substring(slash.lastIndexOf('#') + 1);
  const formats = [moment.ISO_8601];
  const isValidDate = moment(title, formats, true).isValid();
  return isValidDate ? moment(title).fromNow() : title;
}

type TeardownCallback = VoidFunction;

/*
  MakeGraph will build a graph using d3 in a funcitonal way.
  It will return a teardown Callback that can be called to remove the d3 graph.
*/
const makeGraph = (
  dotGraph: string,
  element: HTMLElement
): TeardownCallback => {
  const dataset = dotToNodesParser(dotParser(dotGraph));
  const svg = d3
    .select(`[id="${element.id}"]`)
    .append('svg')
    .attr('width', element.clientWidth)
    .attr('height', element.clientHeight);

  svg.html(`<filter id="dropshadow" height="130%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> <!-- stdDeviation is how much to blur -->
  <feOffset dx="2" dy="2" result="offsetblur"/> <!-- how much to offset -->
  <feComponentTransfer>
    <feFuncA type="linear" slope="0.3"/> <!-- slope is the opacity of the shadow -->
  </feComponentTransfer>
  <feMerge>
    <feMergeNode/> <!-- this contains the offset blurred image -->
    <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
  </feMerge>
</filter>`);

  const linkDistance = 120;

  const links = dataset.edges.map(d => Object.create(d));
  const nodes = dataset.nodes.map(d => Object.create(d));

  const simulation = d3Force
    .forceSimulation(nodes)
    .force(
      'link',
      d3Force
        .forceLink(links)
        .id((d: any) => d.id)
        .distance(() => linkDistance)
    )
    .force('charge', d3Force.forceManyBody().strength(-10))
    .force('collide', d3.forceCollide().radius(30))
    .force(
      'center',
      d3Force.forceCenter(element.clientWidth / 2, element.clientHeight / 2)
    );

  const drag = (simulation: any) => {
    function dragstarted(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: any) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: any) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  const link = svg
    .append('g')
    .attr('class', 'link')
    .selectAll('g')
    .data(links)
    .join('g');

  const lines = link
    .append('line')
    .attr('id', (d, i) => `edge-${i}`)
    .attr('class', 'arrow')
    .attr('marker-end', 'url(#arrowhead)');

  const linePaths = link
    .append('path')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)
    .attr('class', 'edge-path');

  const edgeLabels = linePaths
    .append('text')
    .style('pointer-events', 'none')
    .attr('class', 'edge-label')
    .append('textPath')
    .style('pointer-events', 'none')
    .text(d => {
      return dataset.edges[d.index].label;
    });

  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g');

  const circles = node
    .append('circle')
    .attr('class', 'node-circle')
    .attr('r', 20)
    .attr('fill', () => '#44c7f4')
    .attr('style', 'filter:url(#dropshadow); cursor: pointer;')
    // @ts-ignore
    .call(drag(simulation));

  const labels = node
    .append('text')
    .attr('class', 'label')
    .attr('pointer-events', 'none')
    .text(d => titleOf(`${dataset.nodes[d.index].id}`));

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    circles.attr('cx', d => d.x).attr('cy', d => d.y);
    labels.attr('x', d => d.x).attr('y', d => d.y);
    linePaths.attr(
      'd',
      d => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`
    );
    edgeLabels.attr('transform', function(d, i) {
      if (d.target.x < d.source.x) {
        const bbox = this.getBBox();
        const rx = bbox.x + bbox.width / 2;
        const ry = bbox.y + bbox.height / 2;
        return `rotate(180 ${rx} ${ry})`;
      }
      return 'rotate(0)';
    });
  });

  // returns auto-removal function
  return () => {
    d3.select(`[id="${element.id}"]`)
      .selectAll('svg')
      .remove();
  };
};

export default makeGraph;
