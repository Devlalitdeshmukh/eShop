import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs'; // Import Breadcrumbs
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminAboutus from './pages/admin/Aboutus';
import AdminAboutusForm from './pages/admin/AboutusForm';
import AdminContactus from './pages/admin/Contactus';
import AdminContactusForm from './pages/admin/ContactusForm';
import ProductForm from './pages/admin/ProductForm';
import ProductView from './pages/admin/ProductView';
import AdminUsers from './pages/admin/Users';
import AdminStaff from './pages/admin/Staff';
import AdminReports from './pages/admin/Reports';
import AdminCategories from './pages/admin/Categories';
import AdminBrands from './pages/admin/Brands';
import UserDetail from './pages/admin/UserDetail';
import StaffDetail from './pages/admin/StaffDetail';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivacyPolicyForm from './pages/admin/PrivacyPolicyForm';
import { UserRole } from './types';
import { LayoutDashboard, ShoppingBag, LogOut, Package, Users, BarChart3, Globe, Tag, Bookmark, User as UserIcon } from 'lucide-react';


// ... (keep existing imports)

// Layout for customer facing pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Breadcrumbs /> {/* Added Breadcrumbs for navigation preview */}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Layout for admin pages
const AdminLayout = ({ children }: { children: React.ReactNode }) => {

  const { user, logout, isLoading } = useStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.COMPANY)) {
    return <Navigate to="/login" />;
  }

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin' },
    { icon: <Package className="w-5 h-5" />, label: 'Products', path: '/admin/products' },
    { icon: <Tag className="w-5 h-5" />, label: 'Categories', path: '/admin/categories' },
    { icon: <Bookmark className="w-5 h-5" />, label: 'Brands', path: '/admin/brands' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Orders', path: '/admin/orders' },
    { icon: <Users className="w-5 h-5" />, label: 'Customers', path: '/admin/users' },
    { icon: <UserIcon className="w-5 h-5" />, label: 'Staff', path: '/admin/staff' },
    { icon: <Globe className="w-5 h-5" />, label: 'About Us', path: '/admin/aboutus' },
    { icon: <Globe className="w-5 h-5" />, label: 'Contact Us', path: '/admin/contactus' },
    { icon: <Globe className="w-5 h-5" />, label: 'Privacy Policy', path: '/admin/privacy' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold font-serif">D</div>
              <span className="font-serif font-bold text-xl text-gray-900">Admin Panel</span>
            </div>
        </div>
        <div className="p-4 border-b border-gray-200">
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-5 h-5" />
            Go to website
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/product/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
      <Route path="/orders/:id" element={<PublicLayout><OrderDetail /></PublicLayout>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
      <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
      <Route path="/admin/products/new" element={<AdminLayout><ProductForm /></AdminLayout>} />
      <Route path="/admin/products/:id" element={<AdminLayout><ProductView /></AdminLayout>} />
      <Route path="/admin/products/:id/edit" element={<AdminLayout><ProductForm /></AdminLayout>} />
      <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
      <Route path="/admin/brands" element={<AdminLayout><AdminBrands /></AdminLayout>} />
      <Route path="/admin/aboutus" element={<AdminLayout><AdminAboutus /></AdminLayout>} />
      <Route path="/admin/aboutus/new" element={<AdminLayout><AdminAboutusForm /></AdminLayout>} />
      <Route path="/admin/aboutus/:id/edit" element={<AdminLayout><AdminAboutusForm /></AdminLayout>} />
      <Route path="/admin/contactus" element={<AdminLayout><AdminContactus /></AdminLayout>} />
      <Route path="/admin/contactus/new" element={<AdminLayout><AdminContactusForm /></AdminLayout>} />
      <Route path="/admin/contactus/:id/edit" element={<AdminLayout><AdminContactusForm /></AdminLayout>} />
      <Route path="/admin/privacy" element={<AdminLayout><PrivacyPolicyForm /></AdminLayout>} />
      <Route path="/admin/orders/:id" element={<AdminLayout><OrderDetail /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
      <Route path="/admin/users/:id" element={<AdminLayout><UserDetail /></AdminLayout>} />
      <Route path="/admin/staff" element={<AdminLayout><AdminStaff /></AdminLayout>} />
      <Route path="/admin/staff/:id" element={<AdminLayout><StaffDetail /></AdminLayout>} />
      <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
    </Routes>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </StoreProvider>
  );
};

export default App;