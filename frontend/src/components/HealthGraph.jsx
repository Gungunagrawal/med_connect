import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HealthGraph = ({ metrics }) => {
    if (!metrics || metrics.length === 0) {
        return (
            <div className="bg-slate-50 border rounded-lg p-8 text-center text-slate-500 italic">
                No health data available
            </div>
        );
    }

    // Format data for Recharts (e.g. parse dates and ensure numbers exist)
    const formattedData = metrics.map(m => ({
        date: new Date(m.recordedDate).toLocaleDateString(),
        Weight: m.weight || null,
        Sugar: m.sugarLevel || null,
        HeartRate: m.heartRate || null,
        // Blood pressure is usually a string (120/80), hard to plot directly on a simple line chart,
        // so we omit it from the graph or parse systolic/diastolic if needed.
    })).filter(m => m.Weight || m.Sugar || m.HeartRate); // Only show data points that actually have plottable numbers

    if (formattedData.length === 0) {
        return (
            <div className="bg-slate-50 border rounded-lg p-8 text-center text-slate-500 italic">
                No health data available
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-96 w-full">
            <h3 className="font-bold text-slate-700 mb-4 px-2">Health Vitals Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="Weight" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Sugar" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="HeartRate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HealthGraph;
