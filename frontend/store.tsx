import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, CartItem, Product, UserRole, Order, ProductVariant, Aboutus, Contactus } from './types';
import { PRODUCTS, MOCK_ORDERS } from './constants';
import api from './services/api';
import brandCategoryService from './services/brandCategoryService';

interface StoreContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  setAuthUser: (user: User) => void;
  logout: () => void;

  products: Product[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  cart: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;

  cartTotal: number;
  orders: Order[];
  placeOrder: (details: any) => Promise<void>;
  isLoading: boolean;
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;

  aboutus: Aboutus[];
  refreshAboutus: () => Promise<void>;
  addAboutus: (aboutus: Partial<Aboutus>) => Promise<void>;
  updateAboutus: (id: string, aboutus: Partial<Aboutus>) => Promise<void>;
  deleteAboutus: (id: string) => Promise<void>;

  contactus: Contactus[];
  refreshContactus: () => Promise<void>;
  addContactus: (contactus: Partial<Contactus>) => Promise<void>;
  updateContactus: (id: string, contactus: Partial<Contactus>) => Promise<void>;
  deleteContactus: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/products');
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.warn("Backend API not reachable, using mock data for products.");
    } finally {
      setIsLoading(false);
    }
  };

  const [aboutus, setAboutus] = useState<Aboutus[]>([]);

  const fetchAboutus = async () => {
    try {
      const { data } = await api.get('/aboutus');
      if (Array.isArray(data)) {
        setAboutus(data);
      }
    } catch (error) {
      console.warn("Failed to fetch aboutus data");
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    fetchProducts();
    fetchAboutus();
    fetchContactus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const userData: User = {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        avatar: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
        token: data.token
      };
      localStorage.setItem('userInfo', JSON.stringify({ ...userData, token: data.token }));
      setUser(userData);
      setUser(userData);
    } catch (error: any) {
      // If authenticating with backend failed with 400/401, do NOT use mock login.
      // This prevents "fake" logins that fail on subsequent API calls.
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        throw error;
      }

      console.warn("Backend login failed, using mock login.");
      // For mock login, determine role based on email
      let role: UserRole = UserRole.CUSTOMER;
      // Check for admin email patterns
      if (email.toLowerCase() === 'admin@example.com' || 
          email.toLowerCase().includes('admin@') || 
          email.toLowerCase().includes('@admin.')) {
        role = UserRole.ADMIN;
      }
      
      const mockUser: User = {
        id: '123',
        name: email.split('@')[0],
        email,
        role,
        avatar: 'https://ui-avatars.com/api/?name=User&background=random'
      };
      setUser(mockUser);
      localStorage.setItem('userInfo', JSON.stringify(mockUser));
    }
  };

  const setAuthUser = (userData: User) => {
    setUser((currentUser) => {
      const userWithAvatar = {
        ...currentUser, // Merge with existing user (preserving token, etc.)
        ...userData,
        avatar: userData.avatar || currentUser?.avatar || `https://ui-avatars.com/api/?name=${userData.name}&background=random`
      };
      localStorage.setItem('userInfo', JSON.stringify(userWithAvatar));
      return userWithAvatar;
    });
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setCart([]);
  };

  const addProduct = async (productData: Partial<Product>) => {
    try {
      await api.post('/products', productData);
      await fetchProducts();
    } catch (error) {
      const newProduct = { ...productData, id: `new-${Date.now()}`, rating: 0, reviews: 0 } as Product;
      setProducts([...products, newProduct]);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await api.put(`/products/${id}`, productData);
      await fetchProducts();
    } catch (error) {
      setProducts(products.map(p => p.id === id ? { ...p, ...productData } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, { rating, comment });
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, rating: parseFloat(data.rating), reviews: data.reviews } 
          : p
      ));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const addToCart = (product: Product, quantity: number, variant?: ProductVariant) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && item.selectedVariantId === variant?.id
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedVariantId === variant?.id) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { 
        ...product, 
        quantity, 
        selectedVariantId: variant?.id,
        selectedVariantName: variant?.name,
        price: variant?.price ?? product.price,
        discountPrice: variant?.price ? undefined : product.discountPrice
      }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedVariantId === variantId)));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const placeOrder = async (details: any) => {
    const orderData = {
      items: cart,
      total: cartTotal,
      paymentMethod: details.paymentMethod,
      shippingAddress: {
        name: details.name,
        address: details.address,
        city: details.city,
        pincode: details.pincode,
        phone: details.phone
      }
    };

    try {
      const { data } = await api.post('/orders', orderData);
      const newOrder: Order = {
        id: data.id,
        userId: user?.id || 'guest',
        items: [...cart],
        total: cartTotal,
        status: data.status || 'Pending', // Use status from response
        date: new Date().toISOString().split('T')[0],
        paymentMethod: details.paymentMethod
      };
      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        userId: user?.id || 'guest',
        items: [...cart],
        total: cartTotal,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: details.paymentMethod
      };
      setOrders(prev => [newOrder, ...prev]);
    }
    clearCart();
  };

  const addAboutus = async (aboutusData: Partial<Aboutus>) => {
    try {
      await api.post('/aboutus', aboutusData);
      await fetchAboutus();
    } catch (error) {
      console.error("Failed to add aboutus", error);
      throw error;
    }
  };

  const updateAboutus = async (id: string, aboutusData: Partial<Aboutus>) => {
    try {
      await api.put(`/aboutus/${id}`, aboutusData);
      await fetchAboutus();
    } catch (error) {
      console.error("Failed to update aboutus", error);
      throw error;
    }
  };

  const deleteAboutus = async (id: string) => {
    try {
      await api.delete(`/aboutus/${id}`);
      await fetchAboutus();
    } catch (error) {
      console.error("Failed to delete aboutus", error);
      throw error;
    }
  };

  const [contactus, setContactus] = useState<Contactus[]>([]);

  const fetchContactus = async () => {
    try {
      const { data } = await api.get('/contactus');
      if (Array.isArray(data)) {
        setContactus(data);
      }
    } catch (error) {
      console.warn("Failed to fetch contactus data");
    }
  };

  const addContactus = async (contactusData: Partial<Contactus>) => {
    try {
      await api.post('/contactus', contactusData);
      await fetchContactus();
    } catch (error) {
      console.error("Failed to add contactus", error);
      throw error;
    }
  };

  const updateContactus = async (id: string, contactusData: Partial<Contactus>) => {
    try {
      await api.put(`/contactus/${id}`, contactusData);
      await fetchContactus();
    } catch (error) {
      console.error("Failed to update contactus", error);
      throw error;
    }
  };

  const deleteContactus = async (id: string) => {
    try {
      await api.delete(`/contactus/${id}`);
      await fetchContactus();
    } catch (error) {
      console.error("Failed to delete contactus", error);
      throw error;
    }
  };
 
  return (
    <StoreContext.Provider value={{
      user, login, setAuthUser, logout, products, refreshProducts: fetchProducts, addProduct, updateProduct, deleteProduct, cart, addToCart, removeFromCart, clearCart, cartTotal, orders, placeOrder, isLoading, addReview,
      aboutus, refreshAboutus: fetchAboutus, addAboutus, updateAboutus, deleteAboutus,
      contactus, refreshContactus: fetchContactus, addContactus, updateContactus, deleteContactus
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};