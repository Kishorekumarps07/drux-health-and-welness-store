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
   data: any[];
   type?: 'revenue' | 'orders';
 }
 
 export function VendorRevenueChart({ data, type = 'revenue' }: VendorRevenueChartProps) {
   const isRevenue = type === 'revenue';
   const dataKey = isRevenue ? 'revenue' : 'orders';
   const themeColor = isRevenue ? '#A6D608' : '#FF7A00'; // Green for revenue, Orange for orders
 
   return (
     <div className="h-[300px] w-full mt-8">
       <ResponsiveContainer width="100%" height="100%">
         <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
           <defs>
             <linearGradient id="colorVendorChart-revenue" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#A6D608" stopOpacity={0.3}/>
               <stop offset="95%" stopColor="#A6D608" stopOpacity={0}/>
             </linearGradient>
             <linearGradient id="colorVendorChart-orders" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3}/>
               <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
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
                 try {
                   const d = new Date(str);
                   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                 } catch (e) {
                   return str;
                 }
             }}
           />
           <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
             tickFormatter={(val) => isRevenue ? `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}` : val}
             allowDecimals={false}
           />
           <Tooltip 
             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
             labelClassName="font-black text-gray-900"
             labelFormatter={(label) => {
               try {
                 const d = new Date(label);
                 return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
               } catch (e) {
                 return label;
               }
             }}
             formatter={(value: any) => [
               isRevenue ? `₹${value.toLocaleString()}` : `${value} Orders`,
               isRevenue ? "Revenue" : "Orders"
             ]}
           />
           <Area 
             type="monotone" 
             dataKey={dataKey} 
             name={isRevenue ? "Revenue" : "Orders"}
             stroke={themeColor} 
             strokeWidth={4}
             fillOpacity={1} 
             fill={`url(#colorVendorChart-${type})`} 
             animationDuration={1500}
             dot={{ r: 4, fill: themeColor, strokeWidth: 2, stroke: '#fff' }}
             activeDot={{ r: 6, fill: themeColor, strokeWidth: 0 }}
           />
         </AreaChart>
       </ResponsiveContainer>
     </div>
   );
 }
