import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as toxicity from '@tensorflow-models/toxicity';
import '@tensorflow/tfjs';
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
  Heart,
  Bookmark,
  Share2,
  MoreVertical,
  Reply
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import {
  doc,
  updateDoc,
  increment,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../Firebase";
import { getAuth } from "firebase/auth";

export default function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportTypes, setSelectedReportTypes] = useState([]);
  const [reportReason, setReportReason] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const [toxicityModel, setToxicityModel] = useState(null);
  const [isToxicityModelLoading, setIsToxicityModelLoading] = useState(true);
  const [toxicityResults, setToxicityResults] = useState(null);
  const [showToxicityAlert, setShowToxicityAlert] = useState(false);

  // Get authenticated user
  const auth = getAuth();
  const user = auth.currentUser || JSON.parse(localStorage.getItem("userData")) || {};
  const userId = user?.uid || user?.user_id;
  const userEmail = user?.email;

  // to load the toxicity model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const threshold = 0.6; // Adjust sensitivity (0-1)
        const model = await toxicity.load(threshold);
        setToxicityModel(model);
        setIsToxicityModelLoading(false);
      } catch (error) {
        console.error('Error loading toxicity model:', error);
        setIsToxicityModelLoading(false);
      }
    };

    loadModel();
  }, []);


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
        videoRef.current.controls = !!document.fullscreenElement;
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
    if (!id) return;

    const docRef = doc(db, "videos", id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userRatingEntry = Array.isArray(data.total_ratings)
          ? data.total_ratings.find((r) => r.user_id === userId)
          : null;

        setVideoData({
          id,
          video_title: data.video_title || "Untitled Video",
          video_description: data.video_description || "",
          uploadDate: data.upload_date?.toDate?.() || new Date(),
          category: data.category || "Uncategorized",
          views: data.views || 0,
          like_count: data.like_count || 0,
          bookmarkedUsers: data.bookmarkedUsers || [],
          comments_count: data.comments_count || 0,
          average_rating: data.average_rating || 0,
          total_ratings: data.total_ratings || [],
          reports_count: data.reports_count || 0,
          videoUrl: data.VideoURL || "",
          likedUsers: data.likedUsers || []
        });

        setUserRating(userRatingEntry?.rating || 0);
        setHasLiked(data.likedUsers?.some((u) => u.user_id === userId) || false);
        setHasBookmarked(data.bookmarkedUsers?.some((u) => u.user_id === userId) || false);
      } else {
        console.error("Video not found!");
        setError("Video not found!");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching video:", error);
      setError("Failed to load video data");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, userId]);

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



// Add this toxicity check function
const checkToxicity = async (text) => {
  try {
    if (!toxicityModel) return null;
    
    const predictions = await toxicityModel.classify(text);
    const toxicResults = predictions.filter(p => p.results[0].match);
    
    if (toxicResults.length > 0) {
      return toxicResults.map(r => r.label);
    }
    return null;
  } catch (error) {
    console.error('Error checking toxicity:', error);
    return null;
  }
};



  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
    } else {
      await fetchComments();
    }
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
          likes: doc.data().likes || [],
          hasReplies: doc.data().hasReplies || false
        };

        if (commentData.hasReplies) {
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
        }

        return commentData;
      }));

      setComments(commentsData);
      setShowComments(true);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments");
    }
  };

  const handleLike = async () => {
    if (!videoData?.id || !userId) {
      setError("You must be logged in to like videos");
      return;
    }
  
    // Prevent multiple clicks while processing
    if (isLikeLoading) return;
  
    setIsLikeLoading(true);
    const videoRef = doc(db, "videos", videoData.id);
    const userObject = { user_id: userId, email: userEmail };
  
    try {
      await updateDoc(videoRef, {
        like_count: increment(hasLiked ? -1 : 1),
        likedUsers: hasLiked ? arrayRemove(userObject) : arrayUnion(userObject),
      });
      setHasLiked(!hasLiked);
      setSuccess(hasLiked ? "Removed like" : "Liked video");
    } catch (error) {
      console.error("Error updating like count:", error);
      setError("Failed to update like");
    } finally {
      // Add a small delay even if successful to prevent rapid clicks
      setTimeout(() => setIsLikeLoading(false), 200);
    }
  };

  // const handleBookmark = async () => {
  //   if (!videoData?.id || !userId) {
  //     setError("You must be logged in to bookmark videos");
  //     return;
  //   }

  //   const videoRef = doc(db, "videos", videoData.id);
  //   const userObject = { user_id: userId, email: userEmail };

  //   try {
  //     await updateDoc(videoRef, {
  //       bookmarkedUsers: hasBookmarked ? arrayRemove(userObject) : arrayUnion(userObject),
  //     });
  //     setHasBookmarked(!hasBookmarked);
  //     setSuccess(hasBookmarked ? "Removed bookmark" : "Bookmarked video");
  //   } catch (error) {
  //     console.error("Error updating bookmark:", error);
  //     setError("Failed to update bookmark");
  //   }
  // };

  const calculateAverageRating = (ratingsArray) => {
    if (!ratingsArray || ratingsArray.length === 0) return 0;
    const totalRatingsSum = ratingsArray.reduce(
      (sum, ratingObj) => sum + ratingObj.rating,
      0
    );
    return totalRatingsSum / ratingsArray.length;
  };

  const handleRating = async (ratingValue) => {
    if (!videoData?.id || !userId) {
      setError("You must be logged in to rate videos");
      return;
    }

    const videoRef = doc(db, "videos", videoData.id);
    let updatedRatings = videoData?.total_ratings || [];

    updatedRatings = updatedRatings.filter((r) => r.user_id !== userId);
    updatedRatings.push({
      user_id: userId,
      email: userEmail,
      rating: ratingValue,
    });

    try {
      await updateDoc(videoRef, {
        total_ratings: updatedRatings,
        average_rating: calculateAverageRating(updatedRatings),
      });
      setUserRating(ratingValue);
      setSuccess(`Rated video ${ratingValue} stars`);
    } catch (error) {
      console.error("Error updating rating:", error);
      setError("Failed to update rating");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    if (!userId || !userEmail) {
      setError("You must be logged in to comment");
      return;
    }
  
    // Toxicity check
    let toxicContent = null;
    if (toxicityModel && !isToxicityModelLoading) {
      toxicContent = await checkToxicity(commentText);
      if (toxicContent) {
        console.log("Toxic content detected:", toxicContent);
        setToxicityResults(toxicContent);
        setShowToxicityAlert(true);
        return;
      }
    }
  
    try {
      const commentsRef = collection(db, "videos", id, "comments");
      await addDoc(commentsRef, {
        user_id: userId,
        email: userEmail,
        comment: commentText,
        timestamp: serverTimestamp(),
        likes: [],
        hasReplies: false
      });
  
      const videoRef = doc(db, "videos", videoData.id);
      await updateDoc(videoRef, {
        comments_count: increment(1),
      });
  
      setCommentText("");
      setShowCommentForm(false);
      setSuccess("Comment added successfully");
      await fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment");
    }
  };
  

  const handleReplySubmit = async (commentId) => {
    if (!replyContent.trim()) {
      setError("Reply cannot be empty");
      return;
    }
    if (!userId || !userEmail) {
      setError("You must be logged in to reply");
      return;
    }

    try {
      const repliesRef = collection(db, "videos", id, "comments", commentId, "replies");
      await addDoc(repliesRef, {
        user_id: userId,
        email: userEmail,
        reply: replyContent,
        timestamp: serverTimestamp(),
        isTeacher: false
      });

      const commentRef = doc(db, "videos", id, "comments", commentId);
      await updateDoc(commentRef, {
        hasReplies: true
      });

      setSuccess("Reply added successfully");
      await fetchComments();
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Error adding reply:", error);
      setError("Failed to add reply");
    }
  };

  const handleCheckboxChange = (type) => {
    setSelectedReportTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const handleReportSubmit = async () => {
    if (!selectedReportTypes.length && !reportReason.trim()) {
      setError("Please select a reason or provide details");
      return;
    }
    if (!userId || !userEmail) {
      setError("You must be logged in to report");
      return;
    }

    try {
      const reportRef = collection(db, "videos", id, "reports");
      await addDoc(reportRef, {
        user_id: userId,
        email: userEmail,
        report_type: selectedReportTypes,
        report_reason: reportReason.trim(),
        timestamp: serverTimestamp(),
      });

      const videoRef = doc(db, "videos", id);
      await updateDoc(videoRef, {
        reports_count: increment(1),
      });

      setShowReportModal(false);
      setSelectedReportTypes([]);
      setReportReason("");
      setSuccess("Report submitted successfully");
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Failed to submit report");
    }
  };

  const handleVideoPlay = async () => {
    if (!videoData?.id || hasViewed) return;

    try {
      const videoRef = doc(db, "videos", videoData.id);
      await updateDoc(videoRef, {
        views: increment(1),
      });
      setHasViewed(true);
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          handleVideoPlay();
        }).catch(error => {
          console.error("Error playing video:", error);
          setError("Failed to play video");
        });
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
      containerRef.current.requestFullscreen().catch(err => {
        console.error("Error entering fullscreen:", err);
        setError("Failed to enter fullscreen mode");
      });
    } else {
      document.exitFullscreen();
    }
    setShowControls(true);
  };

  const handleTimeUpdate = (e) => {
    const percent = (e.target.currentTime / e.target.duration) * 100;
    if (percent > 90 && !hasViewed) {
      handleVideoPlay();
    }
  };

  const handleProgressBarClick = (e) => {
    if (!videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
    setShowControls(true);
  };

  const shareVideo = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: videoData?.video_title,
          text: 'Check out this video',
          url: videoData?.videoUrl,
        });
      } else {
        await navigator.clipboard.writeText(videoData?.videoUrl);
        setSuccess('Link copied to clipboard!');
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
        setSuccess('Link copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed:', err);
        setError('Could not share the video');
      }
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

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

  if (!videoData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
          <p className="text-gray-600">{error || "Video not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      ref={containerRef}
    >
      {/* Error/Success Messages */}


      <AnimatePresence>
  {showToxicityAlert && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex flex-col items-start gap-2 max-w-md">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>Your comment contains potentially toxic content:</span>
        </div>
        <ul className="list-disc pl-5">
          {toxicityResults?.map((result, i) => (
            <li key={i}>{result}</li>
          ))}
        </ul>
        <button 
          onClick={() => setShowToxicityAlert(false)}
          className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          I Understand
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>


      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <span>{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            onTimeUpdate={handleTimeUpdate}
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
            <motion.button
  onClick={handleLike}
  disabled={isLikeLoading}
  whileTap={!isLikeLoading ? { scale: 0.95 } : {}}
  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
    hasLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  } ${isLikeLoading ? 'opacity-70' : ''}`}
>
  {isLikeLoading ? (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <Loader2 className="h-5 w-5" />
    </motion.div>
  ) : (
    <>
      <ThumbsUp className={`h-5 w-5 ${hasLiked ? 'fill-blue-600' : ''}`} />
      <span>{videoData?.like_count}</span>
    </>
  )}
</motion.button>
              {/* <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${hasBookmarked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Bookmark className={`h-5 w-5 ${hasBookmarked ? 'fill-purple-600' : ''}`} />
              </button> */}

              <button
                onClick={toggleComments}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{videoData?.comments_count}</span>
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
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Flag className="h-4 w-4" />
                        <span>Report</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Rate this video:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${star <= (userRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                </button>
              ))}
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

          {/* Comment Form */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className={`w-full flex items-center justify-between p-3 rounded-lg ${showCommentForm ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'} transition-colors mb-4`}
            >
              <span className="font-medium">Add a comment</span>
              {showCommentForm ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <AnimatePresence>
              {showCommentForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4">
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Write your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCommentForm(false)}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComment}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-l font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Comments ({videoData?.comments_count || 0})
              </h2>
              <button
                onClick={toggleComments}
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
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="flex items-center gap-1 hover:text-blue-600"
                            >
                              <Reply className="h-4 w-4" />
                              <span>Reply</span>
                            </button>
                          </div>

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

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
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
                    <Flag className="h-5 w-5 text-red-600" />
                    Report Video
                  </h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">
                    Select reason(s):
                  </label>
                  {[
                    "Inappropriate Content",
                    "Copyright Violation",
                    "Misleading Information",
                    "Technical Issues",
                    "Other"
                  ].map((type) => (
                    <div key={type} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={type}
                        checked={selectedReportTypes.includes(type)}
                        onChange={() => handleCheckboxChange(type)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor={type} className="text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">
                    Additional Details (optional):
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="Explain the issue..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="mb-4 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}