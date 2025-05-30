import React, { useState, useEffect } from "react";
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionSummary from "@mui/joy/AccordionSummary";
import { AddCircle, NavigateNext, ChevronLeft, ChevronRight, SettingsOutlined, EditOutlined } from "@mui/icons-material"; // Added SettingsOutlined, EditOutlined
import CustomText from "./CustomText";
import { DescriptionOutlined } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./styles/Sidebar.css";
import { getProjects } from "../services/projectService";
import {
  addKeywords,
  setActiveKeyword,
} from "../helpers/redux/slice/keywordSlice";
import authService from "../services/authService";
import { login } from "../helpers/redux/slice/loginSlice";
import { useDidUpdateEffect } from "../helpers/loadState";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [listKeywords, setListKeywords] = useState(
    useSelector((state) => state.keywords.keywords)
  );
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeMenu, setActiveMenu] = useState("");
  const [activeKeywordSidebar, setActiveKeywordSidebar] = useState("");
  const [isTokenChange, setIsTokenChange] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Function to update active project and menu from URL
  const updateActiveFromUrl = () => {
    let url = location.pathname.replace(/^\/+/, "").split("/");
    const encodedKeyword = url[0];
    const decodedKeyword = decodeURIComponent(encodedKeyword);
    const menu = url[1] || "";
    
    console.log("Current URL:", location.pathname);
    console.log("Parsed keyword (encoded):", encodedKeyword);
    console.log("Parsed keyword (decoded):", decodedKeyword);
    console.log("Parsed menu:", menu);
    
    // Set active menu (normalize topics-detail to topics)
    const normalizedMenu = menu === "topics-detail" ? "topics" : menu;
    setActiveMenu(normalizedMenu);
    
    // Set active project - try both encoded and decoded versions
    if (encodedKeyword) {
      // First try to find the project using the decoded keyword
      let foundKeyword = findKeyword(decodedKeyword);
      
      // If not found, try with the encoded keyword
      if (!foundKeyword) {
        foundKeyword = findKeyword(encodedKeyword);
      }
      
      if (foundKeyword) {
        setActiveKeywordSidebar(foundKeyword.name);
        console.log("Setting active keyword sidebar to:", foundKeyword.name);
        
        // Update Redux if needed
        if (foundKeyword.name !== activeKeywords.name) {
          dispatch(
            setActiveKeyword({
              activeKeyword: foundKeyword,
              days: 30,
            })
          );
        }
        
        // Find and expand the accordion for the active project
        const index = listKeywords?.findIndex(item => item.name === foundKeyword.name);
        if (index !== -1) {
          setActiveIndex(index);
          console.log("Setting active index to:", index);
        }
      } else {
        // Fallback to using the decoded keyword directly
        setActiveKeywordSidebar(decodedKeyword);
        console.log("No matching project found, using decoded keyword:", decodedKeyword);
      }
    } else {
      setActiveKeywordSidebar(activeKeywords.name);
    }
  };

  // Initial setup and project loading
  useEffect(() => {
    checkProject();
  }, []);

  // Update active project and menu when location or listKeywords changes
  useEffect(() => {
    if (listKeywords && listKeywords.length > 0) {
      updateActiveFromUrl();
    }
  }, [location.pathname, listKeywords]);

  useDidUpdateEffect(() => {
    checkProject();
  }, [isTokenChange]);

  const checkProject = async () => {
    try {
      const project = await getProjects();
      const projectData = [
        ...project.owned_projects,
        ...project.accessible_projects
      ];
      if (
        project.accessible_projects.length > 0 ||
        project.owned_projects.length > 0
      ) {
        if (projectData !== listKeywords) {
          dispatch(
            addKeywords({
              keywords: projectData,
              days: 30,
            })
          );
          setListKeywords(projectData);
        }
      }
    } catch (error) {
      reFetchToken();
      console.log(error);
    }
  };

  const reFetchToken = async () => {
    try {
      const resp = await authService.refreshToken();
      setIsTokenChange(!isTokenChange);
      dispatch(
        login({
          name: userData.name,
          email: userData.email,
          token: resp.access_token,
          refreshToken: resp.refresh_token,
          tokenType: userData.tokenType,
          userId: userData.id, // Use userData.id for dispatch, assuming it's the pre-refresh source
          expiresInDays: userData.expiresInDays,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnSelectAccordion = async (keyword, menu) => {
    setActiveMenu(menu);
    setActiveKeywordSidebar(keyword);
    const foundKeyword = findKeyword(keyword);

    dispatch(
      setActiveKeyword({
        activeKeyword: foundKeyword,
        days: 30,
      })
    );

    console.log("foundKeyword", foundKeyword);
    navigate(`/${keyword}/${menu}`, { replace: true });
  };

  const accountRoute = () => {
    setActiveMenu("");
    setActiveKeywordSidebar("");
    navigate(`/account-settings`, { replace: true });
  };

  // Removed projectSettingsRoute

  const handleAddNewKeyword = () => {
    setActiveMenu("");
    setActiveKeywordSidebar("");
    navigate(`/onboard?from=sidebar`, { replace: true });
  };

  const reportListRoute = () => {
    setActiveMenu("report-list"); // Set a unique identifier for this menu
    setActiveKeywordSidebar(""); // Clear active project context
    navigate(`/report-list`, { replace: true });
  };

  const findKeyword = (keyword) => {
    if (!keyword || !listKeywords) return null;
    
    // Try exact match first
    let foundKeyword = listKeywords.find((item) => item.name === keyword);
    
    if (!foundKeyword) {
      // Try case-insensitive match
      foundKeyword = listKeywords.find(
        (item) => item.name.toLowerCase() === keyword.toLowerCase()
      );
    }
    
    return foundKeyword;
  };

  const isMenuActive = (keyword, menu) => {
    // Check if the menu matches and if the keyword matches the active keyword
    // This handles both exact matches and cases where the URL might be encoded differently
    return activeMenu === menu && 
           (activeKeywordSidebar === keyword || 
            activeKeywordSidebar === decodeURIComponent(keyword) ||
            keyword === decodeURIComponent(activeKeywordSidebar));
  };
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      <div className={`sidebar-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* <button className="sidebar-toggle" onClick={toggleSidebar}> Removed toggle button
          {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button> */}
        <div className="sidebar-main-content"> {/* Added wrapper div */}
          <div>
            <img
              className="sidebar-moskal-icon"
              src={window.location.origin + "/MOSKAL.svg"}
              onClick={toggleSidebar} // Logo now always toggles sidebar
              style={{ cursor: 'pointer' }} // Always show pointer cursor on logo
            />
          </div>
          <div className="login-add-new-keyword tooltip" onClick={handleAddNewKeyword}>
          {isSidebarCollapsed ? (
            <>
              <span className="add-icon">+</span>
              <span className="tooltiptext">Add new keywords</span>
            </>
          ) : (
            <>
              <CustomText size="ss" color="b500"> {/* Reverted font size */}
                Add new keywords
              </CustomText>
              <AddCircle sx={{ color: "#0047AB", width: "24px" }} />
            </>
          )}
        </div>

        {/* Project avatars for collapsed sidebar */}
        <div className="project-avatars-container">
          {listKeywords?.map((value, index) => (
            <React.Fragment key={`avatar-fragment-${value.name}-${index}`}>
              <div
                key={`avatar-${value.name}-${index}`}
                className={`project-avatar tooltip ${activeKeywordSidebar === value.name ? 'active' : ''}`}
                onClick={() => handleOnSelectAccordion(value.name, "dashboard")}
              >
                <CustomText color={activeKeywordSidebar === value.name ? 'white' : 'b900'} bold="medium" size="sss"> {/* Reverted font size */}
                  {value.name.charAt(0).toUpperCase()}
                </CustomText>
                <span className="tooltiptext">{value.name}</span>
              </div>
              
              {/* Show submenu for active project when collapsed */}
              {activeKeywordSidebar === value.name && (
                <div className="collapsed-submenu">
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "dashboard") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "dashboard")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/monitor-04.svg"}
                    />
                    <span className="tooltiptext">Dashboard</span>
                  </div>
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "topics") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "topics")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/message-alert-circle.svg"}
                    />
                    <span className="tooltiptext">Topics</span>
                  </div>
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "summary") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "summary")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/help-circle.svg"}
                    />
                    <span className="tooltiptext">Summary</span>
                  </div>
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "analysis") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "analysis")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/pie-chart-01.svg"}
                    />
                    <span className="tooltiptext">Analysis</span>
                  </div>
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "comparison") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "comparison")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/scales-01.svg"}
                    />
                    <span className="tooltiptext">Comparison</span>
                  </div>
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "kol") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "kol")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/user-01.svg"}
                    />
                    <span className="tooltiptext">KOL</span>
                  </div>
                  <div
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "moskal-ai") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "moskal-ai")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/monitor-04.svg"} /* Placeholder AI icon */
                    />
                    <span className="tooltiptext">Moskal AI</span>
                  </div>
                  <div
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "mentions") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "mentions")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/message-circle-02.svg"} /* Using dashboard icon as placeholder */
                    />
                    <span className="tooltiptext">Mentions</span>
                  </div>
                  <div 
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "generate-report") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "generate-report")}
                  >
                    <img
                      className="sidebar-icon-accordion"
                      src={window.location.origin + "/download-01.svg"}
                    />
                    <span className="tooltiptext">Generate Report</span>
                  </div>
                  {/* Collapsed Project Settings Link */}
                  {(() => {
                    const loggedInUserId = userData && userData.id !== undefined && userData.id !== null ? Number(userData.id) : null;
                    const projectOwnerId = value && value.owner_id !== undefined && value.owner_id !== null ? Number(value.owner_id) : null;
                    const isOwned = loggedInUserId !== null && projectOwnerId !== null && projectOwnerId === loggedInUserId;
                    const canEditSettings = isOwned || value.role === 'full_access';
                    return canEditSettings;
                  })() && (
                  <div
                    className={`collapsed-submenu-item tooltip ${isMenuActive(value.name, "settings") ? 'active' : ''}`}
                    onClick={() => handleOnSelectAccordion(value.name, "settings")}
                  >
                    <SettingsOutlined sx={{ fontSize: 18, color: isMenuActive(value.name, "settings") ? '#FFFFFF' : '#717680' }} />
                    <span className="tooltiptext">Project Settings</span>
                  </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Regular accordion for expanded sidebar */}
        <AccordionGroup sx={{ maxWidth: isSidebarCollapsed ? 60 : 240 }}> {/* Increased maxWidth */}
          {listKeywords?.map((value, index) => {
            // Ensure type-consistent comparison for ownership
            const loggedInUserId = userData && userData.id !== undefined && userData.id !== null ? Number(userData.id) : null;
            const projectOwnerId = value && value.owner_id !== undefined && value.owner_id !== null ? Number(value.owner_id) : null;
            
            const isOwned = loggedInUserId !== null && projectOwnerId !== null && projectOwnerId === loggedInUserId;
            const canEditSettings = isOwned || value.role === 'full_access';

            return (
            <Accordion
              key={`${value.name} - ${index}`}
              expanded={activeIndex === index}
              onChange={(event, expanded) => {
                setActiveIndex(expanded ? index : null);
              }}
            >
              <AccordionSummary sx={{ display: isSidebarCollapsed ? 'none' : 'flex' }}>
                <CustomText
                  class={`login-accordion-title ${activeKeywordSidebar === value.name ? 'active-project' : ''}`}
                  color="b900"
                  bold="medium"
                  size="ss" /* Reverted font size */
                >
                  {value.name}
                </CustomText>
              </AccordionSummary>
              <AccordionDetails className="sidebar-accordion-container">
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "dashboard") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "dashboard")
                  }
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/monitor-04.svg"}
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Dashboard
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "topics") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() => handleOnSelectAccordion(value.name, "topics")}
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/message-alert-circle.svg"}
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Topics
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "summary") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() => handleOnSelectAccordion(value.name, "summary")}
                >
                  <DescriptionOutlined className="sidebar-icon-accordion"></DescriptionOutlined>
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Summary
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "analysis") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "analysis")
                  }
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/pie-chart-01.svg"}
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Analysis
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "comparison") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "comparison")
                  }
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/scales-01.svg"}
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Comparison
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "kol") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() => handleOnSelectAccordion(value.name, "kol")}
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/user-01.svg"}
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    KOL
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "moskal-ai") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "moskal-ai")
                  }
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/monitor-04.svg"} /* Placeholder AI icon */
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Moskal AI
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "mentions") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "mentions")
                  }
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/message-circle-02.svg"} /* Using dashboard icon as placeholder */
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Mentions
                  </CustomText>
                </div>
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "generate-report") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "generate-report")
                  }
                >
                  <img
                    className="sidebar-icon-accordion"
                    src={window.location.origin + "/download-01.svg"} 
                  />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Generate Report
                  </CustomText>
                </div>
                {/* Expanded Project Settings Link */}
                {canEditSettings && (
                <div
                  className={`sidebar-accordion-inner-container ${
                    isMenuActive(value.name, "settings") &&
                    "sidebar-accordion-active"
                  }`}
                  onClick={() =>
                    handleOnSelectAccordion(value.name, "settings")
                  }
                >
                  <SettingsOutlined className="sidebar-icon-accordion" />
                  <CustomText color="b900" bold="medium" size="sss"> {/* Reverted font size */}
                    Settings
                  </CustomText>
                </div>
                )}
              </AccordionDetails>
            </Accordion>
            );
          })}
        </AccordionGroup>
        </div> {/* Close sidebar-main-content wrapper */}
        <div className="sidebar-profile-container tooltip" onClick={accountRoute}>
          <div className="sidebar-profile-left">
            <div className="sidebar-profile-picture"></div>
            <div className="sidebar-profile-text">
              <CustomText size="xsss" color="b900" inline> {/* Reverted font size */}
                {userData.name}
              </CustomText>
              <CustomText size="xsss" color="b500" inline> {/* Reverted font size */}
                {userData.email}
              </CustomText>
            </div>
          </div>
          <NavigateNext sx={{ color: "#717680", width: "16px" }} />
          {isSidebarCollapsed && <span className="tooltiptext">Account Settings</span>}
        </div>

        {/* Removed General Project Settings Link */}
      </div>
    </>
  );
};

export default Sidebar;
