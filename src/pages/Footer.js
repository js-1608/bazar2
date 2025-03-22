import React from 'react';
import Faq from './Faq';
const Footer = () => {

    return (
        <>
            <div className="w-full bg-white text-black">
                {/* FAQ Section */}
                <Faq />

                {/* Footer Section */}
                <footer className="bg-white border-t py-6 text-center">
                    <div className="max-w-3xl mx-auto text-gray-600 text-sm">
                        <p className="font-bold text-xl text-black flex items-center justify-center">
                            MATKA <span className="text-red-600"> SATTA</span>
                        </p>
                              <h1 className="text-3xl md:text-4xl font-bold uppercase text-red-600">
                                <img
                                    src="./logo.PNG"
                                    alt="Advertisement"
                                    className="w-28 h-30 m-auto"
                                />
                                </h1>
                        <p className="mt-2">
                            The Multi-State  Association makes every effort to ensure the
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

export default Footer;
