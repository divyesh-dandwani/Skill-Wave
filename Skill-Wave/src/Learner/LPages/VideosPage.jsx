import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Play, ThumbsUp, Eye, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase";
import { useFirebase } from "../../Firebase";

const VideoCard = ({ video, getUserName }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const navigate = useNavigate();

  // Fetch category and subcategory names
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (video.category) {
        try {
          const categoryRef = doc(db, "categories", video.category);
          const categorySnap = await getDoc(categoryRef);
          if (categorySnap.exists()) {
            const category = categorySnap.data().name;
            setCategoryName(category);
          }

          if (video.subcategory) {
            const subcategoryRef = doc(
              db,
              `categories/${video.category}/subcategories`,
              video.subcategory
            );
            const subcategorySnap = await getDoc(subcategoryRef);
            if (subcategorySnap.exists()) {
              const subcategory = subcategorySnap.data().name;
              setSubcategoryName(subcategory);
            }
          }
        } catch (error) {
          console.error("Error fetching category data:", error);
        }
      }
    };

    fetchCategoryData();
  }, [video.category, video.subcategory]);

  // // Log when categoryName changes
  // useEffect(() => {
  //   console.log("Updated Category Name: ", categoryName);
  // }, [categoryName]); // This runs whenever `categoryName` changes

  // // Log when subcategoryName changes
  // useEffect(() => {
  //   console.log("Updated Subcategory Name: ", subcategoryName);
  // }, [subcategoryName]); // This runs whenever `subcategoryName` changes

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
        <img
          src={imageError ? "/default-thumbnail.jpg" : video.thumbnail}
          alt={video.video_title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center"
          >
            <button
              onClick={() => navigate(`/learner/videos/${video.id}`)}
              className="bg-white/90 hover:bg-white text-blue-600 rounded-full p-4 shadow-lg transform transition-all hover:scale-110"
            >
              <Play size={24} className="pl-1" fill="currentColor" />
            </button>
          </motion.div>
        )}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-md">
          {video.duration || "12:34"}
        </div>
      </div>

      {/* Video info */}
      <div className="p-4">
        <h3
          className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
          onClick={() => navigate(`/learner/videos/${video.id}`)}
        >
          {video.video_title}
        </h3>
        <span className="font-medium">{getUserName(video.user_id)}</span>
        <div className="flex items-center gap-2 mb-3">
          <span>•</span>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(video.uploadDate))} ago
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye size={16} />
            <span>{video.views || "1.2K"} views</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} />
            <span>{video.likes || "245"} likes</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all");
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [preferredSubcategories, setPreferredSubcategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [subcategoryNames, setSubcategoryNames] = useState({});
  const { userId } = useFirebase();

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.email || "Unknown User";
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch users and videos in parallel
        const [usersSnapshot, videosSnapshot] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "videos")),
        ]);

        // Process users data
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        // Process videos data with new structure
        const fetchedVideos = videosSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            video_title: data.video_title || "Untitled Video",
            thumbnail: data.ThumbnailURL || "/default-thumbnail.jpg",
            uploadDate: data.upload_date?.toDate() || new Date(),
            category: data.category || null,
            subcategory: data.subcategory || null,
            topic: data.topic || null,
            description: data.video_description || "",
            videoUrl: data.VideoURL || "",
            user_id: data.user_id || "",
            duration: data.duration || "12:34",
            views: data.views || "0",
            likes: data.like_count || "0",
          };
        });
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPreferences = async () => {
      if (!userId) return;
      try {
        const docRef = doc(
          db,
          "users",
          userId,
          "preferences",
          "userPreferences"
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const prefs = docSnap.data();
          setPreferredCategories(prefs.category ? [prefs.category] : []);
          setPreferredSubcategories(
            prefs.subcategory ? [prefs.subcategory] : []
          );
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    fetchAllData();
    if (viewMode === "preferences") fetchPreferences();
  }, [userId, viewMode]);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());
  
    if (viewMode === "preferences") {
      return (
        matchesSearch &&
        preferredCategories.includes(video.category) &&
        preferredSubcategories.includes(video.subcategory)
      );
    }
  
    return matchesSearch;
  });
  
  const categoryOnlyVideos =
    viewMode === "preferences"
      ? videos.filter((video) => {
          const matchesSearch =
            video.video_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description?.toLowerCase().includes(searchQuery.toLowerCase());
  
          return (
            matchesSearch &&
            preferredCategories.includes(video.category) &&
            !preferredSubcategories.includes(video.subcategory)
          );
        })
      : [];  

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-2xl w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search videos by title, category, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-xl transition-all ${
              viewMode === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Videos
          </button>
          <button
            onClick={() => setViewMode("preferences")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              viewMode === "preferences"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            disabled={!userId}
            title={!userId ? "Sign in to use preferences" : ""}
          >
            <Filter size={16} />
            My Preferences
          </button>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="text-gray-600">
          Showing {filteredVideos.length}{" "}
          {filteredVideos.length === 1 ? "video" : "videos"}
          {viewMode === "preferences" && " based on your preferences"}
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
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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

      {viewMode === "preferences" && categoryOnlyVideos.length > 0 && (
        <div className="space-y-4 pt-10">
          <h2 className="text-xl font-semibold text-gray-800">
            You might also interested in
          </h2>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {categoryOnlyVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                getUserName={getUserName}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredVideos.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          {viewMode === "preferences" ? (
            <>
              <div className="text-gray-400 mb-4">
                No videos match your preferences
              </div>
              <button
                onClick={() => setViewMode("all")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Videos
              </button>
            </>
          ) : (
            <>
              <div className="text-gray-400 mb-4">No videos found</div>
              <div className="text-gray-500">
                Try adjusting your search or filters
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
