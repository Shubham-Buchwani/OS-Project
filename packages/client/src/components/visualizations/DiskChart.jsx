import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * DiskChart — shows disk arm movement as a D3 line chart + block bitmap.
 */
export default function DiskChart({ step, mode, diskScheduling, diskBlocks }) {
  const svgRef = useRef(null);

  const isDiskScheduling = mode === 'diskScheduling';

  useEffect(() => {
    if (!isDiskScheduling || !step) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500, height = 200;
    const MARGIN = { top: 20, right: 20, bottom: 32, left: 40 };
    svg.attr('width', width).attr('height', height);

    // Build cumulative seek sequence up to current step
    const allSteps = [{ from: diskScheduling?.initialHeadPosition ?? 0, to: diskScheduling?.initialHeadPosition ?? 0 }];
    if (step) allSteps.push({ from: step.from, to: step.to });

    const positions = [diskScheduling?.initialHeadPosition ?? 0];

    const diskSize = diskScheduling?.diskSize ?? 200;
    const xScale = d3.scaleLinear().domain([0, allSteps.length + 1]).range([MARGIN.left, width - MARGIN.right]);
    const yScale = d3.scaleLinear().domain([0, diskSize]).range([height - MARGIN.bottom, MARGIN.top]);

    const g = svg.append('g');

    // Axes
    g.append('g').attr('transform', `translate(0,${height - MARGIN.bottom})`).call(d3.axisBottom(xScale).ticks(8).tickSize(-height + MARGIN.top + MARGIN.bottom)).call(ax => { ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'); ax.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)'); ax.selectAll('.tick text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', 9); });
    g.append('g').attr('transform', `translate(${MARGIN.left},0)`).call(d3.axisLeft(yScale).ticks(5)).call(ax => { ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'); ax.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)'); ax.selectAll('.tick text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', 9); });

    // Current head position line
    const headPos = step?.to ?? (diskScheduling?.initialHeadPosition ?? 0);
    g.append('line')
      .attr('x1', MARGIN.left).attr('x2', width - MARGIN.right)
      .attr('y1', yScale(headPos)).attr('y2', yScale(headPos))
      .attr('stroke', 'rgba(139,92,246,0.4)').attr('stroke-dasharray', '4,3').attr('stroke-width', 1);

    // Movement segment
    if (step) {
      const lineData = [{ x: 0, y: step.from }, { x: 1, y: step.to }];
      const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y));
      g.append('path').datum(lineData).attr('d', line).attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 2).attr('stroke-linecap', 'round');
      g.append('circle').attr('cx', xScale(1)).attr('cy', yScale(step.to)).attr('r', 5).attr('fill', '#06b6d4');
    }
  }, [step, isDiskScheduling, diskScheduling]);

  // Disk block bitmap visualization
  const isDiskAlloc = mode === 'allocation';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {step && (
        <div style={{ padding: '8px 14px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8rem' }}>
          {isDiskScheduling && `Head: ${step.from} → ${step.to} | Seek: ${step.seek} cylinders | Total: ${step.totalSeek}`}
          {isDiskAlloc && `Operation: ${step.op?.type?.toUpperCase()} "${step.op?.fileName}" | ${step.success ? '✓ Success' : `✗ ${step.error}`}`}
        </div>
      )}

      {isDiskScheduling && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>DISK ARM MOVEMENT</div>
          <svg ref={svgRef} style={{ width: '100%', height: 200 }} />
        </div>
      )}

      {isDiskAlloc && step?.bitmap && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>DISK BLOCK MAP ({step.bitmap.filter(Boolean).length} used / {step.bitmap.length} total)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))', gap: 2 }}>
            {step.bitmap.map((used, i) => (
              <div
                key={i}
                title={`Block ${i}: ${used ? 'used' : 'free'}`}
                style={{ width: '100%', aspectRatio: '1', borderRadius: 2, background: used ? (step.allocatedBlocks?.includes(i) ? 'var(--clr-primary)' : step.freedBlocks?.includes(i) ? 'var(--clr-danger)' : 'var(--clr-success)') : 'rgba(255,255,255,0.06)', transition: 'background 0.2s' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
            <span>⬜ Free</span><span style={{ color: 'var(--clr-primary)' }}>🟣 Newly Allocated</span><span style={{ color: 'var(--clr-success)' }}>🟢 In Use</span><span style={{ color: 'var(--clr-danger)' }}>🔴 Freed</span>
          </div>
        </div>
      )}
    </div>
  );
}
