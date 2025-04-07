import React from 'react';
import { useState } from 'react';

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
        <div className="w-full bg-white text-black ">
        {/* FAQ Section */}
        <div className="max-w-6xl  p-12">
          {faqs.map((faq, index) => (
            <div key={index} className=" m-4">
              <button
                className=" bg-red-600 text-white text-lg font-semibold py-3 px-4 flex justify-between items-center rounded-md m-2"
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

      </div>

	  </>
	);
  }
  
  export default Faq;
  