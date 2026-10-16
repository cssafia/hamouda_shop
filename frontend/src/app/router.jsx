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
const ChangePassword  = lazy(() => import('../pages/auth/ChangePassword.jsx'))

// Admin
const Dashboard          = lazy(() => import('../pages/admin/Dashboard/Dashboard'))
const AdminProductList   = lazy(() => import('../pages/admin/Products/ProductList'))
const ProductDetail      = lazy(() => import('../pages/admin/Products/ProductDetail'))
const AdminProductForm   = lazy(() => import('../pages/admin/Products/ProductForm'))
const SubscriptionList   = lazy(() => import('../pages/admin/Subscriptions/SubscriptionList'))
const SubscriptionDetail = lazy(() => import('../pages/admin/Subscriptions/SubscriptionDetail'))
const SubscriptionForm   = lazy(() => import('../pages/admin/Subscriptions/SubscriptionForm'))
const OrderDetail        = lazy(() => import('../pages/admin/Orders/OrderDetail.jsx'));
const OrderList          = lazy(() => import('../pages/admin/Orders/OrderList.jsx'));
const CouponsList        = lazy(() => import('../pages/admin/Coupons/CouponsList'))
const CouponForm         = lazy(() => import('../pages/admin/Coupons/CouponForm'))
const CouponDetail       = lazy(() => import('../pages/admin/Coupons/CouponDetail'))
const StockList          = lazy(() => import('../pages/admin/Stock/StockList'));
const Reports            = lazy(() => import('../pages/admin/Reports/Reports'))
const Notifications      = lazy(() => import('../pages/admin/Notification/Notification'))
const RequestsList       = lazy(() => import('../pages/admin/Requests/RequestsList'))
const RequestDetail       = lazy(() => import('../pages/admin/Requests/RequestDetail'))
const Catalog       = lazy(() => import('../pages/admin/Catalog/CatalogPage.jsx'))

// Client
const Home                 = lazy(() => import('../pages/client/Home.jsx'));
const ClientProductList    = lazy(() => import('../pages/client/Product/ProductList.jsx'));
const ClientProductDetail  = lazy(() => import('../pages/client/Product/ProductDetail.jsx'));
const Checkout             = lazy(() => import('../pages/client/Cart/Checkout.jsx'));
const OrderSuccess         = lazy(() => import('../pages/client/Cart/OrderSuccess.jsx'));
const CLientSubscriptionDetail   = lazy(() => import('../pages/client/Subscriptions/SubscriptionDetail.jsx'));
const ServiceRequestPage   = lazy(() => import('../pages/client/Services/ServiceRequestPage'))

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
       {/* ---------- Auth — public (login, forgot, reset) ---------- */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login"           element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password"  element={<ResetPassword />} />
        </Route>

        {/* ---------- Auth — protected (change password) ---------- */}
        <Route element={<AuthGuard />}>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        {/* ---------- Client ------------ */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ClientProductList />} />
          <Route path="/products/:id" element={<ClientProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/subscriptions/:id" element={<CLientSubscriptionDetail />} />
          <Route path="/services"   element={<ServiceRequestPage />} />
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
            <Route path="/admin/orders" element={<OrderList />} />
            <Route path="/admin/orders/:id" element={<OrderDetail />} />
            <Route path="/admin/coupons" element={<CouponsList />} />
            <Route path="/admin/coupons/new" element={<CouponForm />} />
            <Route path="/admin/coupons/:id" element={<CouponDetail />} />
            <Route path="/admin/coupons/:id/edit" element={<CouponForm />} />
            <Route path="/admin/stock" element={<StockList />} />
            <Route path="/admin/reports"   element={<Reports />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/requests"     element={<RequestsList />} />
            <Route path="/admin/requests/:id" element={<RequestDetail />} />
            <Route path="/admin/catalog" element={<Catalog />} />

          </Route>
        </Route>

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}