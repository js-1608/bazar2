import React from 'react';
import { useState } from 'react';
import Header from './Header';

  const Faq = () =>  {
     const [openIndex, setOpenIndex] = useState(null);
    
      const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
      };
    
      const faqs = [
        { question: "HOW TO PLAY", answer: "Details about how to play." },
        { question: "WHERE TO PLAY", answer: "Information on where to play." },
        { question: "WINNING NUMBERS EMAIL", answer: "Sign up for emails." },
      ];

	return (
	  <>
      <Header/>
        <div className="w-full bg-white text-black">
        {/* FAQ Section */}
        <div className="max-w-6xl mx-auto py-6">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-2">
              <button
                className="w-full bg-red-600 text-white text-lg font-semibold py-3 px-4 flex justify-between items-center rounded-md"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span>{openIndex === index ? "▲" : "▼"}</span>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-gray-100 border border-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <footer className="bg-white border-t py-6 text-center">
          <div className="max-w-3xl mx-auto text-gray-600 text-sm">
            <p className="font-bold text-xl text-black flex items-center justify-center">
              MATKA <span className="text-red-600"> SATTA</span>
            </p>
            <p className="mt-2">
              The Multi-State Lottery Association makes every effort to ensure the
              accuracy of winning numbers and other information. Official winning
              numbers are those selected in the respective drawings and recorded
              under the observation of an independent accounting firm.
            </p>
            <p className="mt-2">
              In the event of a discrepancy, the official drawing results shall
              prevail. All winning tickets must be redeemed in the
              state/jurisdiction in which they are sold.
            </p>
            <p className="mt-4 flex justify-center space-x-4 text-black font-semibold">
              <span>Media Center</span>
              <span>Legal</span>
              <span>Privacy</span>
              <span>español</span>
            </p>
          </div>
        </footer>
      </div>
      
	  </>
	);
  }
  
  export default Faq;
  