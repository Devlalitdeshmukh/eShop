import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Globe,
  LayoutDashboard,
  Lock,
  MessageSquare,
  MoonStar,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Tag,
  User,
  Users,
  UserSquare2,
  X,
} from "lucide-react";
import { UserRole } from "../../types";

type MenuItem = {
  label: string;
  path?: string;
  icon: React.ReactNode;
  roles?: Array<UserRole | "ADMIN" | "STAFF" | "COMPANY">;
  children?: MenuItem[];
};

interface AdminSidebarProps {
  role?: string;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const hasRole = (itemRoles: MenuItem["roles"], role?: string) => {
  if (!itemRoles || itemRoles.length === 0) return true;
  return itemRoles.includes((role || "CUSTOMER") as any);
};

const MENU: MenuItem[] = [
  { label: "Go to Website", path: "/", icon: <Globe className="w-5 h-5" /> },
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
  {
    label: "Products",
    icon: <Package className="w-5 h-5" />,
    roles: ["ADMIN", "STAFF", "COMPANY"],
    children: [
      { label: "Products", path: "/admin/products", icon: <Package className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
      { label: "Categories", path: "/admin/categories", icon: <Tag className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
      { label: "Brands", path: "/admin/brands", icon: <BookOpen className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
    ],
  },
  { label: "Orders", path: "/admin/orders", icon: <ShoppingBag className="w-5 h-5" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
  {
    label: "Customers",
    icon: <Users className="w-5 h-5" />,
    roles: ["ADMIN"],
    children: [
      { label: "Customers", path: "/admin/users", icon: <Users className="w-4 h-4" />, roles: ["ADMIN"] },
      { label: "Staff", path: "/admin/staff", icon: <UserSquare2 className="w-4 h-4" />, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Content",
    icon: <Globe className="w-5 h-5" />,
    roles: ["ADMIN", "STAFF", "COMPANY"],
    children: [
      { label: "About Us", path: "/admin/aboutus", icon: <Globe className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
      { label: "Contact Us", path: "/admin/contactus", icon: <MessageSquare className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
      { label: "Privacy Policy", path: "/admin/privacy", icon: <Lock className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
    ],
  },
  {
    label: "Payment",
    icon: <Receipt className="w-5 h-5" />,
    roles: ["ADMIN"],
    children: [
      { label: "Revenue Tracker", path: "/admin/revenue-tracker", icon: <BarChart3 className="w-4 h-4" />, roles: ["ADMIN"] },
    ],
  },
  { label: "Inquiries", path: "/admin/inquiries", icon: <MessageSquare className="w-5 h-5" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
  { label: "Reports", path: "/admin/reports", icon: <BarChart3 className="w-5 h-5" />, roles: ["ADMIN"] },
  { label: "Profile", path: "/admin/profile", icon: <User className="w-5 h-5" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
  {
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["ADMIN", "STAFF", "COMPANY"],
    children: [
      { label: "Change Password", path: "/admin/change-password", icon: <Lock className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
      { label: "Theme Mode", path: "/admin/settings", icon: <MoonStar className="w-4 h-4" />, roles: ["ADMIN", "STAFF", "COMPANY"] },
    ],
  },
];

const AdminSidebar = ({ role, open, collapsed, onClose, onToggleCollapse }: AdminSidebarProps) => {
  const location = useLocation();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    Products: true,
    Customers: true,
    Content: true,
    Payment: true,
    Settings: true,
  });

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderItem = (item: MenuItem) => {
    if (!hasRole(item.roles, role)) return null;

    if (item.children?.length) {
      const children = item.children.filter((child) => hasRole(child.roles, role));
      if (!children.length) return null;

      const openGroup = expanded[item.label];
      const childActive = children.some((child) => isActive(child.path));
      return (
        <div key={item.label}>
          <button
            type="button"
            onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
              childActive ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {!collapsed && item.label}
            </span>
            {!collapsed && <ChevronDown className={`w-4 h-4 transition-transform ${openGroup ? "rotate-180" : ""}`} />}
          </button>
          {!collapsed && openGroup && (
            <div className="ml-6 mt-1 space-y-1">
              {children.map((child) => (
                <Link
                  key={child.label}
                  to={child.path || "#"}
                  onClick={onClose}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    isActive(child.path) ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {child.icon}
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path || "#"}
        onClick={onClose}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
          isActive(item.path) ? "bg-brand-600 text-white" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {item.icon}
        {!collapsed && item.label}
      </Link>
    );
  };

  return (
    <>
      {open && <button type="button" onClick={onClose} className="fixed inset-0 bg-black/40 z-40 md:hidden" />}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen bg-white border-r border-gray-200 transition-all duration-200
        ${collapsed ? "w-20" : "w-72"} ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!collapsed && <h2 className="font-bold text-lg">Admin Panel</h2>}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggleCollapse} className="hidden md:inline-flex text-gray-600 hover:text-gray-900">
              <ChevronDown className={`w-5 h-5 transition-transform ${collapsed ? "-rotate-90" : "rotate-90"}`} />
            </button>
            <button type="button" onClick={onClose} className="md:hidden text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-72px)]">{MENU.map(renderItem)}</nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
