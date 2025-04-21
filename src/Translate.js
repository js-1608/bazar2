import { useState, useEffect } from "react";

export default function Translate() {
  return (
    <div className="flex justify-between items-center bg-gray-800 text-white px-2 mx-auto">
      {/* Left Side - Text */}
      <span className="text-sm font-medium">
        Translate:
      </span>

      {/* Right Side - Google Translate Original Widget */}
      <div id="google_translate_element" className="ml-4"></div>
    </div>
  );
}

