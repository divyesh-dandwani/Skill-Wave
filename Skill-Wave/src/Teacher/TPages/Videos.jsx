import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Play,
  ThumbsUp,
  Eye,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  X,
  FileVideo
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../Firebase";
import { useFirebase } from "../../Firebase";

const VideoCard = ({ video, getUserName }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const navigate = useNavigate();

  // Fetch category and subcategory names
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (video.category) {
        try {
          // Fetch category name
          const categoryRef = doc(db, "categories", video.category);
          const categorySnap = await getDoc(categoryRef);
          if (categorySnap.exists()) {
            setCategoryName(categorySnap.data().name);
          }

          // Fetch subcategory name if exists
          if (video.subcategory) {
            const subcategoryRef = doc(db, `categories/${video.category}/subcategories`, video.subcategory);
            const subcategorySnap = await getDoc(subcategoryRef);
            if (subcategorySnap.exists()) {
              setSubcategoryName(subcategorySnap.data().name);
            }
          }
        } catch (error) {
          console.error("Error fetching category data:", error);
        }
      }
    };

    fetchCategoryData();
  }, [video.category, video.subcategory]);

  const handleEdit = () => {
    navigate('/teacher/upload-video', { state: { editData: video } });
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "videos", video.id));
      setShowConfirm(false);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl"
      
      onMouseEnter={() => setIsHovered(true)}
   
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail with play button overlay */}
      <div className="relative pb-[56.25%] bg-gradient-to-br from-blue-50 to-purple-50">
        {video.thumbnail ? (
          <img
            src={imageError ? "/default-thumbnail.jpg" : video.thumbnail}
            alt={video.video_title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <FileVideo className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center"
          >
            <button
              onClick={() => navigate(`/teacher/videos/${video.id}`)}
              className="bg-white/90 hover:bg-white text-blue-600 rounded-full p-4 shadow-lg transform transition-all hover:scale-110"
            >
              <Play size={24} className="pl-1" fill="currentColor" />
            </button>
          </motion.div>
        )}
        
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
          {video.duration || "12:34"}
        </div>
        
        {/* Dropdown Menu */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition" 
              style={{color:'black',backgroundColor:'white'}}
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border z-20">
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <Edit size={14} /> Edit Video
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-500"
                >
                  <Trash2 size={14} /> Delete Video
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowConfirm(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-2">Delete Video</h2>
            <p className="text-gray-600 mb-4">
              Do you want to delete the video <strong>"{video.video_title}"</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video info */}
      <div className="p-5">
        <h3
          className="font-semibold text-xl mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
          onClick={() => navigate(`/teacher/videos/${video.id}`)}
        >
          {video.video_title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          {/* <span className="text-gray-600">{getUserName(video.user_id)}</span> */}
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(video.uploadDate))} ago
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>{video.views || "0"} views</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} />
            <span>{video.likes || "0"} likes</span>
          </div>
        </div>
        
        {/* Category hierarchy */}
        <div className="flex flex-wrap gap-2">
          {categoryName && (
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
              {categoryName}
            </span>
          )}
          {subcategoryName && (
            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
              {subcategoryName}
            </span>
          )}
          {video.topic && (
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
              {video.topic}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Videos() {
 
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useFirebase();

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.displayName || user?.email?.split('@')[0] || "You";
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [usersSnapshot, videosSnapshot] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "videos")),
        ]);

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        const fetchedVideos = videosSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              video_title: data.video_title || "Untitled Video",
              thumbnail: data.ThumbnailURL || null,
              uploadDate: data.upload_date?.toDate() || new Date(),
              category: data.category || null,
              subcategory: data.subcategory || null,
              topic: data.topic || null,
              description: data.video_description || "",
              videoUrl: data.VideoURL || "",
              user_id: data.user_id || "",
              duration: data.duration || "00:00",
              views: data.views || 0,
              likes: data.like_count || 0,
            };
          })
          .filter((video) => video.user_id === userId);

        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  const filteredVideos = videos.filter((video) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      video.video_title?.toLowerCase().includes(searchLower) ||
      video.description?.toLowerCase().includes(searchLower) ||
      video.topic?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Your Videos</h1>
        <div className="relative flex-1 max-w-2xl w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search your videos by title, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="text-gray-600">
          Showing {filteredVideos.length} {filteredVideos.length === 1 ? "video" : "videos"}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Video grid */}
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full"
         
        >
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                getUserName={getUserName}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!isLoading && filteredVideos.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="mx-auto max-w-md">
            <FileVideo className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No videos found" : "You haven't uploaded any videos yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? "Try adjusting your search or filter"
                : "Get started by uploading your first video"}
            </p>
            <button
              onClick={() => window.location.href = '/teacher/upload-video'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}