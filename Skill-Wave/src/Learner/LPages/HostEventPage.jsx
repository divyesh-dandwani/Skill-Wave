import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

const eventTypes = [
  'Webinar',
  'Workshop',
  'Seminar',
  'Coding Competition',
  'Hackathon',
];

const organizers = [
  'Organization',
  'Community',
  'College',
];

export default function HostEventPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventType: '',
    mode: 'Online',
    location: '',
    organizedBy: '',
    registrationClosingDate: '',
    thumbnail: null,
    detailsPdf: null,
  });

  const onThumbnailDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
    }
  }, []);

  const onPdfDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, detailsPdf: file }));
    }
  }, []);

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  });

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
    onDrop: onPdfDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 5000));
    clearInterval(interval);
    navigate('/events');
  };

  const validateDates = () => {
    const today = new Date();
    const eventDate = new Date(formData.eventDate);
    const closingDate = new Date(formData.registrationClosingDate);

    return (
      eventDate > today &&
      closingDate > today &&
      closingDate < eventDate
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/events')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Host a New Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Name</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter event name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter event description"
            />
          </div>

          {/* Event Type and Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <select
                required
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select event type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <select
                required
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Location (if offline) */}
          {formData.mode === 'Offline' && (
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter event location"
              />
            </div>
          )}

          {/* Organized By */}
          <div>
            <label className="block text-sm font-medium mb-2">Organized By</label>
            <select
              required
              value={formData.organizedBy}
              onChange={(e) => setFormData({ ...formData, organizedBy: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select organizer type</option>
              {organizers.map(org => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Date</label>
              <input
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Registration Closing Date</label>
              <input
                type="datetime-local"
                required
                value={formData.registrationClosingDate}
                onChange={(e) => setFormData({ ...formData, registrationClosingDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                min={new Date().toISOString().slice(0, 16)}
                max={formData.eventDate}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Event Thumbnail</label>
              <div
                {...getThumbnailRootProps()}
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <input {...getThumbnailInputProps()} />
                {formData.thumbnail ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="max-h-32 mx-auto"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, thumbnail: null });
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload Event Thumbnail</p>
                    <p className="text-xs text-gray-500">JPG, JPEG, or PNG</p>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Event Details PDF</label>
              <div
                {...getPdfRootProps()}
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <input {...getPdfInputProps()} />
                {formData.detailsPdf ? (
                  <div className="relative">
                    <div className="p-4 bg-gray-100 rounded">
                      <p className="text-sm font-medium">{formData.detailsPdf.name}</p>
                      <p className="text-xs text-gray-500">
                        {(formData.detailsPdf.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, detailsPdf: null });
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload Event Details</p>
                    <p className="text-xs text-gray-500">PDF format only</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !validateDates()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Submit Event'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}