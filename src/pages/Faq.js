import React from 'react';
import { useState } from 'react';

  const Faq = () =>  {
     const [openIndex, setOpenIndex] = useState(null);
    
      const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
      };
    
      const faqs = [
        {
          question: "What is matkasatta.com?",
          answer: "matkasatta.com is an online platform where users can access information about satta games, strategies, and updates. We aim to provide the most recent and accurate information about the satta industry."
        },
        {
          question: "How do I register on the website?",
          answer: "To register, click on the 'Sign Up' or 'Register' button on our homepage. Fill in the required details and follow the on-screen instructions to complete the registration process."
        },
        {
          question: "Is it legal to use this website?",
          answer: "Online betting laws vary by jurisdiction. It is the responsibility of users to be aware of and comply with their local laws regarding online gambling. Please consult your local regulations before using our website."
        },
        {
          question: "How is my personal data protected?",
          answer: "We take user privacy very seriously. All personal data is stored securely, and we employ measures to protect against unauthorized access. For more details, please refer to our Privacy Policy."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can request account deletion by contacting our support team. Please note that some information might be retained for legal or operational reasons."
        },
        {
          question: "How do I deposit and withdraw money?",
          answer: "To deposit or withdraw money, go to the 'Wallet' or 'Account' section on our website. Supported payment methods include PhonePay, PayTM, Credit Card, and Debit Card. Follow the instructions provided and ensure you are familiar with our terms regarding deposits and withdrawals."
        },
        {
          question: "Is there a minimum deposit or withdrawal amount?",
          answer: "Yes, the minimum deposit is 100 RUPAY and the minimum withdrawal is 1000 RUPAY."
        },
        {
          question: "What should I do if I encounter a problem?",
          answer: "If you face any issues, please contact our support team at support@matkasatta.com or use the 'Contact Us' form on our website."
        },
        {
          question: "Do you promote responsible gambling?",
          answer: "Absolutely. We believe in promoting a responsible gambling environment. If you or someone you know has a gambling problem, please seek help and guidance immediately."
        },
        {
          question: "Are the games on matkasatta.com fair?",
          answer: "Yes, all games are operated with a fair system, and we ensure transparency in all our operations."
        }
      ];
      

	return (
	  <>
        <div className="w-full bg-white text-black" id="faq">
        {/* FAQ Section */}
        <div className="max-w-6xl mx-auto py-6">
          {faqs.map((faq, index) => (
            <div key={index} className="m-4">
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

      </div>

	  </>
	);
  }
  
  export default Faq;
  