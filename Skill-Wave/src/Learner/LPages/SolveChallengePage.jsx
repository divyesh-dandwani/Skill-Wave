import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const languages = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'cpp', label: 'C++', extension: 'cpp' },
  { value: 'java', label: 'Java', extension: 'java' },
  { value: 'csharp', label: 'C#', extension: 'cs' },
];

const getLanguageExtension = (language) => {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'python':
      return python();
    case 'cpp':
    case 'c':
      return cpp();
    case 'java':
      return java();
    default:
      return javascript();
  }
};

const defaultCode = {
  javascript: '// Write your JavaScript code here\n\n',
  python: '# Write your Python code here\n\n',
  cpp: '// Write your C++ code here\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n',
  java: '// Write your Java code here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n',
  csharp: '// Write your C# code here\n\nusing System;\n\npublic class Solution {\n    public static void Main(string[] args) {\n        // Your code here\n    }\n}\n',
};

export default function SolveChallengePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(defaultCode[language]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [numPages, setNumPages] = useState(null);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOutput(prev => prev + 'Code executed successfully!\n\nOutput:\nHello, World!');
    setIsRunning(false);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="h-12 px-4 flex items-center gap-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/challenges')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex-1" />

        <Select
          value={language}
          onValueChange={(value) => {
            setLanguage(value);
            setCode(defaultCode[value]);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleRun}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Code
            </>
          )}
        </Button>
      </div>

      <PanelGroup direction="horizontal" className="h-[calc(100%-3rem)]">
        {/* Problem Statement Panel */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full bg-white dark:bg-gray-800 overflow-auto">
            <Document
              file="https://example.com/problem-statement.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              className="mx-auto"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="mb-4"
                />
              ))}
            </Document>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />

        {/* Code Editor Panel */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <CodeMirror
                value={code}
                height="100%"
                theme={vscodeDark}
                extensions={[getLanguageExtension(language)]}
                onChange={(value) => setCode(value)}
                className="h-full"
              />
            </div>
            <div className="h-48 border-t bg-gray-100 dark:bg-gray-900 p-4 font-mono text-sm overflow-auto">
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}