import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

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
import Settings from "../Pages/Settings"; // Import the new Settings page
import Sidebar from "../../components/Sidebar";
import TopicsDetail from "../Pages/components/TopicsDetail";
import MoskalAI from "../Pages/MoskalAI";
import Mentions from "../Pages/Mentions"; // Import the Mentions page
// import Reporting from "../Pages/Reporting"; // Import the Reporting page - File doesn't exist
// import ReportPage from "../Pages/ReportPage"; // Import the new ReportPage - File doesn't exist
import GenerateReport from "../Pages/GenerateReport"; // Import the new GenerateReport page
import ReportList from "../Pages/ReportList"; // Import the new ReportList page
import NotificationTest from "../../components/NotificationTest"; // Import the notification test component
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
    path: "/:keyword/moskal-ai",
    element: <ProtectedRouteSidebar element={<MoskalAI />} />,
  },
  {
    path: "/:keyword/mentions",
    element: <ProtectedRouteSidebar element={<Mentions />} />,
  },
  // {
  //   path: "/:keyword/reporting",
  //   element: <ProtectedRouteSidebar element={<Reporting />} />,
  // },
  // {
  //   path: "/:keyword/report", // New route for the embedded report
  //   element: <ProtectedRouteSidebar element={<ReportPage />} />,
  // },
  {
    path: "/:keyword/generate-report", // New route for generating reports
    element: <ProtectedRouteSidebar element={<GenerateReport />} />,
  },
  {
    path: "/report-list", // New route for listing reports
    element: <ProtectedRouteSidebar element={<ReportList />} />,
  },
  // Removed specific report summary route, as it's now a modal
  // {
  //   path: "/summary/:reportId", 
  //   element: <ProtectedRouteSidebar element={<Summary />} />,
  // },
  {
    path: "/account-settings",
    element: <ProtectedRouteSidebar element={<AccountSettings />} />,
  },
  {
    path: "/:keyword/settings", // Updated route for project-specific Settings page
    element: <ProtectedRouteSidebar element={<Settings />} />,
  },
  {
    path: "/onboard",
    element: <ProtectedRoute element={<OnBoard />} />,
  },
  {
    path: "/notification-test",
    element: <NotificationTest />, // No protection for easy testing
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
