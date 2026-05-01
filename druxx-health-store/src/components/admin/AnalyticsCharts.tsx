"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { RevenueDataPoint } from '@/types/analytics';

interface ChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

export function RevenueChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
            dy={10}
            tickFormatter={(str) => {
                const d = new Date(str);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
            tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1F2937', color: '#E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
            itemStyle={{ color: '#10B981', fontWeight: 600 }}
            labelStyle={{ color: '#9CA3AF', fontWeight: 500, marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10B981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            animationDuration={1500}
            dot={{ r: 4, fill: '#111827', strokeWidth: 2, stroke: '#10B981' }}
            activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersTrendBarChart({ data }: { data: { date: string; value: number }[] }) {
  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
            dy={10}
            tickFormatter={(str) => {
                const d = new Date(str);
                return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip 
            cursor={{ fill: '#1F2937', opacity: 0.5 }}
            contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1F2937', color: '#E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }}
            itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
            labelStyle={{ color: '#9CA3AF', fontWeight: 500, marginBottom: '4px' }}
          />
          <Bar 
            dataKey="value" 
            fill="url(#colorOrders)" 
            radius={[6, 6, 0, 0]} 
            barSize={24}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PerformanceBarChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-[250px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
            width={100}
          />
          <Tooltip 
             cursor={{ fill: '#1F2937', opacity: 0.5 }}
             contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1F2937', color: '#E5E7EB' }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10B981' : '#0ea5e9'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
