"use client";

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
} from 'recharts';

interface VendorRevenueChartProps {
  data: { date: string; revenue: number }[];
}

export function VendorRevenueChart({ data }: VendorRevenueChartProps) {
  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVendorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A6D608" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#A6D608" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
            dy={10}
            tickFormatter={(str) => {
                const d = new Date(str);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            labelClassName="font-black text-gray-900"
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#A6D608" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorVendorRevenue)" 
            animationDuration={1500}
            dot={{ r: 4, fill: '#A6D608', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#A6D608', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
