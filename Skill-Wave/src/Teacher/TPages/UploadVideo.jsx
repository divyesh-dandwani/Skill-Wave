import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileVideo,
  Image,
  X,
  Check,
  ChevronDown,
  Loader2,
  Plus,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { db, useFirebase } from "../../Firebase";
import { useLocation } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  arrayUnion,
} from "firebase/firestore";
import {
  uploadVideoToCloudinary,
  uploadThumbnailToCloudinary,
} from "../TUploads/Cloudinary";

export default function UploadVideo({ onUpdateComplete }) {
  const location = useLocation();
  const propEditData = location.state?.editData || null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    topic: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const { userId } = useFirebase();
  const isEditMode = !!propEditData;

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef);
        const querySnapshot = await getDocs(q);

        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategories(categoriesData);

        // If in edit mode, load the subcategories for the existing category
        if (propEditData?.category) {
          fetchSubcategories(propEditData.category);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [propEditData]);

  // Fetch subcategories when category changes
  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    try {
      const subcategoriesRef = collection(
        db,
        `categories/${categoryId}/subcategories`
      );
      const q = query(subcategoriesRef);
      const querySnapshot = await getDocs(q);

      const subcategoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Dropzone for video
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } =
    useDropzone({
      accept: { "video/*": [".mp4", ".webm", ".ogg"] },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        setVideoFile(acceptedFiles[0]);
        setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
      },
    });

  // Dropzone for thumbnail
  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setThumbnailFile(acceptedFiles[0]);
      setThumbnailPreview(URL.createObjectURL(acceptedFiles[0]));
    },
  });

  useEffect(() => {
    if (propEditData) {
      setTitle(propEditData.video_title || "");
      setDescription(propEditData.description || "");
      setFormData({
        category: propEditData.category || "",
        subcategory: propEditData.subcategory || "",
        topic: propEditData.topic || "",
      });
      if (propEditData.videoUrl) setPreviewUrl(propEditData.videoUrl);
      if (propEditData.thumbnail) setThumbnailPreview(propEditData.thumbnail);
    }
  }, [propEditData]);

  const handleCategoryChange = async (e) => {
    const value = e.target.value;

    if (value === "add-new-category") {
      setShowNewCategory(true);
      setFormData((prev) => ({
        ...prev,
        category: "",
        subcategory: "",
        topic: "",
      }));
    } else {
      setShowNewCategory(false);
      setFormData((prev) => ({
        ...prev,
        category: value,
        subcategory: "",
        topic: "",
      }));
      await fetchSubcategories(value);
    }
  };

  const handleSubcategoryChange = (e) => {
    const value = e.target.value;

    if (value === "add-new-subcategory") {
      setShowNewSubcategory(true);
      setFormData((prev) => ({
        ...prev,
        subcategory: "",
        topic: "",
      }));
    } else {
      setShowNewSubcategory(false);
      setFormData((prev) => ({
        ...prev,
        subcategory: value,
        topic: "",
      }));
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategory,
      });

      // Add the new category to our local state
      setCategories((prev) => [
        ...prev,
        {
          id: docRef.id,
          name: newCategory,
        },
      ]);

      // Select the new category
      setFormData((prev) => ({
        ...prev,
        category: docRef.id,
      }));

      setShowNewCategory(false);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding new category:", error);
    }
  };

  const addNewSubcategory = async () => {
    if (!newSubcategory.trim() || !formData.category) return;

    try {
      const subcategoriesRef = collection(
        db,
        `categories/${formData.category}/subcategories`
      );
      const docRef = await addDoc(subcategoriesRef, {
        name: newSubcategory,
      });

      // Add the new subcategory to our local state
      setSubcategories((prev) => [
        ...prev,
        {
          id: docRef.id,
          name: newSubcategory,
        },
      ]);

      // Select the new subcategory
      setFormData((prev) => ({
        ...prev,
        subcategory: docRef.id,
      }));

      setShowNewSubcategory(false);
      setNewSubcategory("");
    } catch (error) {
      console.error("Error adding new subcategory:", error);
    }
  };

  const addNewTopic = async () => {
    if (!newTopic.trim() || !formData.subcategory) return;

    try {
      const subcategoryRef = doc(
        db,
        `categories/${formData.category}/subcategories/${formData.subcategory}`
      );
      await updateDoc(subcategoryRef, {
        topics: arrayUnion(newTopic),
      });

      // Update local state
      setSubcategories((prev) =>
        prev.map((sub) => {
          if (sub.id === formData.subcategory) {
            return {
              ...sub,
              topics: [...(sub.topics || []), newTopic],
            };
          }
          return sub;
        })
      );

      // Select the new topic
      setFormData((prev) => ({
        ...prev,
        topic: newTopic,
      }));

      setNewTopic("");
    } catch (error) {
      console.error("Error adding new topic:", error);
    }
  };

  // Add this function to extract duration from video file
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        resolve(formatDuration(duration));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const formatDuration = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();

    return hh
      ? `${hh}:${mm.toString().padStart(2, "0")}:${ss
          .toString()
          .padStart(2, "0")}`
      : `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let videoURL = propEditData?.VideoURL || "";
      let thumbnailURL = propEditData?.ThumbnailURL || "";
      let duration = propEditData?.duration || "00:00"; // Default duration
      console.log("Video URL:", videoURL);

      if (videoFile) {
        // Extract duration before uploading
        duration = await getVideoDuration(videoFile);
        videoURL = await uploadVideoToCloudinary(videoFile, (progress) => {
          setUploadProgress(Math.floor(progress * 100));
        });
      }

      if (thumbnailFile) {
        thumbnailURL = await uploadThumbnailToCloudinary(thumbnailFile);
      }

      // Add the topic to the subcategory if it exists
      if (formData.topic && formData.subcategory) {
        const subcategoryRef = doc(
          db,
          `categories/${formData.category}/subcategories/${formData.subcategory}`
        );
        await updateDoc(subcategoryRef, {
          topics: arrayUnion(formData.topic),
        });
      }

      if (isEditMode) {
        const videoRef = doc(db, "videos", propEditData.id);
        await updateDoc(videoRef, {
          video_title: title,
          video_description: description,
          // VideoURL: videoURL,
          // ThumbnailURL: thumbnailURL,
          VideoURL: videoURL || previewUrl, // fallback to existing URL
          ThumbnailURL: thumbnailURL || thumbnailPreview, // same for thumbnail
          category: formData.category,
          subcategory: formData.subcategory,
          topic: formData.topic,
          duration: duration, // Add duration field
          updated_at: serverTimestamp(),
        });
        setShowSuccess(true);
        onUpdateComplete?.();
      } else {
        const docRef = await addDoc(collection(db, "videos"), {
          video_title: title,
          video_description: description || "",
          user_id: userId || null,
          upload_date: serverTimestamp(),
          VideoURL: videoURL,
          ThumbnailURL: thumbnailURL,
          category: formData.category,
          subcategory: formData.subcategory,
          topic: formData.topic,
          duration: duration, // Add duration field
          status: "Active",
          like_count: 0,
          total_ratings: 0,
          average_rating: 0,
          views: 0,
          report_count: 0,
        });

        await updateDoc(doc(db, "videos", docRef.id), {
          video_id: docRef.id,
        });

        setShowSuccess(true);
      }

      setUploadProgress(100);
      setTimeout(() => {
        if (!isEditMode) {
          setTitle("");
          setDescription("");
          setVideoFile(null);
          setThumbnailFile(null);
          setFormData({
            category: "",
            subcategory: "",
            topic: "",
          });
          setPreviewUrl("");
          setThumbnailPreview("");
        }
        setIsUploading(false);
      }, 1500);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video");
      setIsUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setPreviewUrl("");
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {isEditMode ? "Refine Your Masterpiece" : "Share Your Knowledge"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isEditMode
              ? "Polish every detail of your video to perfection"
              : "Upload your video and inspire millions of learners worldwide"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <form className="space-y-8" onSubmit={handleVideoUpload}>
              {/* Title Input */}
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-800">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-3 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Craft a compelling title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description Input */}
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-800">
                  Description
                </label>
                <textarea
                  className="w-full px-5 py-3 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px]"
                  placeholder="Describe your video in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Video Upload */}
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-800">
                  Video Content{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                </label>

                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full aspect-video bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getVideoRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors hover:border-blue-500 cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <input {...getVideoInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-blue-100 rounded-full">
                        <FileVideo className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium text-gray-800">
                          Drag and drop your video file
                        </p>
                        <p className="text-sm text-gray-500">
                          MP4, WebM, or Ogg (max. 2GB)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Select File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-800">
                  Thumbnail Image
                </label>

                {thumbnailPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full aspect-video object-cover bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getThumbnailRootProps()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-colors hover:border-blue-500 cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <input {...getThumbnailInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 bg-purple-100 rounded-full">
                        <Image className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium text-gray-800">
                          Upload a custom thumbnail
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG, or GIF (recommended: 1280x720)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Select Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-800">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={showNewCategory ? "" : formData.category}
                      onChange={handleCategoryChange}
                      className="w-full px-5 py-3 text-lg border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                      <option value="add-new-category">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add new category...
                        </div>
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {showNewCategory && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addNewCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-800">
                    Subcategory
                  </label>
                  <div className="relative">
                    <select
                      value={showNewSubcategory ? "" : formData.subcategory}
                      onChange={handleSubcategoryChange}
                      disabled={!formData.category}
                      className="w-full px-5 py-3 text-lg border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Select a subcategory</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                      {formData.category && (
                        <option value="add-new-subcategory">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add new subcategory...
                          </div>
                        </option>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {showNewSubcategory && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new subcategory name"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addNewSubcategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Topic Input */}
              {/* Topic Input - Changed to Select Dropdown */}
              {formData.subcategory && (
                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-800">
                    Topic
                  </label>
                  <div className="relative">
                    <select
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-3 text-lg border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">Select a topic</option>
                      {subcategories
                        .find((sub) => sub.id === formData.subcategory)
                        ?.topics?.map((topic, index) => (
                          <option key={index} value={topic}>
                            {topic}
                          </option>
                        ))}
                      <option value="add-new-topic">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add new topic...
                        </div>
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {formData.topic === "add-new-topic" && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new topic name"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={addNewTopic}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-lg text-gray-700">
                    <span>Uploading your masterpiece...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-medium text-white transition-all duration-300 ${
                    isUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : isEditMode ? (
                    "Update Video"
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-5 w-5" />
                      Publish Video
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl p-6 max-w-sm border border-green-200 z-50"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {isEditMode ? "Update Successful!" : "Upload Complete!"}
                </h3>
                <p className="text-gray-600">
                  {isEditMode
                    ? "Your video has been updated successfully."
                    : "Your video is now being processed and will be available shortly."}
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
