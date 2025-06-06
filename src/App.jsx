import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LeadDashboard from './components/LeadDashboard';
import CallInterface from './components/CallInterface';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">HomeMaxx Dialer</h1>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<LeadDashboard />} />
            <Route path="/call/:leadId" element={<CallInterface />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;