import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

/**
 * CustomTooltip - Accessible custom tooltip showing minute and predicted blood glucose.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isHyper = value > 180;
    const isSafe = value >= 70 && value <= 140;

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-stone-200 p-3 rounded-2xl shadow-lg font-sans text-xs space-y-1">
        <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          +{label} mins postprandial
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-primary">
            {value} mg/dL
          </span>
          <span
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
              isHyper
                ? 'bg-rose-bg text-rose-text border border-rose-text/20'
                : isSafe
                ? 'bg-sage-bg text-sage-text border border-sage-text/20'
                : 'bg-amber-bg text-amber-text border border-amber-text/20'
            }`}
          >
            {isHyper ? 'Elevated' : isSafe ? 'Euglycemic' : 'Moderate'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * ExcursionChart - Deterministic 2-hour blood glucose trajectory line chart.
 */
export const ExcursionChart = ({ data = [] }) => {
  return (
    <div className="w-full h-64 sm:h-72 font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E4DC" vertical={false} />

          {/* Euglycemic Target Safe Zone (70 - 140 mg/dL) */}
          <ReferenceArea
            y1={70}
            y2={140}
            fill="#D8E8CB"
            fillOpacity={0.4}
            ifOverflow="visible"
          />

          {/* Hyperglycemic Excursion Threshold (180 mg/dL) */}
          <ReferenceLine
            y={180}
            stroke="#BA1A1A"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: '180 mg/dL Spike Cap',
              position: 'insideTopRight',
              fill: '#BA1A1A',
              fontSize: 10,
              fontWeight: 700,
            }}
          />

          {/* Axes */}
          <XAxis
            dataKey="time"
            stroke="#727974"
            tick={{ fontSize: 11, fontWeight: 600 }}
            tickFormatter={(v) => `${v}m`}
            domain={[0, 120]}
            type="number"
            ticks={[0, 30, 60, 90, 120]}
          />
          <YAxis
            stroke="#727974"
            tick={{ fontSize: 11, fontWeight: 600 }}
            domain={[50, 250]}
            ticks={[50, 100, 150, 180, 200, 250]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Excursion Curve */}
          <Line
            type="monotone"
            dataKey="predictedGlucose"
            stroke="#1B3B22"
            strokeWidth={3}
            dot={{ r: 3.5, fill: '#1B3B22', strokeWidth: 1, stroke: '#FFFFFF' }}
            activeDot={{ r: 6, fill: '#386A20', strokeWidth: 2, stroke: '#FFFFFF' }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-stone-600 px-2 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-sage-bg border border-sage-text/30" />
          <span>Euglycemic Safe Zone (70–140 mg/dL)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-rose-text border-t border-dashed border-rose-text" />
          <span>Hyperglycemic Cap (180 mg/dL)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-primary rounded-full" />
          <span>Predicted Trajectory</span>
        </div>
      </div>
    </div>
  );
};

export default ExcursionChart;
