import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ComposedChart, Scatter, Legend
} from 'recharts';
import {
  Users, Video, Award, Calendar, Clock, LogOut, Eye,
  ThumbsUp, AlertTriangle, TrendingUp, User, CheckCircle, Code,
  Layout, Cpu, BookOpen, Mic, Terminal
} from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../Firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Custom Card Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex items-center justify-between pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`mt-2 ${className}`}>
    {children}
  </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [userRoleData, setUserRoleData] = useState([]);
  const [videoUploadData, setVideoUploadData] = useState([]);
  const [topVideos, setTopVideos] = useState([]);
  const [reportedVideos, setReportedVideos] = useState([]);
  const [challengeData, setChallengeData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [categoryVideoData, setCategoryVideoData] = useState([]);
  const [challengeTimelineData, setChallengeTimelineData] = useState([]);
  const [eventTimelineData, setEventTimelineData] = useState([]);
  const [eventTypeData, setEventTypeData] = useState([]);

  // Fetch all data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users data
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Process user growth data
        const userGrowth = users.reduce((acc, user) => {
          if (user.dateOfJoining) {
            try {
              const date = new Date(user.dateOfJoining);
              if (!isNaN(date)) {
                const month = date.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
              }
            } catch (e) {
              console.warn('Invalid date format:', user.dateOfJoining);
            }
          }
          return acc;
        }, {});
        setUserGrowthData(Object.entries(userGrowth).map(([month, count]) => ({ month, count })));

        // Process user roles data
        const roleCount = users.reduce((acc, user) => {
          const role = user.role || 'unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});
        setUserRoleData(Object.entries(roleCount).map(([name, value]) => ({ name, value })));

        // Fetch and process videos data
        const videosSnapshot = await getDocs(collection(db, 'videos'));
        const videos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Process video uploads
        const videoUploads = videos.reduce((acc, video) => {
          if (video.upload_date) {
            try {
              // Convert Firestore Timestamp to Date
              const date = video.upload_date.toDate ? video.upload_date.toDate() : new Date(video.upload_date);
              if (!isNaN(date)) {
                const month = date.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
              }
            } catch (e) {
              console.warn('Invalid date format:', video.upload_date);
            }
          }
          return acc;
        }, {});
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sortedVideoUploads = Object.entries(videoUploads)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

        setVideoUploadData(sortedVideoUploads);

        // Get top videos
        const sortedVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        setTopVideos(sortedVideos.map(video => ({
          title: video.video_title,
          views: video.views || 0
        })));

        // Get reported videos
        setReportedVideos(videos.filter(video => (video.report_count || 0) > 0));

        // Process category-wise video count
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categories = await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
          const categoryData = categoryDoc.data();
          const videosInCategory = videos.filter(video => video.category === categoryDoc.id);
          return {
            name: categoryData.name,
            value: videosInCategory.length
          };
        }));
        setCategoryVideoData(categories.filter(cat => cat.value > 0));

        // Fetch and process challenges data
        const challengesSnapshot = await getDocs(collection(db, 'challenges'));
        const challenges = challengesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChallengeData(challenges);

        // Process challenges timeline
        const challengeTimeline = challenges.reduce((acc, challenge) => {
          if (challenge.upload_date) {
            try {
              // Convert Firestore Timestamp to Date
              const date = challenge.upload_date.toDate ? challenge.upload_date.toDate() : new Date(challenge.upload_date);
              if (!isNaN(date)) {
                const month = date.toLocaleString('default', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
              }
            } catch (e) {
              console.warn('Invalid date format in challenge:', challenge.upload_date);
            }
          }
          return acc;
        }, {});
        
        // Sort by month order
        // const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sortedChallengeTimeline = Object.entries(challengeTimeline)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
        
        setChallengeTimelineData(sortedChallengeTimeline);

        // Fetch and process events data
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEventData(events);

        // Process event timeline
        const eventTimeline = events.map(event => {
          try {
            const date = new Date(event.event_date);
            return {
              name: event.event_title,
              date: date,
              formattedDate: date.toLocaleDateString(),
              type: event.event_type || 'Other'
            };
          } catch (e) {
            console.warn('Invalid date format:', event.event_date);
            return null;
          }
        }).filter(event => event !== null).sort((a, b) => a.date - b.date);
        setEventTimelineData(eventTimeline);

        // Process event types distribution
        const eventTypes = events.reduce((acc, event) => {
          const type = event.event_type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        setEventTypeData(Object.entries(eventTypes).map(([name, value]) => ({ name, value })));

        // Set summary stats
        setStats({
          totalUsers: users.length,
          totalVideos: videos.length,
          totalChallenges: challenges.length,
          totalEvents: events.length,
          reportedVideos: videos.filter(v => (v.report_count || 0) > 0).length,
          totalCategories: categories.length
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Custom icons for categories and event types
  const categoryIcons = {
    'Web Development': <Code className="h-4 w-4" />,
    'Machine Learning': <Cpu className="h-4 w-4" />,
    'UI/UX Design': <Layout className="h-4 w-4" />,
    'Data Science': <BookOpen className="h-4 w-4" />
  };

  const eventTypeIcons = {
    'Webinar': <Mic className="h-4 w-4" />,
    'Workshop': <Terminal className="h-4 w-4" />,
    'Hackathon': <Code className="h-4 w-4" />
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalUsers}</div>
            <p className="text-sm text-gray-500 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Videos</CardTitle>
            <Video className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalVideos}</div>
            <p className="text-sm text-gray-500 mt-1">Uploaded videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
            <Award className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalChallenges}</div>
            <p className="text-sm text-gray-500 mt-1">Ongoing challenges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <Calendar className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalEvents}</div>
            <p className="text-sm text-gray-500 mt-1">Scheduled events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reported Videos</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.reportedVideos}</div>
            <p className="text-sm text-gray-500 mt-1">Needs review</p>
          </CardContent>
        </Card>
      </div>

      {/* User and Video Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <CardTitle>Monthly User Growth</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <CardTitle>User Role Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} users`, 'Count']}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Video Uploads */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-green-500" />
              <CardTitle>Monthly Video Uploads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoUploadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Video Uploads"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category-wise Video Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-indigo-500" />
              <CardTitle>Category-wise Video Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryVideoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryVideoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} videos`, 'Count']}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges and Events Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Challenges Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <CardTitle>Challenges Created Per Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={challengeTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              <CardTitle>Event Types Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} events`, 'Count']}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Videos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <CardTitle>Top Videos by Views</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-500 w-6">{index + 1}.</span>
                    <p className="font-medium text-gray-800 line-clamp-1">{video.title}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Eye size={14} /> {video.views}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <CardTitle>Upcoming Events Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventTimelineData.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    {eventTypeIcons[event.type] || <Calendar className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{event.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{event.formattedDate}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reported Videos Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle>Recently Reported Videos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportedVideos.length > 0 ? (
              reportedVideos.slice(0, 5).map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <p className="font-medium text-gray-800 line-clamp-1">{video.video_title}</p>
                  <span className="text-sm font-medium text-red-500 flex items-center gap-1">
                    <AlertTriangle size={14} /> {video.report_count} reports
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reported videos found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;