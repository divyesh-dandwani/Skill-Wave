import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Edit3, Trash2, MoreVertical, Code, Plus, Download, ChevronDown } from 'lucide-react';
import { db } from '../../Firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const ChallengeCard = ({ challenge, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'challenges', challenge.id));
      onDelete(challenge.id);
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
    setShowMenu(false);
  };

  const handleSolveClick = (pdfURL) => {
      navigate('/learner/code-editor', { state: { pdfURL } });
  };

  const [isExpanded, setIsExpanded] = useState(false);
const toggleReadMore = () => setIsExpanded(!isExpanded);
const shouldShowReadMore = challenge.description.length > 200; // adjust threshold

  return (
    <motion.div
  layout
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  whileHover={{ y: -2 }}
  className="relative group h-full"
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  <div className="h-full flex flex-col justify-between bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 group-hover:shadow-2xl group-hover:border-gray-200">
    
    {isHovered && (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20 pointer-events-none" />
    )}

    <div className="p-6 flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-xl text-gray-900">{challenge.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(challenge.uploadDate), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Description with toggle */}
      <div className="mb-4">
        <div className={`text-gray-600 overflow-hidden transition-all duration-300 ${isExpanded ? '' : 'max-h-[72px]'}`}>
          <p className="whitespace-pre-line">{challenge.description}</p>
        </div>
        {challenge.description.length > 200 && (
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
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
          {challenge.category}
        </span>
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

      {/* Action Buttons */}
      <div className="mt-auto">
        <div className="flex justify-between mb-4 gap-2">
          <button
            onClick={() => {
              if (!challenge.problemStatementUrl) {
                alert("Problem Statement PDF is not available.");
                return;
              }
              window.open(challenge.problemStatementUrl, '_blank');
            }}
            className="w-1/2 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Problem</span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>

          <button
            onClick={() => {
              if (!challenge.solutionUrl) {
                alert("Solution PDF is not available.");
                return;
              }
              window.open(challenge.solutionUrl, '_blank');
            }}
            className="w-1/2 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Solution</span>
            <Download className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <button
          onClick={() => handleSolveClick(challenge.problemStatementUrl)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-md transition-all hover:from-blue-700 hover:to-blue-600"
        >
          <Code className="h-5 w-5" />
          <span className="font-medium">Solve Challenge</span>
        </button>
      </div>
    </div>
  </div>
</motion.div>

  );
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
          });

        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const handleDeleteChallenge = (id) => {
    setChallenges((prevChallenges) => prevChallenges.filter((challenge) => challenge.id !== id));
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.category.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coding Challenges</h1>

          </div>


        </div>

        {/* Filters */}


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
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
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
              {filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onDelete={handleDeleteChallenge}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
                >
                  <div className="mx-auto max-w-md">
                    <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
                    <p className="text-gray-500 mb-6">
                      {filter === 'all'
                        ? "You haven't created any challenges yet."
                        : `No challenges found in the ${filter} category.`}
                    </p>
                    <button
                      onClick={() => navigate('/upload-challenge')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all hover:from-blue-700 hover:to-blue-600"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Upload Your First Challenge</span>
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