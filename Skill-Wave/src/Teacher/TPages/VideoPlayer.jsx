import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Eye,
  MessageSquare,
  ThumbsUp,
  Flag,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  AlertCircle,
  MoreVertical,
  Share2,
  Reply,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../Firebase";

export default function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [activeCommentLikes, setActiveCommentLikes] = useState({});

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format time (seconds to mm:ss)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (videoRef.current) {
        if (document.fullscreenElement) {
          videoRef.current.controls = true;
        } else {
          videoRef.current.controls = false;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isPlaying || isFullscreen) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls, isFullscreen]);

  // Fetch video data
  useEffect(() => {
  
    const fetchVideoData = async () => {
      if (!id) return;

      const docRef = doc(db, "videos", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setVideoData({
          id,
          video_title: data.video_title || "Untitled Video",
          video_description: data.video_description || "",
          uploadDate: data.upload_date?.toDate?.() || new Date(),
          category: data.category || "Uncategorized",
          views: data.views || 0,
          like_count: data.like_count || 0,
          comments_count: data.comments_count || 0,
          average_rating: data.average_rating || 0,
          total_ratings: data.total_ratings || [],
          reports_count: data.reports_count || 0,
          videoUrl: data.VideoURL || "",
        });
      } else {
        console.error("Video not found!");
      }
      setLoading(false);
    };

    fetchVideoData();
  }, [id]);

  // Video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime);
      }
    };
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('click', togglePlayPause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('click', togglePlayPause);
    };
  }, [videoData, isSeeking]);

  const fetchLikedUsers = async () => {
    if (!videoData?.like_count || videoData.like_count === 0) {
      return;
    }

    setLoadingLikes(true);
    try {
      const videoRef = doc(db, "videos", id);
      const videoSnap = await getDoc(videoRef);

      if (videoSnap.exists()) {
        const likedUsersArray = videoSnap.data().likedUsers || [];
        const emails = likedUsersArray.map((user) => user.email);
        setLikedUsers(emails);
        setShowLikes(true);
      }
    } catch (error) {
      console.error("Error fetching liked users:", error);
    }
    setLoadingLikes(false);
  };

  const handleShowRatings = () => {
    if (!videoData?.total_ratings || videoData.total_ratings.length === 0) {
      setRatings([]);
    } else {
      setRatings(videoData.total_ratings);
    }
    setShowRatings(true);
  };

  const fetchComments = async () => {
    if (!id) return;

    try {
      const commentsRef = collection(db, "videos", id, "comments");
      const q = query(commentsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const commentsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const commentData = {
          id: doc.id,
          ...doc.data(),
        };

        // Fetch replies for each comment
        const repliesRef = collection(db, "videos", id, "comments", doc.id, "replies");
        const repliesQuery = query(repliesRef, orderBy("timestamp", "asc"));
        const repliesSnapshot = await getDocs(repliesQuery);

        const replies = repliesSnapshot.docs.map(replyDoc => ({
          id: replyDoc.id,
          ...replyDoc.data(),
        }));

        return {
          ...commentData,
          replies,
        };
      }));

      setComments(commentsData);
      setShowComments(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchReports = async () => {
    if (videoData?.reports_count === 0) {
      return;
    }

    setLoadingReports(true);
    try {
      const reportsRef = collection(db, "videos", id, "reports");
      const reportsSnapshot = await getDocs(reportsRef);

      const reportsList = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReportsData(reportsList);
      setShowReports(true);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
    setLoadingReports(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowControls(true);
    }
  };

  const seek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime += time;
      setShowControls(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    setShowControls(true);
  };

  const handleProgressBarClick = (e) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
    setShowControls(true);
  };

  const handleProgressBarMouseDown = () => {
    setIsSeeking(true);
  };

  const handleProgressBarMouseUp = () => {
    setIsSeeking(false);
  };

  const shareVideo = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: videoData?.video_title,
          text: 'Check out this video on SkillWave',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Could not share the video. Please copy the URL manually.');
      }
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyContent.trim()) return;

    try {
      // Add reply to the comment
      const repliesRef = collection(db, "videos", id, "comments", commentId, "replies");
      await addDoc(repliesRef, {
        email: "teacher@example.com", // Replace with actual teacher email
        reply: replyContent,
        timestamp: serverTimestamp(),
        isTeacher: true
      });

      // Update the comment to show it has replies
      const commentRef = doc(db, "videos", id, "comments", commentId);
      await updateDoc(commentRef, {
        hasReplies: true
      });

      // Refresh comments
      await fetchComments();
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      ref={containerRef}
    >
      {/* Video Player Container */}
      <div className="relative">
        {/* Video Player */}
        <div
          className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'max-w-7xl mx-auto'}`}
          onMouseMove={() => !isFullscreen && setShowControls(true)}
          onMouseLeave={() => !isFullscreen && isPlaying && setShowControls(false)}
        >
          <video
            ref={videoRef}
            className={`w-full ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
            src={videoData?.videoUrl}
            controls={isFullscreen}
            onClick={togglePlayPause}
          />

          {/* Custom Controls (only when not in fullscreen) */}
          {!isFullscreen && (
            <AnimatePresence>
              {(showControls || !isPlaying) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent`}
                >
                  {/* Top Controls */}
                  <div className="flex justify-between items-start p-4">
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={shareVideo}
                        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
                      >
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Center Controls */}
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => seek(-10)}
                      className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hidden sm:block"
                    >
                      <SkipBack className="h-6 w-6" />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8" />
                      )}
                    </button>

                    <button
                      onClick={() => seek(10)}
                      className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all hidden sm:block"
                    >
                      <SkipForward className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Bottom Controls */}
                  <div className="p-4">
                    {/* Progress Bar */}
                    <div
                      className="relative h-1.5 w-full bg-gray-500/50 rounded-full mb-3 cursor-pointer"
                      onClick={handleProgressBarClick}
                      onMouseDown={handleProgressBarMouseDown}
                      onMouseUp={handleProgressBarMouseUp}
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-white text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlayPause}
                          className="flex items-center gap-1"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4" />
                              <span className="hidden sm:inline">Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              <span className="hidden sm:inline">Play</span>
                            </>
                          )}
                        </button>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Video Info Section */}
      {!isFullscreen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Video Title and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {videoData?.video_title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  {formatDistanceToNow(videoData?.uploadDate || new Date())} ago
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{videoData?.views?.toLocaleString()} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>
                    {videoData?.average_rating?.toFixed(1) || 'N/A'}
                    <span className="text-gray-500 ml-1">
                      ({videoData?.total_ratings?.length || 0})
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={fetchLikedUsers}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <ThumbsUp className="h-5 w-5" />
                <span>{videoData?.like_count}</span>
              </button>

              <button
                onClick={fetchComments}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{videoData?.comments_count}</span>
              </button>

              <button
                onClick={fetchReports}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <Flag className="h-5 w-5" />
                <span>{videoData?.reports_count}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {showMoreOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                    >
                      <button
                        onClick={shareVideo}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center gap-2 text-gray-700 mb-4 w-full"
            >
              <span className="font-medium">Description</span>
              {showDescription ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <AnimatePresence>
              {showDescription && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-600 whitespace-pre-line">
                    {videoData?.video_description || "No description available"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {/* Likes Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-500">Likes</h3>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {videoData?.like_count || 0}
              </p>
              <button
                onClick={fetchLikedUsers}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View All
              </button>
            </motion.div>

            {/* Ratings Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-500">Ratings</h3>
                <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                  <Star className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-gray-900">
                  {videoData?.average_rating?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  ({videoData?.total_ratings?.length || 0} ratings)
                </p>
              </div>
              <button
                onClick={handleShowRatings}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View All
              </button>
            </motion.div>

            {/* Reports Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-500">Reports</h3>
                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                  <Flag className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {videoData?.reports_count || 0}
              </p>
              <button
                onClick={fetchReports}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View All
              </button>
            </motion.div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-l font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Comments ({videoData?.comments_count || 0})
              </h2>
              <button
                onClick={() => {
                  if (showComments) {
                    setShowComments(false);
                  } else {
                    fetchComments();
                  }
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                {showComments ? 'Hide' : 'Show'} Comments
                {showComments ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {comment.email || 'Anonymous'}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(comment.timestamp?.toDate()), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{comment.comment}</p>

                          {/* Comment Actions */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                           

                            <button
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="flex items-center gap-1 hover:text-blue-600"
                            >
                              <Reply className="h-4 w-4" />
                              <span>Reply</span>
                            </button>
                          </div>

                          {/* Reply Form */}
                          {replyingTo === comment.id && (
                            <div className="mt-3 pl-4 border-l-2 border-gray-200">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReplySubmit(comment.id)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Post Reply
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Replies Section */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center gap-3 mb-1">
                                    <div className={`p-2 rounded-full ${reply.isTeacher ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                      <User className={`h-4 w-4 ${reply.isTeacher ? 'text-blue-600' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                      <p className={`font-medium ${reply.isTeacher ? 'text-blue-600' : 'text-gray-900'}`}>
                                        {reply.isTeacher ? 'Teacher' : reply.email || 'Anonymous'}
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(reply.timestamp?.toDate()), 'MMM d, yyyy h:mm a')}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-gray-700">{reply.reply}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No comments yet</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {/* Likes Modal */}
        {showLikes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-blue-600" />
                    Liked By
                  </h2>
                  <button
                    onClick={() => setShowLikes(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {loadingLikes ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : likedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <ThumbsUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No likes yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {likedUsers.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-blue-50 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-gray-700">{email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Ratings Modal */}
        {showRatings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Ratings
                  </h2>
                  <button
                    onClick={() => setShowRatings(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {ratings.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No ratings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded-full">
                              <User className="h-4 w-4 text-yellow-600" />
                            </div>
                            <p className="font-medium text-gray-900">
                              {rating.email || 'Anonymous'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{rating.rating}</span>
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-gray-600 text-sm mt-2">
                            "{rating.comment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reports Modal */}

        {showReports && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Flag className="h-5 w-5 text-red-600" />
                    Video Reports
                  </h2>
                  <button
                    onClick={() => setShowReports(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {loadingReports ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : reportsData.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No reports yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportsData.map((report) => (
                      <div
                        key={report.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 rounded-full">
                              <User className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {report.email || 'Anonymous'}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(report.timestamp.seconds * 1000), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            {report.report_type.join(', ')}
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Reason:
                          </p>
                          <p className="text-gray-600">
                            {report.report_reason || 'No reason provided'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}