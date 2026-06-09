import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import VehicleDetails from './pages/VehicleDetails';
import AdminDashboard from './pages/AdminDashboard';
import DealerProfile from './pages/DealerProfile';
import Blog from './pages/Blog';
import Compare from './pages/Compare';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import SellCar from './pages/SellCar';
import DynamicSEO from './pages/DynamicSEO';
import DigitalInspection from './pages/DigitalInspection';
import Financing from './pages/Financing';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIChat from './components/common/AIChat';
import { useAnalytics } from './hooks/useAnalytics';

function AppContent() {
  useAnalytics();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/busca" element={<Search />} />
          <Route path="/veiculo/:id" element={<VehicleDetails />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/loja/:id" element={<DealerProfile />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/planos" element={<Pricing />} />
          <Route path="/vender" element={<SellCar />} />
          <Route path="/vistoria" element={<DigitalInspection />} />
          <Route path="/financiamento" element={<Financing />} />
          <Route path="/carros/:category?/:brand?/:city?" element={<DynamicSEO />} />
        </Routes>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
