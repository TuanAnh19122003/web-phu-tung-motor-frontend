import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/user/Home';
import Dashboard from './pages/admin/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from "./layouts/UserLayout";
import 'antd/dist/reset.css';

import AuthLayout from './layouts/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import RolePage from './pages/admin/role/RolePage';
import UserPage from './pages/admin/user/UserPage';
import CategoryPage from './pages/admin/category/CategoryPage';
import DiscountPage from './pages/admin/discount/DiscountPage';
import ProductPage from './pages/admin/product/ProductPage';
import ContactPage from './pages/admin/contact/ContactPage';
import OrderPage from './pages/admin/order/OrderPage';

import { CartProvider } from './pages/user/CartContext';
import About from './pages/user/About';
import OrderHistory from './pages/user/OrderHistory';
import Profile from './pages/user/Profile';
import SearchPage from './pages/user/SearchPage';
import Contact from './pages/user/Contact';
import Product from './pages/user/Product';
import ProductDetail from './pages/user/ProductDetail';
import CartPage from './pages/user/Cart';
import Order from './pages/user/Order';
import PaypalCallback from './pages/user/PaypalCallback';
import PaymentSuccess from './pages/user/PaymentSuccess';
import PaymentFail from './pages/user/PaymentFail';

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* User routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/profile' element={<Profile />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product' element={<Product />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/order' element={<Order />} />
            <Route path="/paypal-success" element={<PaypalCallback />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-fail" element={<PaymentFail />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path='/admin/roles' element={<RolePage />} />
            <Route path="/admin/users" element={<UserPage />} />
            <Route path='/admin/categories' element={<CategoryPage />} />
            <Route path='/admin/discounts' element={<DiscountPage />} />
            <Route path='/admin/products' element={<ProductPage />} />
            <Route path='/admin/contacts' element={<ContactPage />} />
            <Route path='/admin/orders' element={<OrderPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
