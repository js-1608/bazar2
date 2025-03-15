import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import TeamsResults from "./pages/TeamResult";
import AdminPanel from "./pages/AdminPannel";
import { SattaUserView } from "./pages/UserView";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin/>}/>
        <Route path="team" element={<TeamsResults/>}/>


        {/* test */}
        <Route path="/admin2" element={<AdminPanel />} />
        <Route path="/user2" element={<SattaUserView/>}/>
      </Routes>
    </Router>
  );
}
