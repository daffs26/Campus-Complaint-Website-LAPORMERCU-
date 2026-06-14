import { useState } from 'react';

interface PieData {
  name: string;
  value: number;
  color: string;
}

export function PieChart({ data }: { data: PieData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((acc, d) => acc + d.value, 0);
  
  const r = 40;
  const circ = 2 * Math.PI * r;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm w-full">
      {/* SVG Donut Chart */}
      <div className="relative w-36 h-36 flex-shrink-0 mx-auto md:mx-0">
        {total === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Tidak ada data
          </div>
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              if (item.value === 0) return null;
              
              const percent = item.value / total;
              const strokeOffset = circ - (accumulatedPercent * circ);
              accumulatedPercent += percent;
              
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.name}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? 12 : 9}
                  strokeDasharray={circ}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
        )}
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-gray-800 font-jakarta">{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {data.map((item, idx) => {
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
          const isHovered = hoveredIdx === idx;
          
          return (
            <div
              key={item.name}
              className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${
                isHovered ? 'bg-gray-50 translate-x-1' : ''
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{item.name}</span>
              </div>
              <div className="text-right flex items-center gap-1">
                <span className="text-xs font-bold text-gray-800">{item.value}</span>
                <span className="text-[10px] font-semibold text-gray-400">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LineData {
  date: string;
  value: number;
}

export function LineChart({ data }: { data: LineData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 450;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.value), 4); // Minimal max value 4 agar grafik proporsional
  const valuesLength = data.length;

  // Generate coordinates
  const points = data.map((d, idx) => {
    const x = paddingLeft + (idx / (valuesLength - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Polyline points string
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Gradient area path string
  const pathD = points.length > 0 
    ? `M ${points[0].x} ${paddingTop + chartHeight} ` + 
      points.map(p => `L ${p.x} ${p.y}`).join(' ') + 
      ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm w-full">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Tren Pengaduan Harian</h4>
        {hoveredIdx !== null && (
          <div className="text-xs font-bold text-blue-600 animate-fade-in">
            {points[hoveredIdx].date}: <span className="bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{points[hoveredIdx].value} Laporan</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines (Horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight * ratio;
            const value = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#9ca3af"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Gradient Area under line */}
          {points.length > 0 && (
            <path d={pathD} fill="url(#chartGradient)" />
          )}

          {/* Polyline Chart Line */}
          {points.length > 0 && (
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />
          )}

          {/* Point Nodes */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 7 : 5}
                fill={hoveredIdx === idx ? '#1d4ed8' : '#3b82f6'}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}

          {/* Date Labels (X-Axis) */}
          {points.map((p, idx) => {
            // Tampilkan label secukupnya saja agar tidak tumpang tindih
            if (points.length > 7 && idx % 2 !== 0) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="9"
                fontWeight="bold"
              >
                {p.date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
