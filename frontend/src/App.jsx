import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import OwnerDashboard from './pages/ownerHome.jsx';
import OwnerLogin from './pages/OwnerLogin.jsx';
import OwnerSignup from './pages/OwnerSignup.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center gap-2">
                <UtensilsCrossed size={32} className="text-orange-500" />
                <span className="text-2xl font-bold text-gray-800">Foodie</span>
              </Link>
              
              <div className="flex gap-4">
                <Link 
                  to="/customer" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Customer
                </Link>
                <Link 
                  to="/owner" 
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium"
                >
                  Owner
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          {/* <Route path="/" element={<HomePage />} />
          <Route path="/customer" element={<CustomerPage />} /> */}
          <Route path="/owner-signup" element={<OwnerSignup />} />
          <Route path="/owner-login" element={<OwnerLogin />} />
          <Route path="/owner" element={<OwnerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;