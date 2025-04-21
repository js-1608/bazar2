import { useState } from "react";
import Header from "./Header";
import Faq from "./Faq";
import Footer from "./Footer";

const FaqPage = () => {

  return (
    <div className=" mx-auto ">
     <Header/>
     <Faq/>
     <Footer/>
    </div>
  );
};

export default FaqPage;
