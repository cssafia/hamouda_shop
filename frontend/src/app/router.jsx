// src/app/router.jsx
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from '../features/auth/AuthGuard'
import AuthLayout from '../layouts/AuthLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import ClientLayout from '../layouts/ClientLayout.jsx';

/* ---------------- Lazy pages ---------------- */

// Auth
const Login          = lazy(() => import('../pages/auth/Login'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('../pages/auth/ResetPassword'))

// Admin
const Dashboard        = lazy(() => import('../pages/admin/Dashboard/Dashboard'))
const AdminProductList = lazy(() => import('../pages/admin/Products/ProductList'))
const ProductDetail    = lazy(() => import('../pages/admin/Products/ProductDetail'))
const AdminProductForm = lazy(() => import('../pages/admin/Products/ProductForm'))
const SubscriptionList   = lazy(() => import('../pages/admin/Subscriptions/SubscriptionList'))
const SubscriptionDetail = lazy(() => import('../pages/admin/Subscriptions/SubscriptionDetail'))
const SubscriptionForm   = lazy(() => import('../pages/admin/Subscriptions/SubscriptionForm'))

// Client
const Home                 = lazy(() => import('../pages/client/Home.jsx'));
const ClientProductList    = lazy(() => import('../pages/client/Product/ProductList.jsx'));
const ClientProductDetail  = lazy(() => import('../pages/client/Product/ProductDetail.jsx'));
const Checkout             = lazy(() => import('../pages/client/Cart/Checkout.jsx'));
const OrderSuccess         = lazy(() => import('../pages/client/Cart/OrderSuccess.jsx'));

/* ---------------- Fallbacks ---------------- */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-ink-600">
      Chargement…
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-ink-900 text-3xl font-bold">404</h1>
      <p className="text-ink-600">Page introuvable.</p>
    </div>
  )
}

/* ---------------- Router ---------------- */
export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ---------- Auth (public) ---------- */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* ---------- Client ------------ */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ClientProductList />} />
          <Route path="/products/:id" element={<ClientProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

        {/* ---------- Admin (protected) ---------- */}
        <Route element={<AuthGuard roles={['superadmin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />

            <Route path="/admin/products" element={<AdminProductList />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id" element={<ProductDetail />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/subscriptions" element={<SubscriptionList />} />
            <Route path="/admin/subscriptions/new" element={<SubscriptionForm />} />
            <Route path="/admin/subscriptions/:id" element={<SubscriptionDetail />} />
            <Route path="/admin/subscriptions/:id/edit" element={<SubscriptionForm />} />
            {/* Coming next: */}
            {/* <Route path="/admin/orders" element={<OrderList />} /> */}
            {/* <Route path="/admin/orders/:id" element={<OrderDetail />} /> */}
          </Route>
        </Route>

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}