import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../Firebase"; // Adjust the path based on your project structure
import { MessageCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Support = () => {
  const [reportedVideos, setReportedVideos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [videos, setVideos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportedVideos = async () => {
      try {
        const q = query(
          collection(db, "videos"),
          where("reports_count", ">", 0)
        );
        const querySnapshot = await getDocs(q);
        const videos = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReportedVideos(videos);
      } catch (error) {
        console.error("Error fetching reported videos:", error);
      }
    };

    fetchReportedVideos();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      const querySnapshot = await getDocs(collection(db, "videos"));
      const fetchedVideos = [];
      querySnapshot.forEach((doc) => {
        fetchedVideos.push({ id: doc.id, ...doc.data() });
      });
      setVideos(fetchedVideos);
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      const uniqueUserIds = [...new Set(videos.map((video) => video.user_id))];
      const userDocs = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          return userSnap.exists()
            ? { userId, name: userSnap.data().name }
            : { userId, name: "Unknown User" };
        })
      );

      const nameMap = {};
      userDocs.forEach(({ userId, name }) => {
        nameMap[userId] = name;
      });

      setUserNames(nameMap);
    };

    if (videos.length > 0) {
      fetchUserNames();
    }
  }, [reportedVideos]);

  const handleVideoReports = (videoId) => {
    navigate(`/admin/videos/${videoId}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Reported Videos</h2>
        {/* <div className="flex gap-4">
          <select className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option>All Tickets</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            New Ticket
          </button>
        </div> */}
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded by
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Ratings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportedVideos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {video.video_title}
                        </div>
                        <div className="text-sm text-gray-500">#{video.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {userNames[video.user_id] || "Loading..."}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.upload_date?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.like_count} Likes
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.average_rating}★
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {video.reports_count} Reports
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleVideoReports(video.id)}
                      >
                        View
                      </button>

                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setSelectedVideo(video);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showDeleteModal && selectedVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
                <h2 className="text-lg font-semibold mb-4">
                  Do you really want to delete video{" "}
                  <span className="text-red-600">
                    {selectedVideo.video_title}
                  </span>
                  ?
                </h2>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, "videos", selectedVideo.id));
                        setShowDeleteModal(false);
                        setSelectedVideo(null);
                        setReportedVideos((prev) =>
                          prev.filter((vid) => vid.id !== selectedVideo.id)
                        );
                      } catch (error) {
                        console.error("Error deleting video:", error);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedVideo(null);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
