import React, { useState, useEffect } from 'react';
import { Card } from '../LComponents/UI/card';
import { Button } from '../LComponents/UI/Button';
import { Loader2, Download, AlertCircle, Check, Search, Sparkles, Rocket, BookOpen, Clock, Award, BarChart2, ChevronRight, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import { collection, doc, setDoc, getDocs, query, where, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../../Firebase';
import { getAuth } from 'firebase/auth';

// Dynamic import for jsPDF
let jsPDF;
if (typeof window !== 'undefined') {
  import('jspdf').then((module) => {
    jsPDF = module.default;
    import('jspdf-autotable').then(() => {});
  });
}

const RoadmapPage = () => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [roadmap, setRoadmap] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState('3 months');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopularTopicsExpanded, setIsPopularTopicsExpanded] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [showSavedRoadmaps, setShowSavedRoadmaps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isSmallMobile = useMediaQuery({ maxWidth: 480 });

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userId = userData?.user_id;

  const popularTopics = [
    'Web Development', 'Data Science', 'Machine Learning', 'Digital Marketing',
    'UI/UX Design', 'Mobile App Development', 'Cloud Computing', 'Cybersecurity',
    'Artificial Intelligence', 'Blockchain', 'DevOps', 'Game Development',
    'Data Engineering', 'Product Management', 'Ethical Hacking', 'Quantum Computing',
    'AR/VR Development', 'Bioinformatics', 'Robotics', 'FinTech'
  ];

  useEffect(() => {
    if (typeof jsPDF !== 'undefined') {
      setPdfReady(true);
    }

    // Load roadmaps when component mounts
    if (userId) {
      loadUserRoadmaps(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (roadmap && userId) {
      saveRoadmapToFirestore();
    }
  }, [roadmap, userId]);

  const loadUserRoadmaps = async (userId) => {
    if (!userId) {
      console.error("No user ID available to load roadmaps");
      return;
    }
  
    setIsLoadingRoadmaps(true);
    setError(null);
  
    try {
      console.log("Loading roadmaps for user:", userId);
      const roadmapsRef = collection(db, 'roadmaps');
      
      // First try the ordered query
      try {
        const q = query(
          collection(db, 'roadmaps'),
          where('userId', '==', userId) // Remove orderBy if not needed
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Found documents:", querySnapshot.docs.length);
  
        const loadedRoadmaps = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedRoadmaps.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
          });
        });
  
        console.log("Loaded roadmaps:", loadedRoadmaps);
        setSavedRoadmaps(loadedRoadmaps);
      } catch (orderByError) {
        console.log("Ordered query failed, falling back to simple query:", orderByError);
        
        // Fallback to simple query without ordering
        const q = query(
          roadmapsRef,
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedRoadmaps = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedRoadmaps.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
          });
        });
        
        // Sort locally
        loadedRoadmaps.sort((a, b) => 
          (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0)
        );
        
        setSavedRoadmaps(loadedRoadmaps);
      }
    } catch (error) {
      console.error("Error loading roadmaps:", error);
      setError({
        title: "Loading Error",
        message: error.message || "Failed to load your saved roadmaps. Please try again later."
      });
    } finally {
      setIsLoadingRoadmaps(false);
    }
  };

  const saveRoadmapToFirestore = async () => {
    if (!roadmap || !userId) return;

    setIsSaving(true);
    setError(null);

    try {
      console.log("Saving roadmap for user:", userId);
      const roadmapsRef = collection(db, 'roadmaps');
      const q = query(
        roadmapsRef,
        where('userId', '==', userId),
        where('title', '==', roadmap.title)
      );
      const querySnapshot = await getDocs(q);

      let docRef;
      if (querySnapshot.empty) {
        docRef = doc(collection(db, 'roadmaps'));
      } else {
        docRef = doc(db, 'roadmaps', querySnapshot.docs[0].id);
      }

      await setDoc(docRef, {
        id: docRef.id,
        userId,
        userEmail: userData?.email || '',
        userName: userData?.name || '',
        roadmap,
        title: roadmap.title,
        topic: roadmap.title.replace(' Learning Roadmap', ''),
        duration: roadmap.estimatedTime,
        progress: calculateProgress(roadmap),
        createdAt: querySnapshot.empty ? serverTimestamp() : querySnapshot.docs[0].data().createdAt,
        updatedAt: serverTimestamp()
      });

      console.log("Roadmap saved successfully");
      setSuccessMessage("Roadmap saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reload roadmaps after saving
      await loadUserRoadmaps(userId);
    } catch (error) {
      console.error('Error saving roadmap:', error);
      setError({
        title: "Saving Error",
        message: error.message || "Failed to save your roadmap. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateProgress = (roadmap) => {
    if (!roadmap?.steps) return 0;
    const completedSteps = roadmap.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / roadmap.steps.length) * 100);
  };

  const loadRoadmap = (selectedRoadmap) => {
    setRoadmap(selectedRoadmap.roadmap);
    setShowSavedRoadmaps(false);
  };

  const deleteRoadmap = async (roadmapId) => {
    try {
      await deleteDoc(doc(db, 'roadmaps', roadmapId));
      setSavedRoadmaps(savedRoadmaps.filter(r => r.id !== roadmapId));
      
      if (roadmap && savedRoadmaps.find(r => r.id === roadmapId)?.roadmap.title === roadmap.title) {
        setRoadmap(null);
      }
      setSuccessMessage("Roadmap deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      setError({
        title: "Deletion Error",
        message: "Failed to delete the roadmap. Please try again."
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!roadmap || typeof jsPDF === 'undefined') return;

    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(24);
    doc.text(roadmap.title, 15, 25);
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    doc.text(`Estimated time: ${roadmap.estimatedTime}`, 15, 35);
    doc.text(roadmap.description, 15, 45);

    let yPosition = 55;
    roadmap.steps.forEach((step, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text(`${index + 1}. ${step.title}`, 15, yPosition);
      yPosition += 10;

      doc.setFillColor(229, 231, 235);
      doc.roundedRect(15, yPosition, 40, 8, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`${step.timeEstimate}`, 20, yPosition + 6);

      const typeColor = step.type === 'foundation' ? [59, 130, 246] :
        step.type === 'core' ? [124, 58, 237] :
          step.type === 'advanced' ? [234, 88, 12] : [5, 150, 105];
      doc.setFillColor(...typeColor.map(c => c + 40));
      doc.roundedRect(60, yPosition, 40, 8, 2, 2, 'F');
      doc.setTextColor(...typeColor);
      doc.text(step.type.charAt(0).toUpperCase() + step.type.slice(1), 65, yPosition + 6);
      yPosition += 12;

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(`Description: ${step.description}`, 15, yPosition);
      yPosition += 10;

      if (step.resources?.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text('Resources:', 15, yPosition);
        yPosition += 7;

        step.resources.forEach(resource => {
          doc.setTextColor(59, 130, 246);
          doc.textWithLink(`- ${resource.title}`, 20, yPosition, { url: resource.url });
          yPosition += 7;
        });
      }

      yPosition += 15;

      if (index < roadmap.steps.length - 1) {
        doc.setDrawColor(229, 231, 235);
        doc.line(15, yPosition - 5, 195, yPosition - 5);
        yPosition += 5;
      }
    });

    doc.save(`${roadmap.title.replace(/\s+/g, '_')}_Roadmap.pdf`);
  };

  const toggleStepCompletion = (stepId) => {
    setRoadmap(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    }));
  };

  const generateRoadmapWithAI = async () => {
    if (!topic.trim()) {
      setError({
        title: "Missing Topic",
        message: "Please enter a learning topic to generate a roadmap"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (10 + Math.random() * 5);
      });
    }, 300);

    try {
      const prompt = `Create a detailed learning roadmap for ${topic} covering ${duration}. 
      Structure it with these phases: Fundamentals, Core Skills, Advanced Techniques, and Specialization. 
      For each phase, provide:
      1. Title (specific to ${topic})
      2. Description (1-2 sentences)
      3. Type (foundation/core/advanced/specialization)
      4. Time estimate for this specific step (e.g., "2 weeks", "1 month", "3 days")
      5. 2-3 specific learning resources with real URLs (title and url)
      Format as JSON with this structure:
      {
        "title": "${topic} Learning Roadmap",
        "description": "Comprehensive learning path for ${topic}",
        "estimatedTime": "${duration}",
        "steps": [
          {
            "title": "...",
            "description": "...",
            "type": "...",
            "timeEstimate": "...",
            "resources": [
              {"title": "...", "url": "..."}
            ]
          }
        ]
      }`;

      const response = await axios({
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "post",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "HTTP-Referer": "https://skillwave.ai",
          "X-Title": "SkillWave AI Roadmap Generator"
        },
        data: {
          model: "deepseek/deepseek-r1:free",
          messages: [{ role: "user", content: prompt }]
        },
        timeout: 30000
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      const result = response.data.choices[0].message.content;

      let parsedRoadmap;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        parsedRoadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(result);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Failed to parse the roadmap data");
      }

      parsedRoadmap.steps = parsedRoadmap.steps.map((step, index) => ({
        ...step,
        id: `step-${index}`,
        completed: false
      }));

      setRoadmap(parsedRoadmap);
    } catch (err) {
      console.error("API Error:", err);
      setError({
        title: "Generation Failed",
        message: err.response?.data?.error?.message ||
          err.message ||
          `Failed to generate roadmap. Please try again later.`
      });

      // Fallback mock data
      setRoadmap({
        title: `${topic} Learning Roadmap`,
        description: `Comprehensive learning path for ${topic}`,
        estimatedTime: duration,
        steps: [
          {
            id: 'step-0',
            title: `Learn ${topic} Fundamentals`,
            description: `Understand the basic concepts and principles of ${topic}`,
            type: 'foundation',
            timeEstimate: '2 weeks',
            completed: false,
            resources: [
              { title: `${topic} Official Documentation`, url: 'https://example.com/docs' },
              { title: `${topic} Tutorial for Beginners`, url: 'https://example.com/tutorial' }
            ]
          },
          {
            id: 'step-1',
            title: `${topic} Core Concepts`,
            description: `Dive deeper into the core features of ${topic}`,
            type: 'core',
            timeEstimate: '3 weeks',
            completed: false,
            resources: [
              { title: `${topic} Intermediate Guide`, url: 'https://example.com/intermediate' },
              { title: `${topic} Best Practices`, url: 'https://example.com/best-practices' }
            ]
          },
          {
            id: 'step-2',
            title: `Advanced ${topic} Techniques`,
            description: `Master advanced concepts and real-world applications of ${topic}`,
            type: 'advanced',
            timeEstimate: '1 month',
            completed: false,
            resources: [
              { title: `${topic} Advanced Course`, url: 'https://example.com/advanced' },
              { title: `${topic} Case Studies`, url: 'https://example.com/case-studies' }
            ]
          },
          {
            id: 'step-3',
            title: `${topic} Specialization`,
            description: `Focus on a specialized area within ${topic} that matches your interests`,
            type: 'specialization',
            timeEstimate: '1.5 months',
            completed: false,
            resources: [
              { title: `${topic} Specialization Paths`, url: 'https://example.com/specializations' },
              { title: `${topic} Community Projects`, url: 'https://example.com/community' }
            ]
          }
        ]
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const filteredPopularTopics = isPopularTopicsExpanded
    ? popularTopics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    : popularTopics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, isMobile ? 5 : 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Saved Roadmaps Section */}
        {userId && (
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border-0">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Roadmaps</h2>
                  <button
                    onClick={() => setShowSavedRoadmaps(!showSavedRoadmaps)}
                    className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    disabled={isLoadingRoadmaps}
                  >
                    {showSavedRoadmaps ? 'Hide' : 'Show All'}
                    <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-transform ${showSavedRoadmaps ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {isLoadingRoadmaps ? (
                  <div className="flex justify-center items-center py-4 sm:py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm sm:text-base">Loading your roadmaps...</span>
                  </div>
                ) : savedRoadmaps.length > 0 ? (
                  <div className={`grid grid-cols-1 ${showSavedRoadmaps ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'} gap-2 sm:gap-3`}>
                    {savedRoadmaps.slice(0, showSavedRoadmaps ? savedRoadmaps.length : 4).map((savedRoadmap) => (
                      <motion.div
                        key={savedRoadmap.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadRoadmap(savedRoadmap)}
                        className={`p-2 sm:p-3 rounded-md sm:rounded-lg cursor-pointer transition-all ${roadmap?.title === savedRoadmap.roadmap.title
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{savedRoadmap.topic}</h3>
                          <div className="flex gap-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap">
                              {savedRoadmap.duration}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRoadmap(savedRoadmap.id);
                              }}
                              className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full hover:bg-red-200 flex items-center"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                            <div
                              className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
                              style={{ width: `${savedRoadmap.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 ml-1 sm:ml-2 whitespace-nowrap">{savedRoadmap.progress}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6 text-sm sm:text-base text-gray-500">
                    No saved roadmaps yet. Generate one to get started!
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full mb-3 sm:mb-4">
            <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm font-semibold">AI-Powered Learning</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Create Your Perfect Learning Roadmap
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
            Transform your learning journey with personalized, step-by-step roadmaps powered by AI
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <Card className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border-0 overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 text-sm sm:text-base"
                    >
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="font-bold">{error.title}</strong>
                        <p className="">{error.message}</p>
                      </div>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 text-sm sm:text-base"
                    >
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="font-bold">Success!</strong>
                        <p className="">{successMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Saving Indicator */}
                {isSaving && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-sm sm:text-base"
                  >
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>Saving your roadmap to the database...</span>
                  </motion.div>
                )}

                {!roadmap ? (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Topic Input */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      <label className="block text-base sm:text-lg font-semibold text-gray-800">
                        What do you want to learn?
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="Enter a learning topic (e.g., React, Python, Digital Marketing)"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 sm:pl-12 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 transition-all duration-200 text-sm sm:text-base"
                        />
                        <div className="absolute left-3 top-2.5 sm:top-3.5 text-gray-400">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        {topic && (
                          <button
                            onClick={() => setTopic('')}
                            className="absolute right-3 top-2.5 sm:top-3.5 text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </motion.div>

                    {/* Duration Selector */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      <label className="block text-base sm:text-lg font-semibold text-gray-800">
                        Learning Duration
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {['1 month', '3 months', '6 months', '1 year'].map((option) => (
                          <motion.button
                            key={option}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDuration(option)}
                            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all flex flex-col items-center ${duration === option
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm'
                              }`}
                          >
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                            <span className="text-xs sm:text-sm">{option}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Popular Topics */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                        <label className="block text-base sm:text-lg font-semibold text-gray-800">
                          Popular Topics
                        </label>
                        <div className="relative w-full sm:w-48">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search topics..."
                            className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md sm:rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          />
                          <Search className="absolute right-2.5 top-2 sm:right-3 sm:top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {filteredPopularTopics.map((popularTopic) => (
                          <motion.button
                            key={popularTopic}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setTopic(popularTopic);
                              setSearchQuery('');
                            }}
                            className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md sm:rounded-lg transition-all flex items-center ${topic === popularTopic
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 shadow-sm'
                              }`}
                          >
                            {popularTopic}
                            {topic === popularTopic && <Check className="h-3 w-3 ml-1" />}
                          </motion.button>
                        ))}
                      </div>
                      {!isPopularTopicsExpanded && popularTopics.length > filteredPopularTopics.length && (
                        <button
                          onClick={() => setIsPopularTopicsExpanded(true)}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          Show more <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      )}
                    </motion.div>

                    {/* Generate Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="pt-1 sm:pt-2"
                    >
                      <Button
                        onClick={generateRoadmapWithAI}
                        disabled={isGenerating || !topic.trim()}
                        size={isSmallMobile ? "sm" : "lg"}
                        className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-base">Generating Your Roadmap...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-base">Generate My Learning Roadmap</span>
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Roadmap Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{roadmap.title}</h2>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                          <div className="bg-blue-100 text-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium flex items-center">
                            <Clock className="h-3 w-3 mr-0.5 sm:mr-1" />
                            {roadmap.estimatedTime}
                          </div>
                          <div className="bg-green-100 text-green-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium flex items-center">
                            <Award className="h-3 w-3 mr-0.5 sm:mr-1" />
                            AI-Generated
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => setRoadmap(null)}
                          size={isSmallMobile ? "sm" : "default"}
                          className="border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                        >
                          Start New
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          disabled={!pdfReady}
                          size={isSmallMobile ? "sm" : "default"}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg text-xs sm:text-sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {pdfReady ? (isSmallMobile ? 'PDF' : 'Download PDF') : 'Preparing PDF...'}
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-700 bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                      {roadmap.description}
                    </p>

                    {/* Progress Tracker */}
                    {roadmap.steps && (
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Your Progress
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-blue-600">
                            {calculateProgress(roadmap)}% Complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 sm:h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${calculateProgress(roadmap)}%`
                            }}
                            transition={{ duration: 1, type: 'spring' }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 sm:mt-2">
                          <span className="text-xs text-gray-500">
                            {roadmap.steps.filter(step => step.completed).length} of {roadmap.steps.length} steps
                          </span>
                          <span className="text-xs text-gray-500">
                            {roadmap.steps.filter(step => step.completed).length === roadmap.steps.length ? 'Completed! 🎉' : 'Keep going!'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Roadmap Steps */}
                    <div className="space-y-4 sm:space-y-6">
                      {roadmap.steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-5 border transition-all duration-200 ${step.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-2 sm:gap-4">
                              {/* Checkbox */}
                              <button
                                onClick={() => toggleStepCompletion(step.id)}
                                className={`flex-shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mt-0.5 sm:mt-1 ${step.completed
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'bg-white border-gray-300 hover:border-blue-500'
                                  }`}
                              >
                                {step.completed && <Check className="h-3 w-3" />}
                              </button>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                    {index + 1}. {step.title}
                                  </h3>
                                  <div className="flex gap-1 sm:gap-2">
                                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${step.type === 'foundation'
                                      ? 'bg-blue-100 text-blue-800'
                                      : step.type === 'core'
                                        ? 'bg-purple-100 text-purple-800'
                                        : step.type === 'advanced'
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}
                                    >
                                      {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                                    </span>
                                    <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium flex items-center">
                                      <Clock className="h-3 w-3 mr-0.5 sm:mr-1" />
                                      {step.timeEstimate}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-4">
                                  {step.description}
                                </p>

                                {step.resources?.length > 0 && (
                                  <div className="space-y-1.5 sm:space-y-2">
                                    <p className="text-xs sm:text-sm font-medium text-gray-800">Resources:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-1.5 sm:gap-2">
                                      {step.resources.map((resource, i) => (
                                        <motion.a
                                          key={i}
                                          whileHover={{ y: -2 }}
                                          whileTap={{ scale: 0.98 }}
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 sm:p-2 rounded-md sm:rounded-lg border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-xs sm:text-sm flex items-start gap-1.5 sm:gap-2 transition-all"
                                        >
                                          <div className="bg-blue-100 p-1 rounded-md text-blue-600 flex-shrink-0">
                                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                                          </div>
                                          <div className="overflow-hidden">
                                            <p className="font-medium text-blue-600 truncate">{resource.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{resource.url}</p>
                                          </div>
                                        </motion.a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Connector line */}
                          {index < roadmap.steps.length - 1 && (
                            <div className={`absolute left-[9px] sm:left-[11px] top-[44px] sm:top-[52px] bottom-[-22px] sm:bottom-[-28px] w-0.5 bg-gray-300 z-0`} />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generating Progress */}
                {isGenerating && (
                  <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-600" />
                        <span className="font-medium text-gray-800 text-sm sm:text-base">
                          Crafting your {topic} learning roadmap...
                        </span>
                      </div>
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">{progress}%</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                      Our AI is analyzing the best learning path for you...
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        {!roadmap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              {
                icon: <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />,
                title: "AI-Powered",
                description: "Our advanced AI creates personalized roadmaps tailored to your goals and timeframe."
              },
              {
                icon: <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />,
                title: "Progress Tracking",
                description: "Track your learning journey with visual progress indicators and completion metrics."
              },
              {
                icon: <Download className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />,
                title: "Exportable",
                description: "Download your roadmap as PDF to keep or share with mentors and peers."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoadmapPage;