import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";

// Importing page components
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import Topic from "../Pages/Topic";
import Summary from "../Pages/Summary";
import Analysis from "../Pages/Analysis";
import Comparison from "../Pages/Comparison";
import KOL from "../Pages/Kol";
import AccountSettings from "../Pages/AccountSettings";
import OnBoard from "../Pages/Onboard";
import Sidebar from "../../components/Sidebar";
import TopicsDetail from "../Pages/components/TopicsDetail";
import { useSelector } from "react-redux";

// Auth guard
const isAuthenticated = () => {
  return Boolean(localStorage.getItem("user"));
};

const isHaveKeyword = () => {
  return Boolean(localStorage.getItem("keywords"));
};

const ProtectedRoute = ({ element }) => {
  if (isAuthenticated()) {
    return <>{element}</>;
  } else {
    return <Navigate to="/" replace />;
  }
};

const ProtectedRouteSidebar = ({ element }) => {
  if (isAuthenticated() && isHaveKeyword()) {
    return (
      <div className="router-flex ">
        <Sidebar />
        <div className="router-main-container">{element}</div>
      </div>
    );
  } else if (isAuthenticated() && !isHaveKeyword()) {
    return <Navigate to="/onboard" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

const OuterRoute = ({ element }) => {
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  return !isAuthenticated() ? (
    <>{element}</>
  ) : (
    <Navigate to={`/${activeKeywords.name}/dashboard`} replace />
  );
};

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <OuterRoute element={<Login />} />,
  },
  {
    path: "/:keyword/dashboard",
    element: <ProtectedRouteSidebar element={<Dashboard />} />,
  },
  {
    path: "/:keyword/topics",
    element: <ProtectedRouteSidebar element={<Topic />} />,
  },
  {
    path: "/:keyword/topics-detail",
    element: <ProtectedRouteSidebar element={<TopicsDetail />} />,
  },
  {
    path: "/:keyword/summary",
    element: <ProtectedRouteSidebar element={<Summary />} />,
  },
  {
    path: "/:keyword/analysis",
    element: <ProtectedRouteSidebar element={<Analysis />} />,
  },
  {
    path: "/:keyword/comparison",
    element: <ProtectedRouteSidebar element={<Comparison />} />,
  },
  {
    path: "/:keyword/kol",
    element: <ProtectedRouteSidebar element={<KOL />} />,
  },
  {
    path: "/account-settings",
    element: <ProtectedRouteSidebar element={<AccountSettings />} />,
  },
  {
    path: "/onboard",
    element: <ProtectedRoute element={<OnBoard />} />,
  },
]);

function Router() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default Router;
