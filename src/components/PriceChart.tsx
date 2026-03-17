import { useMemo } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  Cell,
} from 'recharts';
import type { KlineData } from '@/types';

interface PriceChartProps {
  data: KlineData[];
  symbol: string;
  supportLevels?: number[];
  resistanceLevels?: number[];
  pattern?: string;
  accentColor?: string;
}

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isGreen: boolean;
}

export function PriceChart({ 
  data, 
  supportLevels = [], 
  resistanceLevels = [],
}: PriceChartProps) {
  const chartData: CandleData[] = useMemo(() => {
    return data.map((kline) => {
      const open = parseFloat(kline.open);
      const high = parseFloat(kline.high);
      const low = parseFloat(kline.low);
      const close = parseFloat(kline.close);
      
      return {
        time: new Date(kline.openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open,
        high,
        low,
        close,
        volume: parseFloat(kline.volume),
        isGreen: close >= open,
      };
    });
  }, [data]);

  // Calculate Y axis domain with padding
  const { minPrice, maxPrice } = useMemo(() => {
    if (chartData.length === 0) return { minPrice: 0, maxPrice: 100 };
    
    const lows = chartData.map(d => d.low);
    const highs = chartData.map(d => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const range = max - min;
    
    return {
      minPrice: Math.floor(min - range * 0.02),
      maxPrice: Math.ceil(max + range * 0.02),
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#141414] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm mb-2">{d.time}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Open:</span>
              <span className="text-white">${d.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">High:</span>
              <span className="text-green-400">${d.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Low:</span>
              <span className="text-red-400">${d.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Close:</span>
              <span className={d.isGreen ? 'text-green-400' : 'text-red-400'}>${d.close.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom candle shape for scatter plot
  const CandleShape = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload) return null;
    
    const { open, high, low, close, isGreen } = payload;
    const color = isGreen ? '#22c55e' : '#ef4444';
    
    // Fixed candle width
    const candleWidth = 6;
    const halfWidth = candleWidth / 2;
    
    // Calculate Y positions based on price values
    // We need to map price values to pixel positions
    const chartHeight = 300; // Approximate chart height
    const priceRange = maxPrice - minPrice;
    
    // Helper to convert price to Y pixel position
    const priceToY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };
    
    const highY = priceToY(high);
    const lowY = priceToY(low);
    const openY = priceToY(open);
    const closeY = priceToY(close);
    
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
    
    return (
      <g>
        {/* Upper wick */}
        <line
          x1={cx}
          y1={highY}
          x2={cx}
          y2={bodyTop}
          stroke={color}
          strokeWidth={1}
        />
        {/* Lower wick */}
        <line
          x1={cx}
          y1={bodyTop + bodyHeight}
          x2={cx}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={cx - halfWidth}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={color}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-[#c8e745] border-t-transparent rounded-full animate-spin" />
          <span>Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#444" 
            tick={{ fill: '#666', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis 
            stroke="#444" 
            tick={{ fill: '#666', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={[minPrice, maxPrice]}
            tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#444', strokeWidth: 1 }} />
          
          {/* Support Levels */}
          {supportLevels.slice(0, 2).map((level, index) => (
            <ReferenceLine
              key={`support-${index}`}
              y={level}
              stroke="#22c55e"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}
          
          {/* Resistance Levels */}
          {resistanceLevels.slice(0, 2).map((level, index) => (
            <ReferenceLine
              key={`resistance-${index}`}
              y={level}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}
          
          {/* Candlesticks using Scatter with custom shape */}
          <Scatter
            data={chartData}
            dataKey="close"
            shape={<CandleShape />}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isGreen ? '#22c55e' : '#ef4444'} />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;
