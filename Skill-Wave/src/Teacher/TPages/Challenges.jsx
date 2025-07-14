import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Edit3, Trash2, MoreVertical, Plus, Code, Download, Check, X, ArrowRight } from 'lucide-react';
import { db } from '../../Firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '../../Firebase';

const ChallengeCard = ({ challenge, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleReadMore = () => setIsExpanded(!isExpanded);
  const shouldShowReadMore = challenge.description.length > 200;

  const handleEdit = () => {
    navigate('/teacher/upload-challenge', { state: { editData: challenge } });
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'challenges', challenge.id));
      onDelete(challenge.id);
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
    setShowMenu(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-xl pointer-events-none" />
      )}

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
        <div className="p-6 h-full flex flex-col">
          {/* Header with menu */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-1">{challenge.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{format(new Date(challenge.uploadDate), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-100"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 text-blue-500" /> 
                      <span>Edit Challenge</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> 
                      <span>Delete Challenge</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Description with read more toggle */}
          <div className="mb-4 flex-1">
            <div className={`text-gray-600 overflow-hidden transition-all duration-300 ${isExpanded ? '' : 'max-h-[72px]'}`}>
              <p className="whitespace-pre-line">{challenge.description}</p>
            </div>
            {shouldShowReadMore && (
              <button
                onClick={toggleReadMore}
                className="text-sm text-blue-600 hover:underline focus:outline-none mt-2"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {challenge.category && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                {challenge.category}
              </span>
            )}
            {challenge.subCategory && (
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                {challenge.subCategory}
              </span>
            )}
            {challenge.topic && (
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                {challenge.topic}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={(e) => {
                if (!challenge.problemStatementUrl) {
                  e.preventDefault();
                  alert("Problem Statement PDF is not available.");
                  return;
                }
                window.open(challenge.problemStatementUrl, '_blank');
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Problem</span>
              <Download className="h-4 w-4 text-gray-400" />
            </button>
            
            <button
              onClick={(e) => {
                if (!challenge.solutionUrl) {
                  e.preventDefault();
                  alert("Solution PDF is not available.");
                  return;
                }
                window.open(challenge.solutionUrl, '_blank');
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Solution</span>
              <Download className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'challenges'));
        const fetchedChallenges = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.content_title || 'Untitled Challenge',
              description: data.content_description || '',
              category: data.category || 'General',
              subCategory: data.subCategory || '',
              topic: data.topic || '',
              uploadDate: data.timestamp?.toDate?.() || new Date(),
              problemStatementUrl: data.problemStatementURL || '',
              solutionUrl: data.solutionURL || '',
              user_id: data.user_id || '',
            };
          })
          .filter(challenge => challenge.user_id === userId);

        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchChallenges();
    }
  }, [userId]);

  const handleDeleteChallenge = (id) => {
    setChallenges((prevChallenges) => prevChallenges.filter((challenge) => challenge.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              My Coding Challenges
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 mt-2"
            >
              Create and manage your programming challenges
            </motion.p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/teacher/upload-challenge')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Upload Challenge</span>
          </motion.button>
        </div>
        
        {/* Challenges grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence>
              {challenges.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {challenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      onDelete={handleDeleteChallenge} 
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
                >
                  <div className="mx-auto max-w-md">
                    <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges created yet</h3>
                    <p className="text-gray-500 mb-6">
                      Get started by uploading your first coding challenge
                    </p>
                    <button
                      onClick={() => navigate('/teacher/upload-challenge')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Upload Challenge</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}