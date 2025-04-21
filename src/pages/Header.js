import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
     

      {/* Header */}
      <header className="bg-[#182633] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold">
              <img
                src="./logo.PNG"
                alt="Advertisement"
                className="h-28 m-auto"
              />
            </Link>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/games" className="hover:text-gray-200 transition">Results</Link>   
              <Link to="/faq" className="hover:text-gray-200 transition">FAQs</Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <nav className="md:hidden flex flex-col space-y-4 pb-4">
              <Link to="/faq" className="hover:text-gray-200 transition">FAQs</Link>
              <Link to="/games" className="hover:text-gray-200 transition">Results</Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}