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
  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/> <!-- stdDeviation is how much to blur -->
  <feOffset dx="0" dy="1" result="offsetblur"/> <!-- how much to offset -->
  <feComponentTransfer>
    <feFuncA type="linear" slope="0.3"/> <!-- slope is the opacity of the shadow -->
  </feComponentTransfer>
  <feMerge>
    <feMergeNode/> <!-- this contains the offset blurred image -->
    <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
  </feMerge>
</filter>`);

  const links = dataset.edges.map(d => Object.create(d));
  const nodes = dataset.nodes.map(d => Object.create(d));
  const linkDistance = 150;

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

  const simulation = d3Force
    .forceSimulation(nodes)
    .force(
      'link',
      d3Force
        .forceLink(links)
        .id((d: any) => d.id)
        .distance(() => linkDistance)
    )
    .force('charge', d3Force.forceManyBody().strength(-100))
    .force('collide', d3.forceCollide().radius(30))
    .force(
      'center',
      d3Force.forceCenter(element.clientWidth / 2, element.clientHeight / 2)
    );

  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('.link')
    .data(links)
    .enter()
    .append('g')
    .attr('class', 'link')
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 1)
    .attr('class', 'link-line');

  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    // @ts-ignore
    .call(drag(simulation));

  const circles = node
    .append('circle')
    .attr('class', 'node-circle')
    .attr('r', 8)
    .attr('fill', () => '#44c7f4')
    .attr('style', 'filter:url(#dropshadow); cursor: pointer;');

  const nodeLabel = node
    .append('text')
    .attr('dx', 12)
    .attr('dy', '.35em')
    .attr('opacity', 0.3)
    .text((d: any) => titleOf(`${dataset.nodes[d.index].id}`));

  const lineLabel = svg
    .selectAll('.link')
    .append('text')
    .attr('class', 'link-label')
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', '#f4bf75')
    .text((d: any) => titleOf(dataset.edges[d.index].label));

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    lineLabel
      .attr('x', (d: any) => {
        return (d.source.x + d.target.x) / 2;
      })
      .attr('y', (d: any) => {
        return (d.source.y + d.target.y) / 2;
      })
      .attr('transform', (d: any) => {
        const x = (d.source.x + d.target.x) / 2;
        const y = (d.source.y + d.target.y) / 2;
        const angle =
          Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) *
          (180 / Math.PI);
        return `rotate(${angle} ${x} ${y})`;
      });
  });

  function mouseover(this: SVGGElement, d: any) {
    d3.select(this)
      .select('text')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr('font-size', '1.2em');
    d3.select(this)
      .select('circle')
      .transition()
      .duration(300)
      .attr('r', 16);
  }

  function mouseout(this: SVGGElement, d: any) {
    d3.select(this)
      .select('text')
      .transition()
      .duration(300)
      .attr('opacity', 0.3)
      .attr('font-size', '1em');
    d3.select(this)
      .select('circle')
      .transition()
      .duration(300)
      .attr('r', 8);
  }

  // returns auto-removal function
  return () => {
    d3.select(`[id="${element.id}"]`)
      .selectAll('svg')
      .remove();
  };
};

export default makeGraph;
