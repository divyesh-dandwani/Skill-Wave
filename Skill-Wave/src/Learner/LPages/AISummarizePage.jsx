import React, { useState, useEffect } from 'react';
import { Card } from '../LComponents/UI/card';
import { Button } from '../LComponents/UI/Button';
import { Switch } from '../LComponents/UI/switch';
import {
  Bot,
  Loader2,
  Copy,
  CheckCircle2,
  X,
  FileText,
  ListChecks,
  BookOpen,
  AlertCircle,
  Sparkles,
  Languages,
  Code,
  BookHeadphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AISummarizePage() {
  const [topic, setTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    onlyCodes: false,
    onlyTheory: false,
  });
  const [language, setLanguage] = useState('english');
  const [streamedText, setStreamedText] = useState('');
  const [streamComplete, setStreamComplete] = useState(false);
  const [responseType, setResponseType] = useState('');

  const handleClear = () => {
    setTopic('');
    setSummary(null);
    setError(null);
    setStreamedText('');
    setStreamComplete(false);
  };

  const handleCopy = () => {
    if (!summary) return;

    const content = `${summary.title}\n\n${streamedText}${summary.keyPoints
      ? '\n\nKey Points:\n' + summary.keyPoints.map(point => `• ${point}`).join('\n')
      : ''
      }`;

    navigator.clipboard.writeText(content);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const simulateTypingEffect = (text) => {
    setStreamedText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setStreamedText(prev => {
          // Preserve newlines by adding them immediately
          if (text.charAt(i) === '\n') {
            return prev + '\n';
          }
          return prev + text.charAt(i);
        });
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 10);
  };

  const generateSummary = async (type) => {
    if (!topic) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setStreamedText('');
    setStreamComplete(false);
    setResponseType(type);

    // Build the prompt based on selected options
    let additionalPrompt = '';
    if (filters.onlyCodes && filters.onlyTheory) {
      additionalPrompt = 'Include both code examples and conceptual theory';
    } else if (filters.onlyCodes) {
      additionalPrompt = 'Focus only on code examples';
    } else if (filters.onlyTheory) {
      additionalPrompt = 'Focus only on conceptual theory';
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      let prompt = '';
      switch (type) {
        case 'detailed':
          prompt = `Provide a comprehensive explanation about ${topic} in ${language}. ${additionalPrompt}. Include examples, analogies, and practical applications.`;
          break;
        case 'summary':
          prompt = `Give a concise summary about ${topic} in ${language}. ${additionalPrompt}. Focus on key concepts and main points.`;
          break;
        case 'keyPoints':
          prompt = `List the key points about ${topic} in ${language}. ${additionalPrompt}. Use bullet points format.`;
          break;
        default:
          prompt = topic;
      }

      const response = await axios({
        url: "https://openrouter.ai/api/v1/chat/completions",
        method: "post",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "HTTP-Referer": "https://skillwave.ai",
          "X-Title": "SkillWave AI Summarizer"
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
      const cleanText = result.trim();

      // Format the response based on type
      const formattedResponse = {
        title: `${type === 'detailed' ? 'Detailed Explanation' :
          type === 'summary' ? 'Summary' : 'Key Points'} of ${topic}`,
        content: type === 'keyPoints' ? '' : cleanText,
        keyPoints: type === 'keyPoints' ?
          cleanText.split('\n')
            .filter(point => point.trim().length > 0)
            .map(point => point.replace(/^[-•*]\s*/, '')) // Remove bullet characters
          : null
      };

      setSummary(formattedResponse);
      simulateTypingEffect(
        type === 'keyPoints'
          ? formattedResponse.keyPoints.join('\n')
          : formattedResponse.content
      );
    } catch (err) {
      console.error("API Error:", err);
      setError({
        title: "Generation Failed",
        message: err.response?.data?.error?.message ||
          err.message ||
          "Please check your input and try again. If the problem persists, the API may be temporarily unavailable."
      });
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-8 w-8 text-indigo-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI-Powered Topic Summarization
            </h1>
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-gray-600 italic text-sm md:text-base">
            Generate Detailed Explanations, Concise Summaries, or Key Points Instantly!
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="font-bold">{error.title}</strong>
              <span className="block sm:inline"> {error.message}</span>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl p-4 md:p-6 space-y-6 border border-gray-100">
            {/* Input Section */}
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter Topic Name or The Prompt"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all shadow-sm"
              />
              {topic && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Languages className="h-5 w-5" />
                <label className="text-sm font-medium">Language:</label>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:ring-blue-300 focus:border-blue-300 shadow-sm"
              >
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
              </select>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-indigo-50 rounded-lg">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Switch
                  checked={filters.onlyCodes}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyCodes: checked }))}
                  className="data-[state=checked]:bg-blue-500"
                />
                <div className="flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Only Codes</span>
                </div>
              </motion.label>
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Switch
                  checked={filters.onlyTheory}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyTheory: checked }))}
                  className="data-[state=checked]:bg-indigo-500"
                />
                <div className="flex items-center gap-1.5">
                  <BookHeadphones className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Only Theory</span>
                </div>
              </motion.label>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.div whileHover={{ y: -2 }}>
                <Button
                  onClick={() => generateSummary('detailed')}
                  disabled={!topic || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transition-all shadow-md"
                >
                  {isProcessing && responseType === 'detailed' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <BookOpen className="h-4 w-4 mr-2" />
                  )}
                  Detailed
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Button
                  onClick={() => generateSummary('summary')}
                  disabled={!topic || isProcessing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white transition-all shadow-md"
                >
                  {isProcessing && responseType === 'summary' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Summary
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Button
                  onClick={() => generateSummary('keyPoints')}
                  disabled={!topic || isProcessing}
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white transition-all shadow-md"
                >
                  {isProcessing && responseType === 'keyPoints' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ListChecks className="h-4 w-4 mr-2" />
                  )}
                  Key Points
                </Button>
              </motion.div>
            </div>

            {/* Output Section */}
            <div className="relative min-h-[300px] bg-white rounded-lg p-4 md:p-6 shadow-inner border border-gray-100">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Bot className="h-12 w-12 text-blue-500 animate-bounce" />
                  <div className="w-full max-w-xs mt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-sm text-center mt-2 text-gray-600">
                      {progress < 50 ? "Analyzing your request..." :
                        progress < 80 ? "Generating content..." :
                          "Finalizing response..."} {progress}%
                    </p>
                  </div>
                </div>
              ) : summary ? (
                <div className="relative h-full">
                  <button
                    onClick={handleCopy}
                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 border-gray-100"
                  >
                    {summary.title}
                  </motion.h2>
                  {responseType !== 'keyPoints' ? (
                    <div className="text-gray-700 mb-4 whitespace-pre-line">
                      {streamedText.split('\n').map((paragraph, i) => (
                        <React.Fragment key={i}>
                          {paragraph}
                          <br /> {/* Explicit line break after each paragraph */}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-800">Key Points:</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        {streamedText.split('\n')
                          .filter(p => p.trim())
                          .map((point, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="text-gray-700"
                            >
                              {point}
                            </motion.li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <Bot className="h-10 w-10 mb-3 text-gray-300" />
                  <p>Enter a topic and select a generation type to begin</p>
                  <p className="text-sm mt-1">Try "React hooks" or "Machine learning basics"</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Copied Notification */}
        <AnimatePresence>
          {showCopied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 z-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}