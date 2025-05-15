import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import { useEffect, useState } from "react";
import CustomText from "../../components/CustomText";
import CustomButton from "../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KolComponent from "./components/KolComponent";
import TopicsComponent from "./components/TopicsComponent";
import ReactApexChart from "react-apexcharts";

import Chart from "react-apexcharts";

import "./styles/Comparison.css";
import { SaveAlt } from "@mui/icons-material";
import ContextComponent from "./components/ContextComponent";
import SentimentByCategory from "./components/SentimentByCategoryComponent";
import CompareProjects from "./components/CompareProjects";
import ComparePeriods from "./components/ComparePeriods";
import CompareTopics from "./components/CompareTopics";
import { useParams } from "react-router";
import { useDidUpdateEffect } from "../../helpers/loadState";

const Comparison = () => {
  const { keyword } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloadComponent, setIsReloadComponent] = useState(false);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    setActiveTab(0);
    setIsReloadComponent(!isReloadComponent);
  }, [keyword]);

  const isTabActive = (tab) => {
    return tab === activeTab;
  };

  const handleOnChangeTab = (event, newValue) => {
    setIsLoading(true);
    setActiveTab(newValue);
  };

  const handleChangeLoadingMain = (value) => {
    setIsLoading(value);
  };

  const getComponent = () => {
    if (activeTab === 0) {
      return (
        <CompareProjects
          handleChangeLoadingMain={handleChangeLoadingMain}
          isReloadComponent={isReloadComponent}
        />
      );
    } else if (activeTab === 1) {
      return (
        <ComparePeriods handleChangeLoadingMain={handleChangeLoadingMain} />
      );
    } else if (activeTab === 2) {
      return (
        <CompareTopics handleChangeLoadingMain={handleChangeLoadingMain} />
      );
    }
  };
  return (
    <>
      <div className="comparison-tab-container">
        <div className="compare-filter-main">
          {isLoading ? (
            <>
              <div className="compare-filter-loader-main skeleton-loader"></div>
            </>
          ) : (
            <>
              <Tabs
                aria-label="tabs"
                defaultValue={0}
                sx={{
                  bgcolor: "transparent",
                  margin: "15px 0px",
                  width: "100%",
                }}
                value={activeTab}
                onChange={handleOnChangeTab}
              >
                <TabList
                  disableUnderline
                  sx={{
                    p: 0.5,
                    gap: 0.5,
                    borderRadius: "8px",
                    bgcolor: "background.level1",
                    justifyContent: "space-between",
                    [`& .${tabClasses.root}[aria-selected="true"]`]: {
                      boxShadow: "sm",
                      bgcolor: "#0047AB",
                    },
                  }}
                >
                  <Tab
                    disableIndicator
                    sx={{ width: "33%", height: "44px" }}
                    value={0}
                  >
                    <CustomText
                      color={isTabActive(0) ? "b25" : "b500"}
                      bold="semibold"
                      size="xls"
                      inline
                    >
                      Compare projects
                    </CustomText>
                  </Tab>
                  <Tab
                    disableIndicator
                    sx={{ width: "33%", height: "44px" }}
                    value={1}
                  >
                    <CustomText
                      color={isTabActive(1) ? "b25" : "b500"}
                      bold="semibold"
                      size="xls"
                      inline
                    >
                      Compare periods
                    </CustomText>
                  </Tab>
                  <Tab
                    disableIndicator
                    sx={{ width: "33%", height: "44px" }}
                    value={2}
                  >
                    <CustomText
                      color={isTabActive(2) ? "b25" : "b500"}
                      bold="semibold"
                      size="xls"
                      inline
                    >
                      Compare topics
                    </CustomText>
                  </Tab>
                </TabList>
              </Tabs>
            </>
          )}
        </div>
        {getComponent()}
      </div>
    </>
  );
};

export default Comparison;
