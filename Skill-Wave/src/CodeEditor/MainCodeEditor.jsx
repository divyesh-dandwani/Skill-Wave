import { useRef, useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { useLocation } from "react-router-dom";
import { executeCode } from "../api";
import { LANGUAGE_VERSIONS, CODE_SNIPPETS } from "../constants";

export default function MainCodeEditor() {
  // Refs
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const dividerRef = useRef(null);
  
  // Router location
  const location = useLocation();
  const { pdfURL } = location.state || {};

  // State management
  const [value, setValue] = useState(CODE_SNIPPETS.javascript);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [pdfWidth, setPdfWidth] = useState(50); // Percentage width for PDF viewer

  // Available languages
  const languages = Object.entries(LANGUAGE_VERSIONS);

  // Track window size for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  // Set up drag handler for the divider
  useEffect(() => {
    if (isMobile || !pdfURL) return;

    const divider = dividerRef.current;
    if (!divider) return;

    const container = containerRef.current;
    const minWidth = 20; // Minimum PDF width percentage
    const maxWidth = 80; // Maximum PDF width percentage

    const handleMouseDown = (e) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      let newWidth = (mouseX / containerWidth) * 100;

      // Constrain within min/max bounds
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setPdfWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    divider.addEventListener('mousedown', handleMouseDown);
    return () => {
      divider.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMobile, pdfURL]);

  // Editor handlers
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onLanguageSelect = (lang) => {
    setLanguage(lang);
    setValue(CODE_SNIPPETS[lang]);
    setIsLanguageDropdownOpen(false);
  };

  // Code execution
  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      setIsError(!!result.stderr);
    } catch (error) {
      console.error(error);
      setOutput([`Error: ${error.message || "Unable to run code"}`]);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dynamic heights for responsive layout
  const getEditorHeight = () => {
    if (isMobile) {
      return '60vh';
    }
    return '100%';
  };

  const getOutputHeight = () => {
    if (isMobile) {
      return '20vh';
    }
    return '30vh';
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 p-2 sm:p-4 md:p-6"
      ref={containerRef}
    >
      {/* Main Editor Container */}
      <div className="max-w-7xl mx-auto bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-700/50">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 bg-gray-900/80 border-b border-gray-700/50">
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
            <span className="hidden sm:inline">SkillWave</span> Code Editor
          </h1>

          {/* Language Selector */}
          <div className="relative z-20">
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700/80 rounded-lg transition-all border border-gray-700/50"
            >
              <span className="text-sm sm:text-base">{language}</span>
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl z-50 border border-gray-700/50 overflow-hidden">
                {languages.map(([lang, version]) => (
                  <button
                    key={lang}
                    onClick={() => onLanguageSelect(lang)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors flex justify-between items-center text-sm sm:text-base ${lang === language ? 'bg-gray-700/50 text-blue-400' : 'text-gray-300'
                      }`}
                  >
                    <span className="truncate">{lang}</span>
                    <span className="text-xs text-gray-400 ml-2">{version}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex flex-col lg:flex-row" style={{ height: isMobile ? 'auto' : `calc(${windowSize.height}px - 180px)` }}>
          {/* PDF Viewer Section */}
          {pdfURL && (
            <>
              <div
                className={`hidden lg:flex flex-col`}
                style={{ width: `${pdfWidth}%` }}
              >
                <div className="p-2 bg-gray-800/80 border-b border-gray-700/50">
                  <span className="text-xs sm:text-sm font-medium">PDF Reference</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    src={pdfURL}
                    className="w-full h-full"
                    title="PDF Viewer"
                  />
                </div>
              </div>

              {/* Divider */}
              <div
                ref={dividerRef}
                className="hidden lg:block w-1 bg-gray-700/50 hover:bg-blue-500/80 cursor-col-resize transition-colors"
              />

              {/* Code Editor Section */}
              <div
                className={`flex flex-col`}
                style={{ width: isMobile ? '100%' : `${100 - pdfWidth}%` }}
              >
                {/* Editor */}
                <div
                  className="flex-1 overflow-hidden"
                  style={{ height: getEditorHeight() }}
                >
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={language}
                    defaultValue={CODE_SNIPPETS[language]}
                    onMount={onMount}
                    value={value}
                    onChange={(value) => setValue(value)}
                    options={{
                      minimap: { enabled: false },
                      fontSize: isMobile ? 13 : 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 15, bottom: 15 },
                      lineNumbersMinChars: 3,
                    }}
                  />
                </div>

                {/* Output Section */}
                <div
                  className="border-t border-gray-700/50 transition-all duration-300"
                  style={{ height: getOutputHeight() }}
                >
                  <div className="p-2 sm:p-3 bg-gray-800/80 flex justify-between items-center">
                    <h3 className="text-sm sm:text-base font-medium">Output</h3>
                    <button
                      onClick={runCode}
                      disabled={isLoading}
                      className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${isLoading
                          ? 'bg-blue-700/80 cursor-not-allowed'
                          : 'bg-blue-600/90 hover:bg-blue-500/90'
                        } transition-colors`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Run Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    className={`p-3 font-mono text-xs sm:text-sm h-full overflow-auto ${isError ? 'bg-red-900/20 text-red-400' : 'bg-gray-900/30 text-gray-300'
                      }`}
                  >
                    {output ? (
                      output.map((line, i) => (
                        <div key={i} className="whitespace-pre-wrap break-words">
                          {line || <span className="opacity-50">[empty line]</span>}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Click "Run Code" to see the output here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mobile view without PDF or when no PDF URL */}
          {(!pdfURL || isMobile) && (
            <div className="w-full flex flex-col">
              {/* Editor */}
              <div
                className="flex-1 overflow-hidden"
                style={{ height: getEditorHeight() }}
              >
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={language}
                  defaultValue={CODE_SNIPPETS[language]}
                  onMount={onMount}
                  value={value}
                  onChange={(value) => setValue(value)}
                  options={{
                    minimap: { enabled: false },
                    fontSize: isMobile ? 13 : 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 15, bottom: 15 },
                    lineNumbersMinChars: 3,
                  }}
                />
              </div>

              {/* Output Section */}
              <div
                className="border-t border-gray-700/50 transition-all duration-300"
                style={{ height: getOutputHeight() }}
              >
                <div className="p-2 sm:p-3 bg-gray-800/80 flex justify-between items-center">
                  <h3 className="text-sm sm:text-base font-medium">Output</h3>
                  <button
                    onClick={runCode}
                    disabled={isLoading}
                    className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${isLoading
                        ? 'bg-blue-700/80 cursor-not-allowed'
                        : 'bg-blue-600/90 hover:bg-blue-500/90'
                      } transition-colors`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Run Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div
                  className={`p-3 font-mono text-xs sm:text-sm h-full overflow-auto ${isError ? 'bg-red-900/20 text-red-400' : 'bg-gray-900/30 text-gray-300'
                    }`}
                >
                  {output ? (
                    output.map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap break-words">
                        {line || <span className="opacity-50">[empty line]</span>}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Click "Run Code" to see the output here
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 sm:px-4 sm:py-2 bg-gray-900/80 text-xs text-gray-400/80 border-t border-gray-700/50">
          <div className="flex items-center gap-2 sm:gap-4">
            <span>{language}</span>
            <span>{value.split('\n').length} lines</span>
            <span>{value.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}