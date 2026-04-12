import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * DeadlockGraph — D3 force-directed graph for Wait-For visualization,
 * or step-by-step matrix display for Banker's Algorithm.
 */
export default function DeadlockGraph({ step, need, adjacencyList, processCount = 0 }) {
  const svgRef = useRef(null);
  const simRef = useRef(null);

  const isBankers = !!need;

  // Cleanup simulation when graph data completely transforms
  useEffect(() => { simRef.current = null; }, [adjacencyList]);

  useEffect(() => {
    if (!step) return;
    if (isBankers) return; // Matrix mode rendered below
    if (!adjacencyList) return;

    // 1. Initialize simulation and graph structure ONLY once per run
    if (!simRef.current || d3.select(svgRef.current).select('.main-group').empty()) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = 500, height = 300;
      svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

      const nodes = Array.from({ length: processCount }, (_, i) => ({ id: i, label: `P${i}` }));
      const links = [];
      adjacencyList.forEach((neighbors, from) => {
        neighbors.forEach((to) => links.push({ source: from, target: to }));
      });

      const sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2));
      simRef.current = sim;

      const g = svg.append('g').attr('class', 'main-group');

      // Arrow marker
      svg.append('defs').append('marker')
        .attr('id', 'arrow').attr('viewBox', '0 -5 10 10').attr('refX', 22).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', 'rgba(239,68,68,0.7)');

      const link = g.append('g').selectAll('line').data(links).join('line')
        .attr('stroke', 'rgba(239,68,68,0.5)').attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)');

      const node = g.append('g').selectAll('g').data(nodes).join('g').attr('class', 'node-group');

      node.append('circle')
        .attr('class', 'node-bg')
        .attr('r', 18)
        .attr('stroke-width', 2);

      node.append('text')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', 'white').attr('font-size', 12).attr('font-weight', 600)
        .text(d => d.label);

      sim.on('tick', () => {
        link
          .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });
    }

    // 2. Update node attributes based on CURRENT step purely via styles
    const svg = d3.select(svgRef.current);
    svg.selectAll('.node-bg')
      .transition().duration(200)
      .attr('fill', (d) => {
        if (step?.cycle?.includes(d.id)) return 'rgba(239,68,68,0.25)'; // cycle == red
        if (step?.node === d.id) return 'rgba(234,179,8,0.3)'; // current node == yellow
        if (step?.path?.includes(d.id)) return 'rgba(139,92,246,0.25)'; // search path == purple
        if (step?.recStack?.[d.id]) return 'rgba(139,92,246,0.15)'; // stack == dim purple
        return 'rgba(139,92,246,0.05)'; // default inactive
      })
      .attr('stroke', (d) => {
        if (step?.cycle?.includes(d.id)) return '#ef4444';
        if (step?.node === d.id) return '#eab308';
        if (step?.path?.includes(d.id)) return '#8b5cf6';
        return '#4c4c5c';
      });

  }, [step, adjacencyList, processCount, isBankers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status */}
      {step?.action && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: step.action === 'SAFE' || step.action === 'NO_DEADLOCK' ? 'rgba(16,185,129,0.12)' : step.action === 'UNSAFE' || step.action === 'DEADLOCK_FOUND' ? 'rgba(239,68,68,0.12)' : 'rgba(139,92,246,0.12)', border: `1px solid ${step.action === 'SAFE' || step.action === 'NO_DEADLOCK' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.2)'}`, fontSize: '0.85rem', color: step.action === 'SAFE' || step.action === 'NO_DEADLOCK' ? 'var(--clr-success)' : step.action === 'UNSAFE' || step.action === 'DEADLOCK_FOUND' ? 'var(--clr-danger)' : 'var(--clr-primary)' }}>
          <strong>{step.action}</strong>: {step.note}
        </div>
      )}

      {/* Banker's Matrix Display */}
      {isBankers && need ? (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>NEED MATRIX</div>
          <div style={{ overflow: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--clr-text-muted)' }}>Process</th>
                  {need[0]?.map((_, j) => <th key={j} style={{ padding: '6px 12px', color: 'var(--clr-text-muted)' }}>R{j}</th>)}
                </tr>
              </thead>
              <tbody>
                {need.map((row, i) => (
                  <tr key={i} style={{ background: step?.selected === i ? 'rgba(139,92,246,0.1)' : 'transparent', borderRadius: 6 }}>
                    <td style={{ padding: '6px 12px', color: 'var(--clr-primary)' }}>P{i}</td>
                    {row.map((v, j) => (
                      <td key={j} style={{ padding: '6px 12px', textAlign: 'center', color: 'var(--clr-text-primary)' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {step?.safeSequence?.length > 0 && (
            <div style={{ marginTop: 12, padding: '8px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 6, fontSize: '0.8rem', color: 'var(--clr-success)', fontFamily: 'var(--font-mono)' }}>
              Safe Sequence: P{step.safeSequence.join(' → P')}
            </div>
          )}
        </div>
      ) : (
        /* Wait-For Graph */
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>WAIT-FOR GRAPH</div>
          <svg ref={svgRef} style={{ width: '100%', height: 300, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
