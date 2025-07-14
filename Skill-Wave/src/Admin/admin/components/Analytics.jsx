import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

const monthlyData = [
  { name: 'Jan', users: 4000, revenue: 2400, courses: 2400 },
  { name: 'Feb', users: 3000, revenue: 1398, courses: 2210 },
  { name: 'Mar', users: 2000, revenue: 9800, courses: 2290 },
  { name: 'Apr', users: 2780, revenue: 3908, courses: 2000 },
  { name: 'May', users: 1890, revenue: 4800, courses: 2181 },
  { name: 'Jun', users: 2390, revenue: 3800, courses: 2500 },
];

const Analytics = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <select className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>Last Year</option>
        </select>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Analytics */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Analytics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="courses" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-sm font-medium text-gray-500">Total Revenue</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">$24,000</p>
          <div className="text-sm text-green-600 mt-2">+12% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-sm font-medium text-gray-500">Active Users</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">1,234</p>
          <div className="text-sm text-green-600 mt-2">+8% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-sm font-medium text-gray-500">Course Completion</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">85%</p>
          <div className="text-sm text-green-600 mt-2">+5% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-sm font-medium text-gray-500">New Enrollments</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">456</p>
          <div className="text-sm text-red-600 mt-2">-3% from last month</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;