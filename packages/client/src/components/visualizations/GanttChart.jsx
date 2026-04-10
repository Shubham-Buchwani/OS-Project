import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const COLORS = d3.schemeTableau10;

/**
 * GanttChart — D3-rendered horizontal bar chart showing CPU scheduling.
 * Highlights current block based on playback step.
 */
export default function GanttChart({ ganttChart = [], currentStep, processes = [] }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ganttChart.length) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const ROW_H = 40;
    const MARGIN = { top: 16, right: 16, bottom: 36, left: 50 };
    const height = ROW_H + MARGIN.top + MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const totalTime = ganttChart.at(-1)?.end ?? 1;
    const xScale = d3.scaleLinear().domain([0, totalTime]).range([MARGIN.left, width - MARGIN.right]);

    const g = svg.append('g');

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${MARGIN.top + ROW_H})`)
      .call(d3.axisBottom(xScale).ticks(Math.min(totalTime, 12)).tickSize(-ROW_H).tickFormat(d => `t${d}`))
      .call(ax => ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call(ax => ax.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.06)'))
      .call(ax => ax.selectAll('.tick text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', 10));

    // Y label
    g.append('text')
      .attr('x', MARGIN.left - 8).attr('y', MARGIN.top + ROW_H / 2 + 4)
      .attr('text-anchor', 'end').attr('fill', 'rgba(255,255,255,0.5)').attr('font-size', 11)
      .text('CPU');

    // Gantt blocks
    const currentPid = currentStep?.currentProcess?.pid;
    ganttChart.forEach((entry, i) => {
      const x = xScale(entry.start);
      const w = xScale(entry.end) - xScale(entry.start);
      const isActive = entry.pid === currentPid && entry.end === currentStep?.tick;
      const color = COLORS[(entry.pid - 1) % COLORS.length];

      g.append('rect')
        .attr('x', x).attr('y', MARGIN.top)
        .attr('width', Math.max(w - 1, 1)).attr('height', ROW_H - 2)
        .attr('rx', 4)
        .attr('fill', color)
        .attr('opacity', isActive ? 1 : 0.65)
        .attr('stroke', isActive ? 'white' : 'transparent')
        .attr('stroke-width', isActive ? 2 : 0)
        .attr('filter', isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none');

      if (w > 24) {
        g.append('text')
          .attr('x', x + w / 2).attr('y', MARGIN.top + ROW_H / 2 + 4)
          .attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', 11).attr('font-weight', 600)
          .text(`P${entry.pid}`);
      }
    });
  }, [ganttChart, currentStep]);

  // Process table
  const processTable = currentStep?.completedProcesses ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>GANTT CHART</div>
        <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
          <svg ref={svgRef} style={{ width: '100%' }} />
        </div>
      </div>

      {/* Ready Queue */}
      {currentStep?.readyQueue?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>READY QUEUE</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {currentStep.readyQueue.map((p) => (
              <div key={p.pid} style={{ padding: '4px 12px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--clr-primary)' }}>
                P{p.pid} ({p.remainingBurst}t)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed processes */}
      {processTable.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: 8, fontWeight: 500 }}>COMPLETED</div>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  {['PID','Arrival','Burst','CT','TAT','WT','RT'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--clr-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processTable.map((p) => (
                  <tr key={p.pid} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[`P${p.pid}`, p.arrivalTime, p.burstTime, p.completionTime, p.turnaroundTime, p.waitingTime, p.responseTime].map((v, i) => (
                      <td key={i} style={{ padding: '6px 10px', fontFamily: i === 0 ? 'var(--font-mono)' : 'inherit', color: i === 0 ? 'var(--clr-primary)' : 'var(--clr-text-primary)' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
