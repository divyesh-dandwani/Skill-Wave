import axios from "axios";

const CLOUDINARY_CLOUD_NAME = "dakkqbr4g";
const CLOUDINARY_UPLOAD_PRESET = "demo-upload";

// Function to upload video to Cloudinary
export const uploadVideoToCloudinary = async (videoFile) => {
  if (!videoFile) throw new Error("No video file provided");

  const formData = new FormData();
  formData.append("file", videoFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
    formData
  );

  return response.data.secure_url;
};

// Function to upload thumbnail to Cloudinary
export const uploadThumbnailToCloudinary = async (thumbnailFile) => {
  if (!thumbnailFile) throw new Error("No thumbnail file provided");

  const formData = new FormData();
  formData.append("file", thumbnailFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );

  return response.data.secure_url;
};

// Function to upload PDF to Cloudinary
export const uploadPDFToCloudinary = async (pdfFile) => {
  if (!pdfFile) throw new Error("No PDF file provided");

  const formData = new FormData();
  formData.append("file", pdfFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "raw");

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
    formData
  );

  return response.data.secure_url;
};