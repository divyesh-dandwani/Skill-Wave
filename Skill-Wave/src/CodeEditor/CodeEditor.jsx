import { useRef, useState} from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import "./CodeEditor.css";
import { useLocation } from "react-router-dom";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [showPDF, setShowPDF] = useState(true);
  const location = useLocation();
  const { pdfURL } = location.state;

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const togglePDF = () => {
    setShowPDF(!showPDF);
  };

  return (
    <div className="code-editor-container">
      <div className="editor-content">
        <div className="pdf-section">
          <button onClick={togglePDF} className="toggle-pdf-btn">
            {showPDF ? "Hide PDF" : "Show PDF"}
          </button>
          {showPDF && (
            <iframe
              src={pdfURL}
              className="pdf-viewer"
              title="PDF Viewer"
            />
          )}
        </div>
        <div className="code-section">
          <div className="editor-output-container">
            <div className="editor-section">
              <LanguageSelector language={language} onSelect={onSelect}/>
              <Editor
                options={{
                  minimap: {
                    enabled: false,
                  },
                }}
                height="40vh"
                theme="vs-dark"
                language={language}
                defaultValue={CODE_SNIPPETS[language]}
                onMount={onMount}
                value={value}
                onChange={(value) => setValue(value)}
              />
            </div>
            <div className="output-section">
              <Output editorRef={editorRef} language={language} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;