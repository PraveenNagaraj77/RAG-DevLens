import DashboardLayout from "@/layouts/DashboardLayout"
import Dashboard from "@/pages/app/Dashboard"
import ProjectDetails from "@/pages/app/ProjectDetails"
import Projects from "@/pages/app/Projects"

import Login from "@/pages/Login"
import Register from "@/pages/Register"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom"

const router = createBrowserRouter([
  // Root
  {
    path: "/",
    element: (
      <Navigate
        to="/login"
        replace
      />
    ),
  },

  // Authentication
  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  // Protected Application
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to="/app/dashboard"
                replace
              />
            ),
          },

          {
            path: "dashboard",
            element: <Dashboard />,
          },

          {
            path: "projects",
            element: <Projects />,
          },

          {
            path: "projects/:projectId",
            element: <ProjectDetails />,
          },
        ],
      },
    ],
  },
])

export default router