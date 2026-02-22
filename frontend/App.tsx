import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminInquiries from './pages/admin/Inquiries';
import AdminCategories from './pages/admin/Categories';
import AdminBrands from './pages/admin/Brands';
import RevenueTracker from './pages/admin/RevenueTracker';
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/Settings';
import AdminChangePassword from './pages/admin/ChangePassword';
import UserDetail from './pages/admin/UserDetail';
import StaffDetail from './pages/admin/StaffDetail';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PrivacyPolicyForm from './pages/admin/PrivacyPolicyForm';
import { UserRole } from './types';
import { LogOut, Menu } from 'lucide-react';
import AdminSidebar from './components/admin/AdminSidebar';


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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const stored = (localStorage.getItem("admin-theme-mode") || "Light").toLowerCase();
    document.documentElement.setAttribute("data-admin-theme", stored);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const isAdminOrStaff =
    user &&
    (user.role === UserRole.ADMIN ||
      user.role === UserRole.STAFF ||
      user.role === UserRole.COMPANY);

  if (!isAdminOrStaff || !user?.token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-shell flex min-h-screen bg-gray-100">
      <AdminSidebar
        role={user.role}
        open={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-gray-100/95 backdrop-blur border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-gray-300 bg-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-600 font-medium">Admin Workspace</div>
          <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
        <div className="p-4 md:p-8">
        {children}
        </div>
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
      <Route path="/admin/inquiries" element={<AdminLayout><AdminInquiries /></AdminLayout>} />
      <Route path="/admin/revenue-tracker" element={<AdminLayout><RevenueTracker /></AdminLayout>} />
      <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
      <Route path="/admin/change-password" element={<AdminLayout><AdminChangePassword /></AdminLayout>} />
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
