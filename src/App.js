import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

// Import user-facing pages
import TeamResults from './pages/TeamResult';
import Home2 from './pages/Home2';
import GameList from './pages/GameList';
import Translate from './Translate';
import FaqPage from './pages/FaqPage';

const App = () => {
  return (
    <Router>
      {/* <Translate/> */}
      <Routes>
        
        <Route path="/" element={<Home2 />} />
        {/* <Route path="/hindi" element={<Hindi />} /> */}
        {/* <Route path="/hindi" element={<Homenew />} /> */}
        <Route path="/games" element={<GameList />} />
        {/* <Route path="/gameshindi" element={<HindiGameList/>} /> */}


        <Route path="/res" element={<TeamResults />} />
        <Route path="/faq" element={<FaqPage />} />
        {/* <Route path="/monthlyChart" element={<MatkaResultsDashboard />} /> */}
        {/* <Route path="/faq" element={<Faq />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
