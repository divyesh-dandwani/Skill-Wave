import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../Firebase";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar,
  Edit3,
  Trash2,
  MapPin,
  Plus,
  Users,
  X,
  ExternalLink,
  Clock,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../LComponents/UI/Button";
import { Card } from "../LComponents/UI/card";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event, onShowMore, showMenu }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = () => {
    navigate("/teacher/host-event", { state: { editData: event } });
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "events", event.id));
      setShowConfirm(false);
      window.location.reload();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-xl pointer-events-none" />
      )}

      <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={event.thumbnailURL || "/default-event.jpg"}
            alt={event.title}
            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                event.mode === "Online"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-purple-100 text-purple-800 border border-purple-200"
              }`}
            >
              {event.mode}
            </span>
          </div>

          {showMenu && (
            <div>
              <button
                onClick={handleMenuToggle}
                className="absolute top-2 left-2 p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-gray-800"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute top-8 left-2 bg-white shadow-md rounded-lg p-2 w-32">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-blue-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center px-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center relative">
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                  onClick={() => setShowConfirm(false)}
                >
                  <X size={20} />
                </button>
                <h2 className="text-lg font-semibold mb-2">Delete Event</h2>
                <p className="text-gray-600 mb-4">
                  Do you want to delete the event{" "}
                  <strong>"{event.title}"</strong>?
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
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2">
              {event.title}
            </h3>

            <div className="space-y-3 text-gray-600 mb-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Event Date
                  </p>
                  <p className="text-gray-700">
                    {event.eventDate
                      ? format(new Date(event.eventDate), "MMMM d, yyyy")
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Registration Closes
                  </p>
                  <p className="text-gray-700">
                    {event.registrationClosingDate
                      ? format(
                          new Date(event.registrationClosingDate),
                          "MMMM d, yyyy"
                        )
                      : "TBD"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Organized By
                  </p>
                  <p className="text-gray-700">{event.organizedBy}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                event.eventType === "Workshop"
                  ? "bg-orange-100 text-orange-800"
                  : event.eventType === "Conference"
                  ? "bg-blue-100 text-blue-800"
                  : event.eventType === "Webinar"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {event.eventType}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowMore(event)}
              className="group-hover:bg-gray-50 group-hover:border-gray-300 transition-colors"
            >
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const eventsRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const userDataString = localStorage.getItem("userData");
  const userData = JSON.parse(userDataString);
  const role = userData?.role;
  const userId = userData?.user_id;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const fetchedEvents = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.event_title || "Untitled Event",
            description: data.event_description || "",
            thumbnailURL: data.thumbnailURL || "/default-event.jpg",
            eventDate: data.event_date?.toDate?.() || new Date(),
            registrationClosingDate:
              data.registrationClosingDate?.toDate?.() || new Date(),
            organizedBy: data.organizedBy || "",
            mode: data.mode || "Online",
            location: data.location || "",
            eventType: data.event_type || "General",
            pdfURL: data.pdfURL || "",
            userId: data.user_id || "", // Add user_id to the event data
          };
        });
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents); // Initially show all events
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      // Filter out events created by the current user
      const publicEvents = events.filter((event) => event.userId !== userId);
      setFilteredEvents(publicEvents);
    } else if (activeTab === "my" && userId) {
      // Show only events created by the current user
      const myEvents = events.filter((event) => event.userId === userId);
      setFilteredEvents(myEvents);
    }
  }, [activeTab, events, userId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Upcoming Events
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto"
          >
            Discover and join our exciting lineup of workshops, conferences, and
            webinars
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === "my"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              My Events
            </button>
          </div>
        </div>

        {role === "teacher" && (
          <button
            onClick={() => navigate("/teacher/host-event")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 p-2 rounded shadow-md fixed bottom-6 right-6 z-10"
          >
            <Plus className="h-4 w-4" /> Host Event
          </button>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="animate-pulse space-y-4 p-6">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            ref={eventsRef}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onShowMore={setSelectedEvent}
                showMenu={activeTab === "my" && role === "teacher"}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100"
          >
            <div className="mx-auto max-w-md">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "all"
                  ? "No public events available"
                  : "No events created by you"}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "all"
                  ? "There are currently no public events to display"
                  : "You haven't created any events yet"}
              </p>
              {activeTab === "my" && role === "teacher" && (
                <Button onClick={() => navigate("/teacher/host-event")}>
                  <Plus className="h-4 w-4 mr-2" /> Host Your First Event
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Event Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              >
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors z-10"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={selectedEvent.thumbnailURL || "/default-event.jpg"}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h2 className="text-3xl font-bold text-white">
                      {selectedEvent.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedEvent.mode === "Online"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {selectedEvent.mode}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedEvent.eventType === "Workshop"
                            ? "bg-orange-100 text-orange-800"
                            : selectedEvent.eventType === "Conference"
                            ? "bg-blue-100 text-blue-800"
                            : selectedEvent.eventType === "Webinar"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedEvent.eventType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="prose max-w-none text-gray-700 mb-6">
                    <p className="text-lg">{selectedEvent.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-500">
                            Event Date
                          </h4>
                          <p className="text-gray-900">
                            {format(
                              new Date(selectedEvent.eventDate),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-500">
                            Registration Deadline
                          </h4>
                          <p className="text-gray-900">
                            {format(
                              new Date(selectedEvent.registrationClosingDate),
                              "MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-500">
                            Organized By
                          </h4>
                          <p className="text-gray-900">
                            {selectedEvent.organizedBy}
                          </p>
                        </div>
                      </div>

                      {selectedEvent.mode === "Offline" && (
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-500">
                              Location
                            </h4>
                            <p className="text-gray-900">
                              {selectedEvent.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() =>
                        window.open(selectedEvent.pdfURL, "_blank")
                      }
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" /> View Event
                      Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
