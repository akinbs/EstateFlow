import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../features/auth/ProtectedRoute'

import Home from '../pages/Home'
import Properties from '../pages/Properties'
import PropertyDetail from '../pages/PropertyDetail'
import Favorites from '../pages/Favorites'
import Compare from '../pages/Compare'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'

import Dashboard from '../pages/admin/Dashboard'
import PropertyList from '../pages/admin/PropertyList'
import PropertyForm from '../pages/admin/PropertyForm'
import Leads from '../pages/admin/Leads'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/',                 element: <Home /> },
      { path: '/properties',       element: <Properties /> },
      { path: '/properties/:slug', element: <PropertyDetail /> },
      { path: '/favorites',        element: <Favorites /> },
      { path: '/compare',          element: <Compare /> },
      { path: '/login',            element: <Login /> },
      { path: '*',                 element: <NotFound /> },
    ],
  },
  {
    // Admin routes — protected, require authentication
    // TODO (Step 4+): Add allowedRoles={['admin', 'agent']} once real roles
    // are returned from FastAPI /auth/me endpoint.
    element: <ProtectedRoute requireAuth={true} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin',                      element: <Dashboard /> },
          { path: '/admin/properties',           element: <PropertyList /> },
          { path: '/admin/properties/new',       element: <PropertyForm /> },
          { path: '/admin/properties/:id/edit',  element: <PropertyForm /> },
          { path: '/admin/leads',                element: <Leads /> },
        ],
      },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
