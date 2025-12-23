import { LayoutDashboardIcon, LayoutList, Network, Package, ReceiptText } from 'lucide-react';
import React from 'react';

export interface ROUTE_INTERFACE {
  path: string;
  name: string;
  icon?: React.ElementType;
  roles?: string[];
}

export const ROUTES: ROUTE_INTERFACE[] = [
  // {
  //   path: '/dashboard',
  //   name: 'Dashboard',
  //   icon: LayoutDashboardIcon,
  //   roles: ['admin', 'customer']
  // },
  {
    path: '/products',
    name: 'Products',
    icon: Package,
    roles: ['admin']
  },
  {
    path: '/orders',
    name: 'O&P Orders',
    icon: LayoutList,
    roles: ['admin']
  },

  {
    path: '/organization',
    name: 'Organization',
    icon: Network,
    roles: ['admin']
  }, 
   {
    path: '/transcations',
    name: 'Transcations',
    icon: ReceiptText,
    roles: ['admin']
  }

];
