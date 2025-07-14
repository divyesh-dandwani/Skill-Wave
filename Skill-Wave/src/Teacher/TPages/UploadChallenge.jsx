import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../TComponents/UI/Card";
import { Button } from "../TComponents/UI/Button";
import { Upload, ArrowLeft, Loader2, X, Check } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../Firebase";
import { collection, doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { uploadPDFToCloudinary } from "../TUploads/Cloudinary";

export default function UploadChallenge() {
  const location = useLocation();
  const propEditData = location.state?.editData || null;
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: null,
    solution: null,
  });

  const generateRandomID = (length) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const onDrop = (fileType) => (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, [fileType]: file }));
    }
  };

  useEffect(() => {
    if (propEditData) {
      setFormData({
        title: propEditData.title || "",
        description: propEditData.description || "",
        problemStatement: propEditData.problemStatementUrl || null,
        solution: propEditData.solutionUrl || null,
      });
    }
  }, [propEditData]);

  const {
    getRootProps: getProblemStatementRootProps,
    getInputProps: getProblemStatementInputProps,
  } = useDropzone({
    onDrop: onDrop("problemStatement"),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const {
    getRootProps: getSolutionRootProps,
    getInputProps: getSolutionInputProps,
  } = useDropzone({
    onDrop: onDrop("solution"),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.problemStatement || !formData.solution)
      return alert("Please upload both PDFs");
    setIsLoading(true);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 100 ? 100 : prev + 10));
    }, 500);

    try {
      const userData = localStorage.getItem("userData");
      if (!userData) throw new Error("User data not found in localStorage");

      const parsedUserData = JSON.parse(userData);
      const user_id = parsedUserData.user_id;

      const problemURL = await uploadPDFToCloudinary(formData.problemStatement);
      const solutionURL = await uploadPDFToCloudinary(formData.solution);

      if (propEditData) {
        // Update existing challenge
        const challengeDocRef = doc(db, "challenges", propEditData.id);
        await updateDoc(challengeDocRef, {
          content_title: formData.title,
          content_description: formData.description,
          problemStatementURL: problemURL,
          solutionURL: solutionURL,
          upload_date: serverTimestamp(),
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        // Add new challenge
        const id = generateRandomID(10);
        const challengeDocRef = doc(collection(db, "challenges"), id);
        await setDoc(challengeDocRef, {
          content_id: id,
          content_title: formData.title,
          content_description: formData.description,
          user_id: user_id,
          problemStatementURL: problemURL,
          solutionURL: solutionURL,
          upload_date: serverTimestamp(),
          status: "Active",
        });
        navigate("/teacher/challenges");
      }
    } catch (error) {
      console.error("Error uploading challenge:", error);
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Challenge updated successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/teacher/challenges")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Challenges
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {propEditData ? "Update Coding Challenge" : "Upload Coding Challenge"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Challenge Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter challenge title"
            />
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
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter challenge description"
            />
          </div>

          {/* PDFs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="Problem Statement PDF"
              file={formData.problemStatement}
              setFile={() =>
                setFormData({ ...formData, problemStatement: null })
              }
              getRootProps={getProblemStatementRootProps}
              getInputProps={getProblemStatementInputProps}
            />
            <FileUpload
              label="Solution PDF"
              file={formData.solution}
              setFile={() => setFormData({ ...formData, solution: null })}
              getRootProps={getSolutionRootProps}
              getInputProps={getSolutionInputProps}
            />
          </div>

          {/* Progress Bar */}
          {isLoading && <UploadProgressBar progress={uploadProgress} />}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/teacher/challenges")}
            >
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
                "Update Challenge"
              ) : (
                "Upload Challenge"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function FileUpload({ label, file, setFile, getRootProps, getInputProps }) {
  const isFileObject = file instanceof File;

  const fileName = isFileObject
    ? file.name
    : typeof file === "string"
    ? file.split("/").pop()
    : "";

  const fileSize = isFileObject
    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
    : "";

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="relative">
            <div className="p-4 bg-gray-100 rounded">
              <p className="text-sm font-medium">{fileName}</p>
              {!isFileObject && (
                <a
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline"
                >
                  View PDF
                </a>
              )}
              {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile();
              }}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
        )}
      </div>
    </div>
  );
}

function UploadProgressBar({ progress }) {
  return (
    <motion.div
      className="h-2 bg-blue-600"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5 }}
    />
  );
}