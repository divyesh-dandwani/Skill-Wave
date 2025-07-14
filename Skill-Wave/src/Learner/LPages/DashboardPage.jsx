import React from 'react';
import { Card } from '../components/ui/card';
import { Video, Code, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon, description }) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  </Card>
);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back to your teaching dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Videos"
          value="24"
          icon={<Video className="h-6 w-6 text-primary" />}
          description="12 videos uploaded this month"
        />
        <StatCard
          title="Coding Challenges"
          value="15"
          icon={<Code className="h-6 w-6 text-primary" />}
          description="5 new challenges this week"
        />
        <StatCard
          title="Upcoming Events"
          value="3"
          icon={<Calendar className="h-6 w-6 text-primary" />}
          description="Next event in 2 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm">New video "Advanced React Patterns" uploaded</p>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">Updated challenge "Algorithm Deep Dive"</p>
              <span className="text-xs text-gray-500">5h ago</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm">Created new event "Web Security Workshop"</p>
              <span className="text-xs text-gray-500">1d ago</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Content</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Video className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">React Hooks Masterclass</p>
                <p className="text-xs text-gray-500">1.2k views • 4.8★</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Code className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Data Structures in TypeScript</p>
                <p className="text-xs text-gray-500">890 views • 4.9★</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}