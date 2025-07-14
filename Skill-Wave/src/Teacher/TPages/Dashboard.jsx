import React, { useEffect, useState } from 'react';
import { Card } from '../TComponents/UI/Card';
import { Video, Code, Calendar, Clock, TrendingUp, BarChart2, Activity, UserCheck, Award, Zap, BookOpen, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../Firebase';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const StatCard = ({ title, value, icon, trend, color }) => {
  const colors = {
    blue: { bg: 'from-blue-50 to-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100', border: 'border-blue-200' },
    purple: { bg: 'from-purple-50 to-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-100', border: 'border-purple-200' },
    green: { bg: 'from-green-50 to-green-100', text: 'text-green-600', iconBg: 'bg-green-100', border: 'border-green-200' },
    amber: { bg: 'from-amber-50 to-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100', border: 'border-amber-200' }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className={`h-full p-6 bg-gradient-to-br ${colors[color].bg} border ${colors[color].border} rounded-2xl shadow-sm hover:shadow-md transition-all`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${colors[color].iconBg} ${colors[color].text}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">{value}</p>
            {/* <p className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p> */}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const ActivityItem = ({ title, time, type }) => {
  const icons = {
    video: <Video className="h-4 w-4 text-blue-500" />,
    challenge: <Code className="h-4 w-4 text-purple-500" />,
    event: <Calendar className="h-4 w-4 text-green-500" />
  };

  const dotColors = {
    video: 'bg-blue-500',
    challenge: 'bg-purple-500',
    event: 'bg-green-500'
  };

  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[type]}`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      <div className="text-gray-400">
        {icons[type]}
      </div>
    </motion.div>
  );
};

const QuickActionButton = ({ icon, label, color, onClick }) => {
  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200',
    amber: 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-3 rounded-xl ${colors[color]} border transition-colors flex flex-col items-center`}
    >
      <div className="p-2 rounded-lg bg-white mb-1">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
};

export default function Dashboard() {
  const [videoCount, setVideoCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const fetchCount = async (collectionName, setter) => {
        const q = query(
          collection(db, collectionName),
          where("user_id", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setter(snapshot.size);
      };

      const fetchRecent = async (collectionName, type) => {
        const titleFieldMap = {
          videos: "video_title",
          challenges: "content_title",
          events: "event_title",
        };

        const q = query(
          collection(db, collectionName),
          where("user_id", "==", currentUser.uid),
          orderBy("upload_date", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
          const data = doc.data();
          const titleField = titleFieldMap[collectionName];
          return {
            title: `${type === 'video' ? 'Video' : type === 'challenge' ? 'Challenge' : 'Event'} "${data[titleField] || 'Untitled'}"`,
            time: new Date(data.upload_date.toDate()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            type
          };
        });
      };

      fetchCount("videos", setVideoCount);
      fetchCount("challenges", setChallengeCount);
      fetchCount("events", setEventCount);

      const videos = await fetchRecent("videos", "video");
      const challenges = await fetchRecent("challenges", "challenge");
      const events = await fetchRecent("events", "event");

      setRecentActivities([...videos, ...challenges, ...events]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5));
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Educator Dashboard
            </h1>
            <p className="text-gray-600">
              Insights and analytics for your teaching content
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <StatCard
            title="Total Videos"
            value={videoCount}
            icon={<Video className="h-5 w-5" />}
            trend={12.5}
            color="blue"
          />
          <StatCard
            title="Coding Challenges"
            value={challengeCount}
            icon={<Code className="h-5 w-5" />}
            trend={8.3}
            color="purple"
          />
          <StatCard
            title="Upcoming Events"
            value={eventCount}
            icon={<Calendar className="h-5 w-5" />}
            trend={4.2}
            color="green"
          />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Activity Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4 md:space-y-6"
          >
            <Card className="p-5 md:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </h2>
                {/* <button className="text-sm text-blue-600 hover:text-blue-500">
                  View All
                </button> */}
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <ActivityItem
                        key={index}
                        title={activity.title}
                        time={activity.time}
                        type={activity.type}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center text-gray-500"
                    >
                      No recent activities found
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Quick Actions */}
            <Card className="p-5 md:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  icon={<Video className="h-5 w-5" />}
                  label="New Video"
                  color="blue"
                  onClick={() => navigate('/teacher/upload-video')}
                />
                <QuickActionButton
                  icon={<Code className="h-5 w-5" />}
                  label="Add Challenge"
                  color="purple"
                  onClick={() => navigate('/teacher/upload-challenge')}
                />
                <QuickActionButton
                  icon={<Calendar className="h-5 w-5" />}
                  label="Schedule Event"
                  color="green"
                  onClick={() => navigate('/teacher/host-event')}
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}