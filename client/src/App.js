import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './About';
import Dashboard from './components/Dashboard';
import Login from "./components/Login";
import Tutorial from './components/Tutorial';
import Contact from './components/Contact';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route Path="/contact" element={<Contact />}/>
      </Routes>
    </Router>
  );
};

export default App;