import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../../Firebase";
import {
  Video,
  Code,
  Settings,
  Calendar,
  Bot,
  Map,
  User,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  X,
  Home,
  Bookmark,
  HelpCircle,
} from "lucide-react";
import ChatBot from "../../../chatbot/ChatBot";

const navItems = [

  { icon: Video, label: "Videos", path: "/learner/videos" },
  { icon: Code, label: "Skill Code Z", path: "/learner/challenges" },

  { icon: Calendar, label: "Events", path: "/learner/events" },
  { icon: Bot, label: "AI Summarization", path: "/learner/ai-summarize" },
  { icon: Map, label: "Roadmap", path: "/learner/roadmap" },
  { icon: Settings, label: "Preferences", path: "/learner/preferences" },

];

export default function DashboardLayout1({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatBot, setChatBot] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          name: authUser.displayName || userData.name || "User",
          profileImage: authUser.photoURL || userData.profileImage,
          preferences: userData.preferences || { topics: [] },
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("userData");
      navigate("/home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 bg-blue-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white"
      >
        <Menu size={24} />
      </button>
      

      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden md:flex fixed h-screen z-30
          ${sidebarOpen ? "w-72" : "w-24"} 
          bg-white/90 backdrop-blur-md shadow-xl border-r border-gray-200/50
          transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-6 mb-2">
          {sidebarOpen && (
            <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
              SkillWave
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100/50 transition-all"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu size={24} className="text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl transition-all
                hover:bg-blue-50/50 text-gray-700 relative overflow-hidden
                ${isCurrentPath(item.path) ? "bg-blue-50 text-blue-600 font-medium" : ""}
                ${sidebarOpen ? "justify-start" : "justify-center"}
                group
              `}
            >
              {isCurrentPath(item.path) && (
                <span className="absolute left-0 w-1.5 h-8 bg-blue-600 rounded-r-full"></span>
              )}
              <div className={`p-2 rounded-lg ${isCurrentPath(item.path) ? "bg-blue-100" : "bg-gray-100"} group-hover:bg-blue-100 transition-colors`}>
                <item.icon size={20} className={`flex-shrink-0 ${isCurrentPath(item.path) ? "text-blue-600" : "text-gray-600"}`} />
              </div>
              {sidebarOpen && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200/50 space-y-2">
          <button
            onClick={() => setIsProfileOpen(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors
              hover:bg-gray-100/50
              ${sidebarOpen ? "justify-start" : "justify-center"}
              group
            `}
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
              <User size={20} className="text-gray-600" />
            </div>
            {sidebarOpen && <span>Profile</span>}
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors
              text-red-600 hover:bg-red-50/50
              ${sidebarOpen ? "justify-start" : "justify-center"}
              group
            `}
          >
            <div className="p-2 rounded-lg bg-red-100/50 group-hover:bg-red-200/50 transition-colors">
              <LogOut size={20} />
            </div>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl animate-slide-in">
            <div className="p-6 flex justify-between items-center border-b border-gray-200">
              <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SkillWave
              </h1>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl transition-all
                    hover:bg-blue-50 text-gray-700 relative
                    ${isCurrentPath(item.path) ? "bg-blue-50 text-blue-600 font-medium" : ""}
                  `}
                >
                  {isCurrentPath(item.path) && (
                    <span className="absolute left-0 w-1.5 h-8 bg-blue-600 rounded-r-full"></span>
                  )}
                  <div className={`p-2 rounded-lg ${isCurrentPath(item.path) ? "bg-blue-100" : "bg-gray-100"}`}>
                    <item.icon size={20} className={isCurrentPath(item.path) ? "text-blue-600" : "text-gray-600"} />
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center gap-4 p-4">
                <img
                  src={user?.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`
          flex-1 min-h-screen
          transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]
          ${sidebarOpen ? "md:ml-72" : "md:ml-24"}
        `}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md shadow-sm p-4 flex items-center justify-between border-b border-gray-200/50" style={{ backgroundColor: 'transparent' }}>
  <div className="flex items-center gap-4">
    <button
      onClick={() => setChatBot(!chatBot)}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 hover:from-purple-100 hover:to-indigo-100 transition-all shadow-sm"
    >
      <div className="relative">
        <Bot size={20} />
        {/* Active indicator */}
        {location.pathname === "/learner/ai-assistant" && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>
      <span>AI Assistant</span>
    </button>
  </div>

  <div
    className="flex items-center gap-3 cursor-pointer group"
    onClick={() => setIsProfileOpen(true)}
  >
    <div className="text-right">
      <p className="text-sm font-medium text-gray-700">{user?.name}</p>
      <p className="text-xs text-gray-500">Learner</p>
    </div>
    <div className="relative">
      <img
        src={user?.profileImage}
        alt="Profile"
        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
      />
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
    </div>
    <ChevronDown size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
  </div>
</header>

        {/* Page Content */}
        <div className="p-6 md:p-8">{children}</div>
      </main>
                {
                  chatBot && <ChatBot onClose={() => setChatBot(false)}/>
                }
      {/* Profile Modal */}
      

      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-200/50 overflow-hidden">
            <button
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 w-full"></div>
            
            <div className="px-6 pb-8 -mt-16">
              <div className="flex justify-center">
                <img
                  src={user?.profileImage}
                  alt={user?.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
              </div>
              
              <div className="text-center mt-6">
                <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500 mt-1">{user?.email}</p>
                
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  
                </div>
                
                {user?.preferences?.topics?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Learning Interests</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {user.preferences.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border border-gray-200/50">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center p-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <LogOut size={24} className="text-red-600" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">Logout?</h2>
              <p className="mt-2 text-gray-500">
                Are you sure you want to sign out?
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}