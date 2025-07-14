import React, { useState, useEffect } from 'react';
import { Calendar, Upload, X, Eye, EyeOff, User, Mail, Phone, Home, Cake, Briefcase, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { auth, db } from '../../../Firebase';
import { createUserWithEmailAndPassword, updateEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { uploadThumbnailToCloudinary } from '../../../Teacher/TUploads/Cloudinary';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const commonDesignations = [
  'Senior Trainer',
  'Junior Trainer',
  'Lead Instructor',
  'Assistant Instructor',
  'Subject Matter Expert',
  'Course Coordinator',
];

export function AddUserForm({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    dateOfJoining: '',
    role: 'teacher',
    designation: '',
    profileImage: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    if (location.state?.editMode && location.state?.userData) {
      setIsEditMode(true);
      setEditingUserId(location.state.userData.id);
      setFormData({
        name: location.state.userData.name || '',
        email: location.state.userData.email || '',
        password: location.state.userData.password || '',
        phone: location.state.userData.phone || '',
        address: location.state.userData.address || '',
        dateOfBirth: location.state.userData.dateOfBirth || '',
        dateOfJoining: location.state.userData.dateOfJoining || '',
        role: location.state.userData.role || 'teacher',
        designation: location.state.userData.designation || '',
        profileImage: null,
      });
      if (location.state.userData.profileImage) {
        setImagePreview(location.state.userData.profileImage);
      }
    }
  }, [location.state]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'password':
        if (!isEditMode) {
          if (!value) error = 'Password is required';
          else if (value.length < 6) error = 'Password must be at least 6 characters';
        }
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^\d{10}$/.test(value)) error = 'Phone number must be 10 digits';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        break;
      case 'dateOfBirth':
        if (!value) error = 'Date of birth is required';
        else {
          const dob = new Date(value);
          const today = new Date();
          if (dob >= today) error = 'Date must be in the past';
        }
        break;
      case 'dateOfJoining':
        if (!value) error = 'Date of joining is required';
        break;
      case 'designation':
        if (!value.trim()) error = 'Designation is required';
        break;
      case 'profileImage':
        if (!isEditMode && !value && !imagePreview) error = 'Profile image is required';
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      if (field !== 'profileImage') { // Handle profile image separately
        newErrors[field] = validateField(field, formData[field]);
      }
    });
    
    // Validate profile image
    if (!isEditMode && !formData.profileImage && !imagePreview) {
      newErrors.profileImage = 'Profile image is required';
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
    setActiveField(null);
    
    // Validate the field that just lost focus
    const error = validateField(field, formData[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allFieldsTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        let profileImageUrl = imagePreview;
        if (formData.profileImage) {
          profileImageUrl = await uploadThumbnailToCloudinary(formData.profileImage);
        }

        const userDocRef = doc(db, 'users', editingUserId);
        await setDoc(userDocRef, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          dateOfJoining: formData.dateOfJoining,
          role: formData.role,
          designation: formData.designation,
          profileImage: profileImageUrl,
          updatedAt: new Date(),
        }, { merge: true });

        if (location.state?.userData?.email !== formData.email) {
          const user = auth.currentUser;
          await updateEmail(user, formData.email);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        const userId = userCredential.user.uid;


        let profileImageUrl = '';
        if (formData.profileImage) {
          profileImageUrl = await uploadThumbnailToCloudinary(formData.profileImage);
        }


        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, {
          user_id: userId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          dateOfJoining: formData.dateOfJoining,
          role: formData.role,
          designation: formData.designation,
          profileImage: profileImageUrl || null,
          createdAt: new Date(),
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        if (showSuccess) {
          setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            dateOfBirth: '',
            dateOfJoining: '',
            role: 'teacher',
            designation: '',
            profileImage: null,
          });
          setImagePreview(null);
          setShowSuccess(false);
          if (isEditMode) navigate('/admin/users');
        }
      }, 2000);
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({
        ...errors,
        firebase: error.message || 'Failed to save user. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.match('image.*')) {
        setFormData({ ...formData, profileImage: file });
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result);
        reader.readAsDataURL(file);
        setErrors({ ...errors, profileImage: '' });
      } else {
        setErrors({ ...errors, profileImage: 'Please select a valid image file (JPEG, PNG)' });
      }
    }
  };

  const handleTextChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit User Profile' : 'Create New User'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Update user details below' : 'Fill in all required details to add a new user'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={true ? () => navigate('/admin/users') : onClose}
            className="hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-100"
        >
          <AnimatePresence>
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditMode ? 'Profile Updated!' : 'User Created!'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isEditMode ? 'The user details have been successfully updated.' : 'The new user has been added to the system.'}
                </p>
                <div className="space-x-3">
                  <Button 
                    onClick={() => {
                      setShowSuccess(false);
                      if (isEditMode) navigate('/admin/users');
                    }}
                    className="px-6"
                  >
                    {isEditMode ? 'Return to Users' : 'Add Another'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={true ? () => navigate('/admin/users') : onClose}
                    className="px-6 border-gray-300"
                  >
                    {isEditMode ? 'View All Users' : 'Close'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {errors.firebase && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-red-700">{errors.firebase}</p>
                    </div>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Profile Image Upload */}
                  <div className="col-span-full flex justify-center">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <div className={`w-40 h-40 rounded-full overflow-hidden flex items-center justify-center border-2 border-dashed ${errors.profileImage && touchedFields.profileImage ? 'border-red-400' : 'border-gray-300 hover:border-blue-400'} transition-all cursor-pointer bg-gray-100`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-6">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to upload photo</p>
                            {errors.profileImage && touchedFields.profileImage && (
                              <p className="text-red-500 text-xs mt-1">{errors.profileImage}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        onBlur={() => handleBlur('profileImage')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, profileImage: null });
                            if (!isEditMode) {
                              setErrors({ ...errors, profileImage: 'Profile image is required' });
                            }
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </motion.div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Full Name <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleTextChange(e, 'name')}
                        onFocus={() => setActiveField('name')}
                        onBlur={() => handleBlur('name')}
                        className={`w-full bg-gray-50 border ${errors.name && touchedFields.name ? 'border-red-400' : activeField === 'name' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                        placeholder="John Doe"
                      />
                      {errors.name && touchedFields.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleTextChange(e, 'email')}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => handleBlur('email')}
                        className={`w-full bg-gray-50 border ${errors.email && touchedFields.email ? 'border-red-400' : activeField === 'email' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="john@example.com"
                        disabled={isEditMode}
                      />
                      {errors.email && touchedFields.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Field - Only show for new users */}
                  {!isEditMode && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Password <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleTextChange(e, 'password')}
                          onFocus={() => setActiveField('password')}
                          onBlur={() => handleBlur('password')}
                          className={`w-full bg-gray-50 border ${errors.password && touchedFields.password ? 'border-red-400' : activeField === 'password' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                          placeholder="••••••"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && touchedFields.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                  )}

                  {/* Phone Field */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      Phone Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleTextChange(e, 'phone')}
                        onFocus={() => setActiveField('phone')}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full bg-gray-50 border ${errors.phone && touchedFields.phone ? 'border-red-400' : activeField === 'phone' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                        placeholder="1234567890"
                      />
                      {errors.phone && touchedFields.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      Role <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => handleTextChange(e, 'role')}
                        onFocus={() => setActiveField('role')}
                        onBlur={() => handleBlur('role')}
                        className={`w-full bg-gray-50 border ${errors.role && touchedFields.role ? 'border-red-400' : activeField === 'role' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 pr-8 focus:outline-none transition-all appearance-none`}
                      >
                        <option value="teacher">Teacher</option>
                        <option value="learner">Learner</option>
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Cake className="h-4 w-4 mr-2 text-gray-500" />
                      Date of Birth <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleTextChange(e, 'dateOfBirth')}
                        onFocus={() => setActiveField('dob')}
                        onBlur={() => handleBlur('dateOfBirth')}
                        className={`w-full bg-gray-50 border ${errors.dateOfBirth && touchedFields.dateOfBirth ? 'border-red-400' : activeField === 'dob' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      {errors.dateOfBirth && touchedFields.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  {/* Date of Joining */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Date of Joining <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dateOfJoining}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleTextChange(e, 'dateOfJoining')}
                        onFocus={() => setActiveField('doj')}
                        onBlur={() => handleBlur('dateOfJoining')}
                        className={`w-full bg-gray-50 border ${errors.dateOfJoining && touchedFields.dateOfJoining ? 'border-red-400' : activeField === 'doj' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      {errors.dateOfJoining && touchedFields.dateOfJoining && (
                        <p className="text-red-500 text-xs mt-1">{errors.dateOfJoining}</p>
                      )}
                    </div>
                  </div>

                  {/* Designation with Autocomplete */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-gray-500" />
                      Designation <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        // list="designations"
                        value={formData.designation}
                        onChange={(e) => handleTextChange(e, 'designation')}
                        onFocus={() => setActiveField('designation')}
                        onBlur={() => handleBlur('designation')}
                        className={`w-full bg-gray-50 border ${errors.designation && touchedFields.designation ? 'border-red-400' : activeField === 'designation' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                        placeholder="Select or type designation"
                      />
                      <datalist id="designations">
                        {commonDesignations.map((designation) => (
                          <option key={designation} value={designation} />
                        ))}
                      </datalist>
                      {errors.designation && touchedFields.designation && (
                        <p className="text-red-500 text-xs mt-1">{errors.designation}</p>
                      )}
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="col-span-full space-y-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Home className="h-4 w-4 mr-2 text-gray-500" />
                      Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleTextChange(e, 'address')}
                        onFocus={() => setActiveField('address')}
                        onBlur={() => handleBlur('address')}
                        rows={3}
                        className={`w-full bg-gray-50 border ${errors.address && touchedFields.address ? 'border-red-400' : activeField === 'address' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded-lg px-4 py-2.5 pl-10 focus:outline-none transition-all`}
                        placeholder="Enter full address"
                      />
                      {errors.address && touchedFields.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <motion.div 
                  className="flex justify-end space-x-3 pt-6 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={isEditMode ? () => navigate('/admin/users') : onClose}
                    className="border-gray-300 hover:bg-gray-50 px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 shadow-sm hover:shadow-md transition-shadow bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        {isEditMode ? 'Saving Changes...' : 'Creating User...'}
                      </div>
                    ) : (
                      isEditMode ? 'Save Changes' : 'Create User'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  );
}