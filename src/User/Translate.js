import { useState } from "react";
import {  Globe } from "lucide-react";

export default function Translate() {

  const [currentLanguage, setCurrentLanguage] = useState("English");

  // Function to handle language change
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    
    // This would integrate with Google Translate API
    // For actual implementation, you would need to use the Google Translate Element
    if (language === "English") {
      // Set to English
      if (window.googleTranslateElementInit) {
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
          selectElement.value = 'en';
          selectElement.dispatchEvent(new Event('change'));
        }
      }
    } else if (language === "Hindi") {
      // Set to Hindi
      if (window.googleTranslateElementInit) {
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
          selectElement.value = 'hi';
          selectElement.dispatchEvent(new Event('change'));
        }
      }
    }
  };

  return (
    <>
      {/* Translation Bar */}
      <div className="bg-gray-800 text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Globe size={18} className="mr-2" />
            <span className="text-sm">Translate:</span>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => changeLanguage("English")}
              className={`text-sm px-2 py-1 rounded ${currentLanguage === "English" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              English
            </button>
            <button 
              onClick={() => changeLanguage("Hindi")}
              className={`text-sm px-2 py-1 rounded ${currentLanguage === "Hindi" ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              हिन्दी
            </button>
            {/* Hidden div for Google Translate Element */}
            <div id="google_translate_element" className="hidden"></div>
          </div>
        </div>
      </div>
    </>
  );
}