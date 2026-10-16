// src/constants/nav.js
import {
  LayoutDashboard, ShoppingCart, Inbox, 
  Package, Repeat,Tag,
  Boxes, Ticket, BarChart3,
} from 'lucide-react'

export const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/admin',            label: 'Dashboard', icon: LayoutDashboard, end: true, mobile: true },
      { to: '/admin/orders',     label: 'Orders',    icon: ShoppingCart,    mobile: true },
      { to: '/admin/requests',   label: 'Requests',  icon: Inbox,           mobile: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products',        label: 'Products',      icon: Package, mobile: true },
      { to: '/admin/subscriptions',   label: 'Subscriptions', icon: Repeat },
      { to: '/admin/catalog', label: 'Marques & Catégories', icon: Tag },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/stock',    label: 'Stock',    icon: Boxes },
      { to: '/admin/coupons',  label: 'Coupons',  icon: Ticket },
      { to: '/admin/reports',  label: 'Reports',  icon: BarChart3 },
    ],
  },

]

// Bottom nav = items flagged `mobile: true` (4), plus a hardcoded "More" (5th)
export const MOBILE_NAV = NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.mobile)