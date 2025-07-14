import React, { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, ChevronDown, ChevronUp, Search } from "lucide-react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../Firebase";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import UploadVideo from "../../../Teacher/TPages/UploadVideo";

const ContentManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [mobileView, setMobileView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const navigate = useNavigate();
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, activeTab));

      const fetchedData = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let userId;
          let userName = "Unknown Creator";

          if (activeTab === "videos") {
            userId = data.user_id;
          } else if (activeTab === "challenges") {
            userId = data.user_id;
          } else if (activeTab === "events") {
            userId = data.host_id;
          }

          if (userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", userId));
              if (userDoc.exists()) {
                userName = userDoc.data().name || "Unknown Creator";
              }
            } catch (err) {
              console.error("Failed to fetch user name:", err);
            }
          }

          if (activeTab === "videos") {
            return {
              id: docSnap.id,
              title: data.video_title || "Untitled Video",
              creator: userName,
              uploadDate: data.upload_date?.toDate?.().getTime() || 0,
              formattedDate: data.upload_date?.toDate?.().toISOString().split("T")[0] || "Unknown Date",
              like_count: data.like_count || 0,
              average_rating: data.average_rating || 0,
              report_count: data.report_count || 0,
              thumbnail: data.ThumbnailURL || "",
              videoUrl: data.VideoURL || "",
              description: data.video_description || "",
              category: data.category || "",
              subcategory: data.subcategory || "",
              topic: data.topic || "",
              duration: data.duration || "00:00"
            };
          }

          if (activeTab === "challenges") {
            return {
              id: docSnap.id,
              title: data.content_title || "Untitled Challenge",
              creator: userName,
              uploadDate: data.upload_date?.toDate?.().getTime() || 0,
              formattedDate: data.upload_date?.toDate?.().toISOString().split("T")[0] || "Unknown Date",
              description: data.content_description || "No Description",
              problemStatementUrl: data.problemStatementURL || "",  // Changed from thumbnail
              solutionUrl: data.solutionURL || "",
              category: data.category || "General",  // Added to match your working version
              subCategory: data.subCategory || "",   // Added to match your working version
              topic: data.topic || ""                // Added to match your working version
            };
          }
          

          if (activeTab === "events") {
            return {
              id: docSnap.id,
              title: data.event_title || "Untitled Event",
              description: data.event_description || "No Description",
              creator: userName,
              thumbnail: data.thumbnailURL || "",
              pdfURL: data.pdfURL || "",
              eventDate: data.event_date?.toDate?.() || null,  // Date object
              formattedDate: data.event_date?.toDate?.().toISOString().split("T")[0] || "Unknown Date", // Add this line
              registrationClosingDate: data.registrationClosingDate?.toDate?.() || null, // Date object
              eventType: data.event_type || "Unknown Type",
              mode: data.mode || "Online",
              location: data.location || "",
              organizedBy: data.organizedBy || ""
            };
          }


          return {};
        })
      );

      setContent(fetchedData);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort and filter content
  const filteredAndSortedContent = React.useMemo(() => {
    let filteredContent = [...content];

    // Filter by search term
    if (searchTerm) {
      filteredContent = filteredContent.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.creator && item.creator.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort content
    if (sortConfig.key) {
      filteredContent.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredContent;
  }, [content, searchTerm, sortConfig]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, activeTab, id));
      setContent(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // When edit button is clicked for a video
  const handleEditClick = (item) => {
    if (activeTab === "videos") {
      navigate('/admin/edit-video', {
        state: {
          editData: {
            id: item.id,
            video_title: item.title,
            description: item.description || "",
            VideoURL: item.videoUrl,
            ThumbnailURL: item.thumbnail,
            category: item.category || "",
            subcategory: item.subcategory || "",
            topic: item.topic || "",
            duration: item.duration || "00:00",
            thumbnail: item.thumbnail,
            videoUrl: item.videoUrl
          }
        }
      });
    }
    else if (activeTab === "challenges") {
      navigate('/admin/edit-challenge', {
        state: {
          editData: {
            id: item.id,
            title: item.title,
            description: item.description || "",
            problemStatementUrl: item.problemStatementUrl || "",
            solutionUrl: item.solutionUrl || "",
            category: item.category || "General",
            subCategory: item.subCategory || "",
            topic: item.topic || ""
          }
        }
      });
    }
    

    else if (activeTab === "events") {
      navigate('/admin/edit-event', {
        state: {
          editData: {
            id: item.id,
            title: item.title,
            description: item.description || "",
            eventDate: item.eventDate,  // Make sure this is a Date object
            eventType: item.eventType,
            mode: item.mode || "Online",
            location: item.location || "",
            organizedBy: item.organizedBy || "",  // Add this line
            registrationClosingDate: item.registrationClosingDate,  // Make sure this is a Date object
            thumbnail: item.thumbnail || "",
            detailsPdfUrl: item.pdfURL || "",

            // These are for the HostEvent's submit handler
            event_title: item.title,
            event_description: item.description || "",
            event_date: item.eventDate,
            event_type: item.eventType,
            thumbnailURL: item.thumbnail || "",
            pdfURL: item.pdfURL || ""
          }
        }
      });
    }
  };



  // Table headers configuration
  const tableHeaders = {
    videos: [
      { key: 'thumbnail', label: 'Thumbnail', sortable: false },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'creator', label: 'Creator', sortable: true },
      { key: 'uploadDate', label: 'Upload Date', sortable: true },
      { key: 'like_count', label: 'Likes', sortable: true },
      { key: 'average_rating', label: 'Rating', sortable: true },
      { key: 'report_count', label: 'Reports', sortable: true }
    ],
    challenges: [
      { key: 'title', label: 'Title', sortable: true },
      { key: 'creator', label: 'Creator', sortable: true },
      { key: 'category', label: 'Category', sortable: true },
      { key: 'uploadDate', label: 'Upload Date', sortable: true },
      { key: 'problemStatementUrl', label: 'Problem', sortable: false },
      { key: 'solutionUrl', label: 'Solution', sortable: false }
    ],
    events: [
      { key: 'thumbnail', label: 'Thumbnail', sortable: false },
      { key: 'title', label: 'Title', sortable: true },
      { key: 'creator', label: 'Host', sortable: true },
      { key: 'pdfURL', label: 'Details', sortable: false },
      { key: 'eventType', label: 'Type', sortable: true },
      { key: 'eventDate', label: 'Event Date', sortable: true }
    ]
  };



  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Content Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your {activeTab} content
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <div className="flex space-x-2">
            {['videos', 'challenges', 'events'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchTerm('');
                  setSortConfig({ key: null, direction: 'asc' });
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAndSortedContent.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No matching results found' : `No ${activeTab} available`}
            </div>
          ) : mobileView ? (
            // Mobile Cards View
            <div className="divide-y divide-gray-200">
              {filteredAndSortedContent.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    {item.thumbnail && (
                      <div className="flex-shrink-0">
                        <img
                          src={item.thumbnail}
                          alt="Thumbnail"
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 truncate">By {item.creator}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activeTab === 'videos' && `Uploaded: ${item.formattedDate}`}
                        {activeTab === 'challenges' && `Posted: ${item.formattedDate}`}
                        {activeTab === 'events' && `Date: ${item.formattedDate}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders[activeTab].map((header) => (
                      <th
                        key={header.key}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${header.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                          }`}
                        onClick={() => header.sortable && requestSort(header.key)}
                      >
                        <div className="flex items-center">
                          {header.label}
                          {header.sortable && (
                            <span className="ml-1">
                              {sortConfig.key === header.key ? (
                                sortConfig.direction === 'asc' ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )
                              ) : (
                                <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedContent.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {tableHeaders[activeTab].map((header) => {
                        if (header.key === 'thumbnail' && item.thumbnail) {
                          return (
                            <td key={header.key} className="px-6 py-4 whitespace-nowrap">
                              <img
                                src={item.thumbnail}
                                alt="Thumbnail"
                                className="h-10 w-16 object-cover rounded"
                              />
                            </td>
                          );
                        } else if (header.key === 'uploadDate' || header.key === 'eventDate') {
                          return (
                            <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.formattedDate}
                            </td>
                          );
                        } else if ((header.key === 'thumbnail' || header.key === 'pdfURL' || header.key === 'solutionURL' || header.key === 'problemStatementUrl' || header.key === 'solutionUrl') && item[header.key]) {
                          return (
                            <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm">
                              <a
                                href={item[header.key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                View
                              </a>
                            </td>
                          );
                        } else if (header.key === 'average_rating') {
                          return (
                            <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {typeof item.average_rating === 'number' ? item.average_rating.toFixed(1) : '-'}
                            </td>
                          );
                        } else {
                          return (
                            <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item[header.key] || '-'}
                            </td>
                          );
                        }
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Deletion</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-medium">"{deleteTarget.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteTarget.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentManagement;