import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../TComponents/UI/Button";
import { Card } from "../TComponents/UI/Card";
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "../../Firebase";
import {
  uploadThumbnailToCloudinary,
  uploadPDFToCloudinary,
} from "../TUploads/Cloudinary";

const eventTypes = [
  "Webinar",
  "Workshop",
  "Seminar",
  "Coding Competition",
  "Hackathon",
];
const organizers = ["Organization", "Community", "College"];

export default function HostEvent() {
  const location = useLocation();
  const propEditData = location.state?.editData || null;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data with proper date handling
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventType: "",
    mode: "Online",
    location: "",
    organizedBy: "",
    registrationClosingDate: "",
    thumbnailURL: null,
    pdfURL: null,
  });

  // Convert Firestore Timestamp or Date to datetime-local string
  const formatDateTimeLocal = (date) => {
    if (!date) return "";

    // Handle Firestore Timestamp
    if (date && typeof date.toDate === "function") {
      date = date.toDate();
    }

    // Handle JavaScript Date
    if (date instanceof Date) {
      const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = new Date(date.getTime() - offset).toISOString();
      return localISOTime.slice(0, 16);
    }

    return "";
  };

  // Initialize form with edit data if available
  useEffect(() => {
    if (propEditData) {
      setFormData({
        title: propEditData.title || "",
        description: propEditData.description || "",
        eventDate: formatDateTimeLocal(propEditData.eventDate),
        eventType: propEditData.eventType || "",
        mode: propEditData.mode || "Online",
        location: propEditData.location || "",
        organizedBy: propEditData.organizedBy || "",
        registrationClosingDate: formatDateTimeLocal(
          propEditData.registrationClosingDate
        ),
        thumbnailURL: propEditData.thumbnailURL || null,
        pdfURL: propEditData.pdfURL || null,
      });
    }
  }, [propEditData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Event name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.eventType) newErrors.eventType = "Event type is required";
    if (!formData.organizedBy) newErrors.organizedBy = "Organizer is required";
    if (!formData.registrationClosingDate)
      newErrors.registrationClosingDate =
        "Registration closing date is required";
    if (formData.mode === "Offline" && !formData.location.trim())
      newErrors.location = "Location is required for offline events";
    if (!formData.thumbnailURL && !propEditData?.thumbnailURL)
      newErrors.thumbnailURL = "Thumbnail is required";

    // Date validation
    if (formData.eventDate && formData.registrationClosingDate) {
      const eventDate = new Date(formData.eventDate);
      const closingDate = new Date(formData.registrationClosingDate);
      if (closingDate >= eventDate) {
        newErrors.registrationClosingDate =
          "Registration must close before the event date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) throw new Error("User data not found in localStorage");

      const parsedUserData = JSON.parse(userData);
      const user_id = parsedUserData.user_id;

      let thumbnailURL = propEditData?.thumbnailURL || "";
      let pdfUrl = propEditData?.pdfURL || "";

      // Upload new files if they exist
      if (formData.thumbnailURL && typeof formData.thumbnailURL !== "string") {
        thumbnailURL = await uploadThumbnailToCloudinary(formData.thumbnailURL);
      }
      if (formData.pdfURL && typeof formData.pdfURL !== "string") {
        pdfUrl = await uploadPDFToCloudinary(formData.pdfURL);
      }

      // Convert form date strings to Date objects
      const eventDate = new Date(formData.eventDate);
      const registrationClosingDate = new Date(
        formData.registrationClosingDate
      );

      const eventData = {
        event_title: formData.title,
        event_description: formData.description,
        event_date: eventDate,
        event_type: formData.eventType,
        user_id: user_id,
        mode: formData.mode,
        location: formData.location,
        organizedBy: formData.organizedBy,
        registrationClosingDate: registrationClosingDate,
        thumbnailURL: thumbnailURL,
        pdfURL: pdfUrl 
      };

      if (propEditData) {
        // Update existing event
        await updateDoc(doc(db, "events", propEditData.id), eventData);
      } else {
        // Create new event
        const docRef = await addDoc(collection(db, "events"), {
          ...eventData,
          upload_date: serverTimestamp(), // Only for new events
        });
        await updateDoc(docRef, { event_id: docRef.id });
      }

      navigate(propEditData ? "/admin/content" : "/events");
    } catch (error) {
      console.error("Error saving event: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(propEditData ? "/admin/content" : "/teacher/events");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {propEditData ? "Edit Event" : "Host a New Event"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Name</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Event Type and Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Type
              </label>
              <select
                required
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.eventType ? "border-red-500" : ""
                }`}
              >
                <option value="">Select event type</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.eventType && (
                <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <select
                required
                value={formData.mode}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Location (only for offline events) */}
          {formData.mode === "Offline" && (
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.location ? "border-red-500" : ""
                }`}
                placeholder="Enter event location"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          )}

          {/* Organized By */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Organized By
            </label>
            <select
              required
              value={formData.organizedBy}
              onChange={(e) =>
                setFormData({ ...formData, organizedBy: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md ${
                errors.organizedBy ? "border-red-500" : ""
              }`}
            >
              <option value="">Select organizer type</option>
              {organizers.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
            {errors.organizedBy && (
              <p className="text-red-500 text-sm mt-1">{errors.organizedBy}</p>
            )}
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.eventDate ? "border-red-500" : ""
                }`}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.eventDate && (
                <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Registration Closing Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.registrationClosingDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationClosingDate: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.registrationClosingDate ? "border-red-500" : ""
                }`}
                min={new Date().toISOString().slice(0, 16)}
                max={formData.eventDate}
              />
              {errors.registrationClosingDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.registrationClosingDate}
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Thumbnail
            </label>
            {formData.thumbnailURL && (
              <img
                src={
                  typeof formData.thumbnailURL === "string"
                    ? formData.thumbnailURL
                    : URL.createObjectURL(formData.thumbnailURL)
                }
                alt="Event thumbnail"
                className="mb-2 h-32 w-32 object-cover rounded-md border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  thumbnailURL: e.target.files ? e.target.files[0] : null,
                })
              }
              className={errors.thumbnailURL ? "border-red-500" : ""}
            />
            {errors.thumbnailURL && (
              <p className="text-red-500 text-sm mt-1">{errors.thumbnailURL}</p>
            )}
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Details PDF
            </label>
            {formData.pdfURL && typeof formData.pdfURL === "string" && (
              <a
                href={formData.pdfURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Current PDF
              </a>
            )}
            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pdfURL: e.target.files ? e.target.files[0] : null,
                })
              }
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleBack}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : propEditData ? (
                "Update Event"
              ) : (
                "Submit Event"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
