import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));

const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const Projects = lazy(() => import("@/pages/app/Projects"));
const ProjectDetails = lazy(() => import("@/pages/app/ProjectDetails"));
const Chat = lazy(() => import("@/pages/app/Chat"));
const Profile = lazy(() => import("@/pages/app/Profile"));
const Settings = lazy(() => import("@/pages/app/Settings"));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LazyPage>
        <Landing />
      </LazyPage>
    ),
  },

  {
    path: "/login",
    element: (
      <LazyPage>
        <Login />
      </LazyPage>
    ),
  },

  {
    path: "/register",
    element: (
      <LazyPage>
        <Register />
      </LazyPage>
    ),
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/dashboard" replace />,
          },

          {
            path: "dashboard",
            element: (
              <LazyPage>
                <Dashboard />
              </LazyPage>
            ),
          },

          {
            path: "projects",
            element: (
              <LazyPage>
                <Projects />
              </LazyPage>
            ),
          },

          {
            path: "projects/:projectId",
            element: (
              <LazyPage>
                <ProjectDetails />
              </LazyPage>
            ),
          },

          {
            path: "chat",
            element: (
              <LazyPage>
                <Chat />
              </LazyPage>
            ),
          },

          {
            path: "profile",
            element: (
              <LazyPage>
                <Profile />
              </LazyPage>
            ),
          },

          {
            path: "settings",
            element: (
              <LazyPage>
                <Settings />
              </LazyPage>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;