import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * DeadlockGraph — D3 force-directed graph for Wait-For visualization,
 * or step-by-step matrix display for Banker's Algorithm.
 */
export default function DeadlockGraph({ step, need, allocation, available, adjacencyList, processCount = 0 }) {
  const svgRef = useRef(null);
  const simRef = useRef(null);

  const isBankers = !!need;

  // Cleanup simulation when graph mode changes
  useEffect(() => { simRef.current = null; d3.select(svgRef.current).selectAll('*').remove(); }, [isBankers, adjacencyList]);

  useEffect(() => {
    if (!step) return;
    if (!adjacencyList && !isBankers) return;

    if (isBankers) {
      renderBankersChart();
    } else {
      renderWaitForGraph();
    }

    function renderBankersChart() {
      const svg = d3.select(svgRef.current);
      const width = 800; // Desktop-first width
      const margin = { top: 70, right: 30, bottom: 30, left: 60 };
      
      // Calculate process height to fit within a reasonable 450px window if possible
      const targetHeight = 450;
      const processHeight = Math.min(45, Math.max(22, (targetHeight - margin.top - margin.bottom) / Math.max(1, processCount)));
      const height = margin.top + margin.bottom + (processCount * processHeight);
 // Initialize Banker's Chart structure
      if (svg.select('.bankers-group').empty()) {
        svg.selectAll('*').remove();
        svg.attr('width', '100%').attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
        svg.append('g').attr('class', 'bankers-group').attr('transform', `translate(${margin.left},${margin.top})`);
      } else {
        // Update height/viewBox if processCount changed
        svg.attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
      }

      const g = svg.select('.bankers-group');
      const resourceCount = available?.length || 0;
      const resourceWidth = (width - margin.left - margin.right) / Math.max(1, resourceCount);

      // ─── Render Available Pool (Work) ───
      const workData = step.work || available || [];
      const poolGroup = svg.selectAll('.pool-group').data([workData]).join('g')
        .attr('class', 'pool-group').attr('transform', `translate(${margin.left}, 30)`);

      poolGroup.selectAll('.pool-label').data(['Available Pool']).join('text')
        .attr('class', 'pool-label').attr('y', -10).attr('font-size', '10px').attr('fill', 'var(--clr-text-muted)').attr('font-weight', 600).text(d => d);

      const poolItems = poolGroup.selectAll('.pool-item').data(workData).join('g')
        .attr('class', 'pool-item')
        .attr('transform', (_, i) => `translate(${(i % 8) * 60}, ${Math.floor(i / 8) * 35})`);

      poolItems.selectAll('rect').data(d => [d]).join('rect')
        .attr('width', 45).attr('height', 20).attr('rx', 4).attr('fill', 'rgba(139,92,246,0.1)').attr('stroke', 'rgba(139,92,246,0.3)');

      poolItems.selectAll('.val').data(d => [d]).join('text')
        .attr('class', 'val').attr('x', 22.5).attr('y', 14).attr('text-anchor', 'middle').attr('font-size', '11px').attr('fill', 'var(--clr-primary)').attr('font-weight', 700)
        .text(d => d);

      poolItems.selectAll('.r-label').data((_, i) => [`R${i}`]).join('text')
        .attr('class', 'r-label').attr('x', 22.5).attr('y', 28).attr('text-anchor', 'middle').attr('font-size', '8px').attr('fill', 'var(--clr-text-muted)')
        .text(d => d);


      // ─── Render Processes ───
      const processes = Array.from({ length: processCount }, (_, i) => ({
        id: i,
        allocated: allocation?.[i] || [],
        needed: need?.[i] || [],
        finished: step.finish?.[i] || false,
        isSelected: step.selected === i
      }));

      const procGroups = g.selectAll('.proc-group').data(processes, d => d.id).join('g')
        .attr('class', 'proc-group')
        .attr('transform', (_, i) => `translate(0, ${i * processHeight})`);

      // Selection indicator
      procGroups.selectAll('.bg-rect').data(d => [d]).join('rect')
        .attr('class', 'bg-rect').attr('x', -50).attr('y', 0).attr('width', width - margin.right).attr('height', processHeight - 4).attr('rx', 6)
        .attr('fill', d => d.isSelected ? 'rgba(139,92,246,0.08)' : 'transparent')
        .attr('stroke', d => d.isSelected ? 'rgba(139,92,246,0.2)' : 'transparent');

      // Process Label
      procGroups.selectAll('.proc-label').data(d => [d]).join('text')
        .attr('class', 'proc-label').attr('x', -40).attr('y', processHeight / 2 - 2).attr('font-size', '12px').attr('font-weight', 600)
        .attr('fill', d => d.finished ? 'var(--clr-success)' : d.isSelected ? 'var(--clr-primary)' : 'var(--clr-text-primary)')
        .text(d => `${d.finished ? '✓' : ''} P${d.id}`);

      // Resource Bars for each process
      procGroups.each(function(p) {
        const group = d3.select(this);
        const resGroups = group.selectAll('.res-bar-group').data(p.allocated.map((a, j) => ({
          allocated: a,
          needed: p.needed[j],
          rIndex: j
        }))).join('g')
          .attr('class', 'res-bar-group').attr('transform', (_, j) => `translate(${j * 80}, 0)`);

        // BG Bar (Max total)
        resGroups.selectAll('.bar-bg').data(d => [d]).join('rect')
          .attr('class', 'bar-bg').attr('y', 6).attr('width', 70).attr('height', 10).attr('rx', 2).attr('fill', 'rgba(255,255,255,0.03)');

        // Allocation Bar
        resGroups.selectAll('.bar-alloc').data(d => [d]).join('rect')
          .attr('class', 'bar-alloc').attr('y', 6).attr('height', 10).attr('rx', 2)
          .transition().duration(300)
          .attr('width', d => Math.max(2, (d.allocated / (d.allocated + d.needed || 1)) * 70))
          .attr('fill', p.finished ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.5)');

        // Need Bar (Dashed/Empty)
        resGroups.selectAll('.bar-need').data(d => [d]).join('rect')
          .attr('class', 'bar-need').attr('y', 6).attr('height', 10).attr('rx', 2).attr('fill', 'none').attr('stroke', 'rgba(239,68,68,0.3)').attr('stroke-dasharray', '2,1')
          .attr('x', d => (d.allocated / (d.allocated + d.needed || 1)) * 70)
          .attr('width', d => (d.needed / (d.allocated + d.needed || 1)) * 70);

        resGroups.selectAll('.res-txt').data(d => [d]).join('text')
          .attr('class', 'res-txt').attr('y', 25).attr('font-size', '8px').attr('fill', 'var(--clr-text-muted)')
          .text(d => `Alloc: ${d.allocated} | Need: ${d.needed}`);
      });
    }

    function renderWaitForGraph() {
      if (!simRef.current || d3.select(svgRef.current).select('.main-group').empty()) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = 600;
        const height = 400; // Fixed height to fit desktop screens without scrolling
        svg.attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${width} ${height}`);

        const nodes = Array.from({ length: processCount }, (_, i) => ({ id: i, label: `P${i}` }));
        const links = [];
        adjacencyList.forEach((neighbors, from) => {
          neighbors.forEach((to) => links.push({ source: from, target: to }));
        });

        const sim = d3.forceSimulation(nodes)
          .force('link', d3.forceLink(links).id(d => d.id).distance(100))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(30));
        simRef.current = sim;

        const g = svg.append('g').attr('class', 'main-group');

        // Arrow marker
        svg.append('defs').append('marker')
          .attr('id', 'arrow').attr('viewBox', '0 -5 10 10').attr('refX', 22).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
          .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', 'rgba(239,68,68,0.7)');

        const link = g.append('g').selectAll('line').data(links).join('line')
          .attr('stroke', 'rgba(239,68,68,0.5)').attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)');

        const node = g.append('g').selectAll('g').data(nodes).join('g').attr('class', 'node-group');

        node.append('circle').attr('class', 'node-bg').attr('r', 18).attr('stroke-width', 2);
        node.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('fill', 'white').attr('font-size', 12).attr('font-weight', 600).text(d => d.label);

        sim.on('tick', () => {
          link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
          node.attr('transform', d => {
            // Keep within bounds
            d.x = Math.max(25, Math.min(width - 25, d.x));
            d.y = Math.max(25, Math.min(height - 25, d.y));
            return `translate(${d.x},${d.y})`;
          });
        });
      }

      // Update Wait-For node styles
      const svg = d3.select(svgRef.current);
      svg.selectAll('.node-bg').transition().duration(200)
        .attr('fill', (d) => {
          if (step?.cycle?.includes(d.id)) return 'rgba(239,68,68,0.25)';
          if (step?.node === d.id) return 'rgba(234,179,8,0.3)';
          if (step?.path?.includes(d.id)) return 'rgba(139,92,246,0.25)';
          return 'rgba(139,92,246,0.05)';
        })
        .attr('stroke', (d) => {
          if (step?.cycle?.includes(d.id)) return '#ef4444';
          if (step?.node === d.id) return '#eab308';
          if (step?.path?.includes(d.id)) return '#8b5cf6';
          return '#4c4c5c';
        });
    }

  }, [step, adjacencyList, processCount, isBankers, allocation, available]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Status Bar ── */}
      {step?.action && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: step.action === 'SAFE' || step.action === 'NO_DEADLOCK' ? 'rgba(16,185,129,0.12)' : step.action === 'UNSAFE' || step.action === 'DEADLOCK_FOUND' ? 'rgba(239,68,68,0.12)' : 'rgba(139,92,246,0.12)', border: `1px solid ${step.action === 'SAFE' || step.action === 'NO_DEADLOCK' ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.2)'}`, fontSize: '0.85rem', color: step.action === 'SAFE' || step.action === 'NO_DEADLOCK' ? 'var(--clr-success)' : step.action === 'UNSAFE' || step.action === 'DEADLOCK_FOUND' ? 'var(--clr-danger)' : 'var(--clr-primary)' }}>
          <strong>{step.action}</strong>: {step.note}
        </div>
      )}

      {/* ── Visualization Canvas ── */}
      <div className="glass-card" style={{ padding: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {isBankers ? "Resource Allocation Status" : "Wait-For Graph Detection"}
        </div>
        <svg ref={svgRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      {isBankers && step?.safeSequence?.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--clr-success)', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 500 }}>
          Safe Sequence Found: <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 8 }}>P{step.safeSequence.join(' → P')}</span>
        </div>
      )}
    </div>
  );
}

