import { LANGUAGE_VERSIONS } from "../constants";
import "./LanguageSelector.css"
import { useState } from "react";

const languages = Object.entries(LANGUAGE_VERSIONS);

const LanguageSelector = ({ language, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="language-selector">
      <p className="language-label">Language:</p>
      <div className="dropdown">
        <button 
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {language}
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {languages.map(([lang, version]) => (
              <div
                key={lang}
                className={`dropdown-item ${lang === language ? 'active' : ''}`}
                onClick={() => {
                  onSelect(lang);
                  setIsOpen(false);
                }}
              >
                {lang}
                <span className="version">({version})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageSelector;