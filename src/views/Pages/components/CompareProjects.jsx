import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import { useEffect, useMemo, useState } from "react";
import CustomText from "../../../components/CustomText";
import CustomButton from "../../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Delete, DeleteOutline } from "@mui/icons-material";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KolComponent from "./KolComponent";
import TopicsComponent from "./TopicsComponent";
import ReactApexChart from "react-apexcharts";

import Chart from "react-apexcharts";

import { SaveAlt } from "@mui/icons-material";
import ContextComponent from "./ContextComponent";
import SentimentByCategory from "./SentimentByCategoryComponent";
import DialogDateFilter from "./DialogDateFilter";
import DialogFilter from "./DialogFilter";
import { useDispatch, useSelector } from "react-redux";
import {
  getAnalysisOverview,
  getMentionSentimentBreakdown,
} from "../../../services/analysisService";
import {
  getContext,
  getKeywordTrends,
  getKolToWatch,
  getTopicToWatch,
} from "../../../services/topicService";
import { filterAndDeduplicate } from "../../../helpers/utils";
import CompareCreateNewUI from "./CompareCreateNewUI";
import LoadingUI from "./LoadingUI";
import { enqueueSnackbar } from "notistack";
import { useDidUpdateEffect } from "../../../helpers/loadState";

const CompareProjects = (props) => {
  const colorVariable = ["#16B364", "#F04438", "#2E90FA"];
  const listKeywords = useSelector((state) => state.keywords.keywords);
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);
  const [globalDateFilter, setGlobalDateFilter] = useState({});
  const [globalAdvanceFilter, setGlobalAdvanceFilter] = useState({});
  const [activeFilterIndex, setActiveFilterIndex] = useState(null);
  const [isDialogMainProjectOpen, setIsDialogMainProjectOpen] = useState(false);
  const [mainProjectFilter, setMainProjectFilter] = useState({});

  const [isShowCompareInput, setIsShowCompareInput] = useState(false);
  const [selectedCompareSubProject, setSelectedCompareSubProject] =
    useState("");
  const [selectedMainProject, setSelectedMainProject] = useState(
    activeKeywords.name
  );
  const [activeSubProject, setActiveSubProject] = useState([]);

  const [overviewData, setOverviewData] = useState([]);
  const [issuesData, setIssuesData] = useState([]);
  const [topicsData, setTopicsData] = useState([]);
  const [kolData, setKolData] = useState([]);
  const [contextData, setContextData] = useState([]);
  const [mentionData, setMentionData] = useState([]);
  const [reachData, setReachData] = useState([]);
  const [positiveSentimentData, setPositiveSentimentData] = useState([]);
  const [negativeSentimentData, setNegativeSentimentData] = useState([]);
  const [sentimentBreakdownData, setSentimentBreakdownData] = useState([]);
  const [channelsShareData, setChannelShareData] = useState([]);
  const [shareOfVoiceData, setShareOfVoiceData] = useState([]);

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isLoadingMostViralIssues, setIsLoadingMostViralIssues] =
    useState(true);
  const [isLoadingMostViralTopics, setIsLoadingMostViralTopics] =
    useState(true);
  const [isLoadingKolToWatch, setIsLoadingKolToWatch] = useState(true);
  const [isLoadingContextOfDiscussion, setIsLoadingContextOfDiscussion] =
    useState(true);
  const [isLoadingMentionReachSentiment, setIsLoadingMentionReachSentiment] =
    useState(true);
  const [isLoadingSentimentBreakdown, setIsLoadingSentimentBreakdown] =
    useState(true);

  useEffect(() => {
    reFetchAPI();
  }, []);

  useDidUpdateEffect(() => {
    setIsFirstLoading(true);
    setSelectedMainProject(activeKeywords.name);
    setActiveSubProject([]);
    setMainProjectFilter({});
    setGlobalDateFilter({});
    setGlobalAdvanceFilter({});
  }, [props.isReloadComponent]);

  useDidUpdateEffect(() => {
    reFetchAPI();
  }, [activeSubProject, mainProjectFilter]);

  useDidUpdateEffect(() => {
    reFetchAPI();
  }, [globalDateFilter, globalAdvanceFilter]);

  useDidUpdateEffect(() => {
    if (isDoneLoading()) {
      setIsFirstLoading(false);
      setIsLoading(false);
      props.handleChangeLoadingMain(false);
    }
  }, [
    isOverviewLoading,
    isLoadingMostViralIssues,
    isLoadingMostViralTopics,
    isLoadingKolToWatch,
    isLoadingContextOfDiscussion,
    isLoadingMentionReachSentiment,
    isLoadingSentimentBreakdown,
  ]);

  const getOverviewData = async (projectData) => {
    setIsOverviewLoading(true);
    try {
      const resp = await getAnalysisOverview(projectData);
      setOverviewData((prev) => [
        ...prev,
        { project_name: projectData.project_name, data: resp },
      ]);
      setShareOfVoiceData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: {
            reach: resp?.total_reach,
            mentions: resp?.total_reach,
          },
        },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...overviewData,
            {
              project_name: projectData.project_name,
              data: {
                reach: resp?.total_reach,
                mentions: resp?.total_reach,
              },
            },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsOverviewLoading(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsOverviewLoading(false);
    }
  };

  const getMostViralIssuesData = async (projectData) => {
    setIsLoadingMostViralIssues(true);
    try {
      const resp = await getTopicToWatch(projectData);
      setIssuesData((prev) => [
        ...prev,
        { project_name: projectData.project_name, data: resp.slice(0, 3) },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...issuesData,
            { project_name: projectData.project_name, data: resp.slice(0, 3) },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsLoadingMostViralIssues(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsLoadingMostViralIssues(false);
    }
  };

  const getMostViralTopicsData = async (projectData) => {
    setIsLoadingMostViralTopics(true);
    try {
      const resp = await getTopicToWatch(projectData);
      setTopicsData((prev) => [
        ...prev,
        { project_name: projectData.project_name, data: resp.slice(0, 3) },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...topicsData,
            { project_name: projectData.project_name, data: resp.slice(0, 3) },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsLoadingMostViralTopics(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsLoadingMostViralTopics(false);
    }
  };

  const getKolToWatchData = async (projectData) => {
    setIsLoadingKolToWatch(true);
    try {
      const resp = await getKolToWatch(projectData);
      setKolData((prev) => [
        ...prev,
        { project_name: projectData.project_name, data: resp.slice(0, 3) },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...kolData,
            { project_name: projectData.project_name, data: resp.slice(0, 3) },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsLoadingKolToWatch(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsLoadingKolToWatch(false);
    }
  };

  const getContextOfDiscussionData = async (projectData) => {
    setIsLoadingContextOfDiscussion(true);
    try {
      const resp = await getContext(projectData);
      setContextData((prev) => [
        ...prev,
        { project_name: projectData.project_name, data: resp.data },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...contextData,
            { project_name: projectData.project_name, data: resp.data },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsLoadingContextOfDiscussion(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsLoadingContextOfDiscussion(false);
    }
  };

  const getMentionReachSentimentData = async (projectData) => {
    setIsLoadingMentionReachSentiment(true);
    try {
      const resp = await getKeywordTrends(projectData);
      setMentionData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.map((value) => ({
            date: value.post_date,
            data: value.total_mentions,
          })),
        },
      ]);
      setReachData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.map((value) => ({
            date: value.post_date,
            data: value.total_reach,
          })),
        },
      ]);
      setPositiveSentimentData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.map((value) => ({
            date: value.post_date,
            data: value.total_positive,
          })),
        },
      ]);
      setNegativeSentimentData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.map((value) => ({
            date: value.post_date,
            data: value.total_negative,
          })),
        },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...negativeSentimentData,

            {
              project_name: projectData.project_name,
              data: resp.map((value) => ({
                date: value.post_date,
                data: value.total_negative,
              })),
            },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsLoadingMentionReachSentiment(false);
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsLoadingMentionReachSentiment(false);
    }
  };

  const getSentimentBreakdownData = async (projectData) => {
    setIsLoadingSentimentBreakdown(true);
    try {
      const resp = await getMentionSentimentBreakdown(projectData);
      setSentimentBreakdownData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp?.sentiment_breakdown,
        },
      ]);
      setChannelShareData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp?.mentions_by_category?.categories,
        },
      ]);
      if (
        filterAndDeduplicate(
          [
            ...channelsShareData,
            {
              project_name: projectData.project_name,
              data: resp?.mentions_by_category?.categories,
            },
          ],
          getListProject(),
          "project_name"
        ).length === getListProject().length
      ) {
        setIsLoadingSentimentBreakdown(false);
      }
    } catch (error) {
      console.log("error", error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      setIsLoadingSentimentBreakdown(false);
    }
  };

  const handleChangeGlobalDateFilterChange = (reqBody) => {
    setGlobalDateFilter(reqBody);
  };

  const handleChangeGlobalAdvanceFilterChange = (reqBody) => {
    setGlobalAdvanceFilter(reqBody);
  };

  const openDialogMainProjectFilterDialog = () => {
    setIsDialogMainProjectOpen(true);
  };

  const handleOpenDayDialog = () => {
    setIsDialogDayOpen(true);
  };

  const handleCloseDayDialog = () => {
    setIsDialogDayOpen(false);
  };

  const handleOpenFilterDialog = () => {
    setIsDialogFilterOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setIsDialogFilterOpen(false);
  };

  const isCreateNewProject = () => {
    return listKeywords?.length === 1;
  };

  const handleAddSubProject = () => {
    setIsShowCompareInput(true);
  };

  const handleClickCompareSubProject = () => {
    setActiveSubProject([
      ...activeSubProject,
      {
        name: selectedCompareSubProject,
        filter: {},
      },
    ]);
    setIsShowCompareInput(false);
  };

  const isShowAddMoreProjectText = () => {
    return listKeywords.length - 2 >= activeSubProject.length && !isHaveEmpty();
  };

  const isHaveEmpty = () => {
    return activeSubProject.some((item) => item.name === "");
  };

  function getKeywordsByName(dataArray, name) {
    const item = dataArray.find((obj) => obj.name === name);
    return item ? item.keywords : [];
  }

  const handleSelectCompareSubProject = (event, newValue) => {
    setSelectedCompareSubProject(newValue);
  };

  const changeSelectedMainProject = (event, newValue) => {
    if (newValue !== null) {
      setSelectedMainProject(newValue);
    }
  };

  const handleDeleteSubProject = (index) => {
    const updated = [...activeSubProject];
    updated.splice(index, 1);
    setActiveSubProject(updated);
  };

  const reFetchAPI = async () => {
    // Clear all data before fetching new
    setIsLoading(true);
    setOverviewData([]);
    setIssuesData([]);
    setTopicsData([]);
    setKolData([]);
    setContextData([]);
    setMentionData([]);
    setReachData([]);
    setPositiveSentimentData([]);
    setNegativeSentimentData([]);

    const mainReq = generateReqBody(globalDateFilter, {
      ...(mainProjectFilter.importance
        ? mainProjectFilter
        : globalAdvanceFilter),
      project_name: selectedMainProject,
    });

    await Promise.all([
      getOverviewData(mainReq),
      getMostViralTopicsData(mainReq),
      getMostViralIssuesData(mainReq),
      getKolToWatchData(mainReq),
      getContextOfDiscussionData(mainReq),
      getMentionReachSentimentData(mainReq),
      getSentimentBreakdownData(mainReq),
      ...activeSubProject.map((value) => {
        const req = generateReqBody(globalDateFilter, {
          ...(value.filter?.importance ? value.filter : globalAdvanceFilter),
          project_name: value.name,
        });
        return Promise.all([
          getOverviewData(req),
          getMostViralTopicsData(req),
          getMostViralIssuesData(req),
          getKolToWatchData(req),
          getContextOfDiscussionData(req),
          getMentionReachSentimentData(req),
          getSentimentBreakdownData(req),
        ]);
      }),
    ]);
  };

  const isDoneLoading = () => {
    return (
      !isOverviewLoading &&
      !isLoadingMostViralIssues &&
      !isLoadingMostViralTopics &&
      !isLoadingKolToWatch &&
      !isLoadingContextOfDiscussion &&
      !isLoadingMentionReachSentiment &&
      !isLoadingSentimentBreakdown
    );
  };
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };

  const getListProject = () => {
    const mainProject = selectedMainProject;
    const subProject = activeSubProject.map((value) => value.name);
    return [mainProject, ...subProject];
  };

  const getSelectProjectComponent = () => {
    return (
      <Select
        placeholder="Select project to compare with"
        indicator={<KeyboardArrowDown />}
        sx={{
          width: "90%",
          height: 40,
          [`& .${selectClasses.indicator}`]: {
            transition: "0.2s",
            [`&.${selectClasses.expanded}`]: {
              transform: "rotate(-180deg)",
            },
          },
        }}
        value={selectedCompareSubProject}
        onChange={handleSelectCompareSubProjectFromComponent}
      >
        {listKeywords.map((value, index) => (
          <Option value={value.name}>{value.name}</Option>
        ))}
      </Select>
    );
  };

  const handleSelectCompareSubProjectFromComponent = (event, newValue) => {
    if (newValue !== null) {
      setSelectedCompareSubProject(newValue);
      setActiveSubProject([
        ...activeSubProject,
        {
          name: newValue,
          filter: {},
        },
      ]);
      setIsShowCompareInput(false);
    }
  };
  const generateReqBody = (dateFilter, advanceFilter) => {
    const data = {
      keywords: advanceFilter?.keywords
        ? advanceFilter?.keywords
        : getKeywordsByName(listKeywords, advanceFilter?.project_name),
      search_exact_phrases: advanceFilter?.search_exact_phrases
        ? advanceFilter?.search_exact_phrases
        : false,
      case_sensitive: false,
      sentiment:
        advanceFilter?.sentiment?.length > 0
          ? advanceFilter?.sentiment
          : ["positive", "negative", "neutral"],
      ...(dateFilter?.date_filter && {
        date_filter: dateFilter?.date_filter,
      }),
      ...(dateFilter?.custom_start_date && {
        custom_start_date: dateFilter?.custom_start_date,
      }),
      ...(dateFilter?.custom_end_date && {
        custom_end_date: dateFilter?.custom_end_date,
      }),
      channels:
        advanceFilter?.channels?.length > 0 ? advanceFilter?.channels : [],
      importance: advanceFilter?.importance
        ? advanceFilter?.importance
        : "all mentions",
      influence_score_min: advanceFilter?.influence_score_min
        ? advanceFilter?.influence_score_min
        : 0,
      influence_score_max: advanceFilter?.influence_score_max
        ? advanceFilter?.influence_score_max
        : 1000,
      ...(advanceFilter?.region?.length > 0 && {
        region: advanceFilter?.region,
      }),
      ...(advanceFilter?.language?.length > 0 && {
        language: advanceFilter?.language,
      }),
      ...(advanceFilter?.domain?.length > 0 && {
        domain: advanceFilter?.domain,
      }),
      owner_id: `${activeKeywords.owner_id}`,
      project_name: advanceFilter.project_name,
    };
    return data;
  };

  const updateFilterActiveSubProject = (index, newFilter) => {
    const updated = [...activeSubProject];
    updated[index].filter = newFilter;
    setActiveSubProject(updated);
    setActiveFilterIndex(null); // Close modal
  };

  const handleChangeMainProjectAdvanceFilter = (reqBody) => {
    setMainProjectFilter(reqBody);
  };

  return (
    <>
      <div className="comparison-compare-projects-filter-container">
        {isFirstLoading ? (
          <>
            <div className="compare-filter-loader skeleton-loader"></div>
          </>
        ) : (
          <>
            <div className="comparison-compare-project-left-filter">
              {/* <CustomButton sx={{ padding: "8px 16px" }}>
            <CustomText bold="semibold" size="xls" inline>
              Save Comparison
            </CustomText>
          </CustomButton> */}
              <CustomButton
                sx={{ padding: "8px 16px" }}
                variant="outlined"
                endDecorator={<CalendarTodayIcon />}
              >
                <CustomText
                  bold="semibold"
                  size="xls"
                  inline
                  onClick={handleOpenDayDialog}
                >
                  Last 30 days
                </CustomText>
              </CustomButton>
              {/* <Tabs
            aria-label="tabs"
            defaultValue={0}
            sx={{
              bgcolor: "transparent",
              margin: "15px 0px",
              width: "fit-content",
            }}
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
                  bgcolor: "background.surface",
                },
              }}
            >
              <Tab disableIndicator sx={{ height: "44px" }} value={0}>
                <CustomText bold="semibold" size="xls" inline>
                  Days
                </CustomText>
              </Tab>
              <Tab disableIndicator sx={{ height: "44px" }} value={1}>
                <CustomText bold="semibold" size="xls" inline>
                  Weeks
                </CustomText>
              </Tab>
              <Tab disableIndicator sx={{ height: "44px" }} value={2}>
                <CustomText bold="semibold" size="xls" inline>
                  Months
                </CustomText>
              </Tab>
            </TabList>
          </Tabs> */}
            </div>
            <CustomButton
              sx={{ padding: "8px 16px" }}
              variant="outlined"
              endDecorator={
                <img
                  className="comparison-compare-projects-filter-icon"
                  src={window.location.origin + "/filter-funnel-02.svg"}
                />
              }
              onClick={handleOpenFilterDialog}
            >
              <CustomText bold="semibold" size="xls" inline>
                Filter all
              </CustomText>
            </CustomButton>
          </>
        )}
      </div>
      <div className="comparison-compare-projects-content-container">
        {isFirstLoading ? (
          <>
            <div>
              <div className="compare-first-loader skeleton-loader"></div>
              <div className="compare-second-loader skeleton-loader"></div>
              <div className="compare-third-loader skeleton-loader"></div>
            </div>
          </>
        ) : (
          <>
            <div className="comparison-compare-projects-header">
              <div className="comparison-compare-projects-header-title">
                <div className="comparison-compare-projects-header-title-dot"></div>
                <CustomText bold="semibold" size="lgs" color="b900" inline>
                  {selectedMainProject}
                </CustomText>
              </div>
              <div className="comparison-compare-projects-header-right">
                <Select
                  placeholder="Switch Project"
                  indicator={<KeyboardArrowDown />}
                  sx={{
                    width: 174,
                    height: 40,
                    [`& .${selectClasses.indicator}`]: {
                      transition: "0.2s",
                      [`&.${selectClasses.expanded}`]: {
                        transform: "rotate(-180deg)",
                      },
                    },
                  }}
                  value={selectedMainProject}
                  onChange={(e, newValue) =>
                    changeSelectedMainProject(e, newValue)
                  }
                >
                  {listKeywords.map((value, index) => (
                    <Option value={value.name}>{value.name}</Option>
                  ))}
                </Select>
                <CustomButton
                  sx={{ padding: "8px 16px" }}
                  variant="outlined"
                  endDecorator={
                    <img
                      className="comparison-compare-projects-filter-icon"
                      src={window.location.origin + "/filter-funnel-02.svg"}
                    />
                  }
                  onClick={openDialogMainProjectFilterDialog}
                >
                  <CustomText bold="semibold" size="xls" inline>
                    Filter
                  </CustomText>
                </CustomButton>
              </div>
            </div>
            {activeSubProject.map((value, index) => (
              <div className="comparison-compare-projects-header">
                <div className="comparison-compare-projects-header-title">
                  <div
                    className="comparison-compare-projects-header-title-empty"
                    style={{ backgroundColor: getColor(index) }}
                  ></div>
                  <CustomText bold="semibold" size="lgs" color="b900" inline>
                    {value.name}
                  </CustomText>
                </div>
                <div className="comparison-compare-projects-header-right">
                  <CustomButton
                    sx={{ padding: "8px 16px" }}
                    variant="outlined"
                    endDecorator={
                      <img
                        className="comparison-compare-projects-filter-icon"
                        src={window.location.origin + "/filter-funnel-02.svg"}
                      />
                    }
                    onClick={() => setActiveFilterIndex(index)}
                  >
                    <CustomText bold="semibold" size="xls" inline>
                      Filter
                    </CustomText>
                  </CustomButton>
                  <CustomButton
                    variant="outlined"
                    onClick={() => handleDeleteSubProject(index)}
                  >
                    <DeleteOutline sx={{ width: "20px" }} />
                  </CustomButton>
                </div>
              </div>
            ))}
            {isShowCompareInput && (
              <div className="comparison-compare-projects-header">
                <Select
                  placeholder="Select project to compare with"
                  indicator={<KeyboardArrowDown />}
                  sx={{
                    width: "90%",
                    height: 40,
                    [`& .${selectClasses.indicator}`]: {
                      transition: "0.2s",
                      [`&.${selectClasses.expanded}`]: {
                        transform: "rotate(-180deg)",
                      },
                    },
                  }}
                  value={selectedCompareSubProject}
                  onChange={handleSelectCompareSubProject}
                >
                  {listKeywords.map((value, index) => (
                    <Option value={value.name}>{value.name}</Option>
                  ))}
                </Select>
                <CustomButton
                  sx={{ padding: "8px 16px" }}
                  onClick={handleClickCompareSubProject}
                >
                  <CustomText bold="semibold" size="xls" inline>
                    Compare
                  </CustomText>
                </CustomButton>
              </div>
            )}

            {isShowAddMoreProjectText() && !isShowCompareInput && (
              <div>
                <CustomText
                  size="xls"
                  bold="semibold"
                  color="brand"
                  onClick={handleAddSubProject}
                  pointer
                >
                  Compare more project +
                </CustomText>
              </div>
            )}
            {isCreateNewProject() && (
              <div className="comparison-compare-projects-box comparison-compare-projects-box-create-new">
                <div className="comparison-compare-projects-create-new-content">
                  <div>
                    <img
                      className="comparison-compare-projects-create-new-icon"
                      src={window.location.origin + "/project.svg"}
                    />
                  </div>
                  <div className="comparison-compare-projects-create-new-text">
                    <div>
                      <CustomText color="b900" size="lgs" bold="semibold">
                        Create a new project keywords to compare with.
                      </CustomText>
                      <CustomText color="b900" size="lgs" bold="semibold">
                        Each one you create will appear here.
                      </CustomText>
                    </div>
                    <CustomButton sx={{ padding: "8px 16px" }}>
                      <CustomText bold="semibold" size="xls" inline>
                        Create a new project
                      </CustomText>
                    </CustomButton>
                  </div>
                </div>
              </div>
            )}
            {isLoading ? (
              <>
                <LoadingUI />
              </>
            ) : (
              <>
                <OverviewView
                  data={overviewData}
                  listProject={getListProject()}
                />
                {getListProject()?.length <= 2 && (
                  <>
                    <MostViralIssuesView
                      data={issuesData}
                      listProject={getListProject()}
                      selectComponent={getSelectProjectComponent}
                      listKeywords={listKeywords}
                    />
                    <MostViralTopicsView
                      data={topicsData}
                      listProject={getListProject()}
                      selectComponent={getSelectProjectComponent}
                      listKeywords={listKeywords}
                    />
                    <KolToWatchView
                      data={kolData}
                      listProject={getListProject()}
                      selectComponent={getSelectProjectComponent}
                      listKeywords={listKeywords}
                    />
                    <ContextOfDiscussionView
                      data={contextData}
                      listProject={getListProject()}
                      selectComponent={getSelectProjectComponent}
                      listKeywords={listKeywords}
                    />
                  </>
                )}

                <div className="comparison-compare-projects-box">
                  <div>Mentions</div>
                  <GraphChart
                    data={mentionData}
                    listProject={getListProject()}
                  />
                </div>

                <div className="comparison-compare-projects-box">
                  <div>Reach</div>
                  <GraphChart data={reachData} listProject={getListProject()} />
                </div>

                <div className="comparison-compare-projects-box">
                  <div>Positive Sentiment :)</div>
                  <GraphChart
                    data={positiveSentimentData}
                    listProject={getListProject()}
                  />
                </div>

                <div className="comparison-compare-projects-box">
                  <div>Negative Sentiment :(</div>
                  <GraphChart
                    data={negativeSentimentData}
                    listProject={getListProject()}
                  />
                </div>
                {getListProject()?.length <= 2 && (
                  <>
                    <ShareOfVoiceView
                      data={shareOfVoiceData}
                      listProject={getListProject()}
                    />

                    <div className="comparison-compare-projects-box-kol">
                      <div
                        className="comparison-compare-projects-box"
                        style={{ flex: 1 }}
                      >
                        Sentiment breakdown
                        <div>
                          <SentimentStackedChart
                            data={sentimentBreakdownData}
                            listProject={getListProject()}
                          />
                        </div>
                      </div>
                      <div
                        className="comparison-compare-projects-box"
                        style={{ flex: 1 }}
                      >
                        Channels share
                        <div>
                          <PlatformBreakdownChart
                            data={channelsShareData}
                            listProject={getListProject()}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {getListProject()?.length > 2 && (
                  <div
                    className="comparison-compare-projects-box"
                    style={{ flex: 1 }}
                  >
                    Sentiment breakdown
                    <div>
                      <SentimentStackedChart
                        data={sentimentBreakdownData}
                        listProject={getListProject()}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      {/* Global Filter */}
      <DialogDateFilter
        open={isDialogDayOpen}
        onClose={handleCloseDayDialog}
        handleChangeFilter={handleChangeGlobalDateFilterChange}
      />
      <DialogFilter
        open={isDialogFilterOpen}
        onClose={handleCloseFilterDialog}
        handleChangeFilter={handleChangeGlobalAdvanceFilterChange}
      />

      {/* Individual Filter */}
      <DialogFilter
        open={isDialogMainProjectOpen}
        onClose={() => setIsDialogMainProjectOpen(false)}
        handleChangeFilter={handleChangeMainProjectAdvanceFilter}
      />

      {activeFilterIndex !== null && (
        <DialogFilter
          open={activeFilterIndex !== null}
          onClose={() => setActiveFilterIndex(null)}
          handleChangeFilter={(newFilter) =>
            updateFilterActiveSubProject(activeFilterIndex, newFilter)
          }
        />
      )}
    </>
  );
};

const OverviewView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");
  const columnCount = (filterData.length === 1 ? 2 : filterData.length) + 1;
  const columnWidth = `${100 / columnCount}%`;

  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];

  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };

  const getMentions = () => {
    const values = filterData.map((v) => v.data?.total_mentions?.value ?? 0);
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.total_mentions?.value ?? 0;
      const display = v.data?.total_mentions?.display ?? "-";
      return (
        <td key={i}>
          {display}
          {val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getSocialMediaMentions = () => {
    const values = filterData.map(
      (v) => v.data?.social_media_mentions?.value ?? 0
    );
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.social_media_mentions?.value ?? 0;
      const display = v.data?.social_media_mentions?.display ?? "-";
      return (
        <td key={i}>
          {display}
          {val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getNonSocialMediaMentions = () => {
    const values = filterData.map(
      (v) => v.data?.non_social_media_mentions?.value ?? 0
    );
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.non_social_media_mentions?.value ?? 0;
      const display = v.data?.non_social_media_mentions?.display ?? "-";
      return (
        <td key={i}>
          {display}
          {val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getPositiveMentions = () => {
    const values = filterData.map((v) => v.data?.positive_mentions?.value ?? 0);
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.positive_mentions?.value ?? 0;
      const percent =
        v.data?.positive_mentions?.growth_percentage_display ?? "-";
      const display = v.data?.positive_mentions?.growth_display ?? "-";
      return (
        <td key={i}>
          {percent} ({display}){val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getNegativeMentions = () => {
    const values = filterData.map((v) => v.data?.negative_mentions?.value ?? 0);
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.negative_mentions?.value ?? 0;
      const percent =
        v.data?.negative_mentions?.growth_percentage_display ?? "-";
      const display = v.data?.negative_mentions?.growth_display ?? "-";
      return (
        <td key={i}>
          {percent} ({display}){val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getSocialMediaReach = () => {
    const values = filterData.map(
      (v) => v.data?.social_media_reach?.value ?? 0
    );
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.social_media_reach?.value ?? 0;
      const display = v.data?.social_media_reach?.display ?? "-";
      return (
        <td key={i}>
          {display}
          {val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getNonSocialMediaReach = () => {
    const values = filterData.map(
      (v) => v.data?.non_social_media_reach?.value ?? 0
    );
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.non_social_media_reach?.value ?? 0;
      const display = v.data?.non_social_media_reach?.display ?? "-";
      return (
        <td key={i}>
          {display}
          {val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  const getPresenceScore = () => {
    const values = filterData.map((v) => v.data?.presence_score?.value ?? 0);
    const max = Math.max(...values);
    return filterData.map((v, i) => {
      const val = v.data?.presence_score?.value ?? 0;
      const display = v.data?.presence_score?.display ?? "-";
      return (
        <td key={i}>
          {display}/100{val === max && <span> ⭐</span>}
        </td>
      );
    });
  };

  return (
    <div className="comparison-compare-projects-box">
      <div className="comparison-compare-projects-overview-header">
        <CustomText color="b900" bold="semibold" size="lgs" inline>
          Overview
        </CustomText>
        <CustomText
          color="brand"
          bold="semibold"
          size="2xls"
          class="comparison-compare-projects-overview-export"
          pointer
          inline
        >
          Export to CSV
          <SaveAlt sx={{ width: "20px" }} />
        </CustomText>
      </div>
      <table className="comparison-compare-projects-overview-table">
        <thead>
          <tr>
            <th style={{ width: "247px" }}>Project</th>
            {filterData.map((value, index) => (
              <th
                className="comparison-compare-project-overview-table-head"
                style={{
                  "--after-bg": getColor(index),
                  width: columnWidth,
                }}
                key={index}
              >
                {value.project_name}
              </th>
            ))}
            {filterData.length === 1 && (
              <th
                className="comparison-compare-project-overview-table-head"
                style={{ "--after-bg": getColor(1), width: columnWidth }}
              >
                No project keywords to compare with
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Mentions</td>
            {getMentions()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Social media mentions</td>
            {getSocialMediaMentions()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Non-social media mentions</td>
            {getNonSocialMediaMentions()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Positive mentions</td>
            {getPositiveMentions()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Negative mentions</td>
            {getNegativeMentions()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Social media reach</td>
            {getSocialMediaReach()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Non-social media reach</td>
            {getNonSocialMediaReach()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
          <tr>
            <td>Presence score</td>
            {getPresenceScore()}
            {filterData.length === 1 && <td>-</td>}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const MostViralIssuesView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };
  const isShowSelect = () => {
    return listProject.length === 1 && listKeywords.length > 1;
  };
  const isShowCreate = () => {
    return listKeywords.length === 1;
  };
  return (
    <div className="comparison-compare-projects-box">
      Most viral issues ❗❗
      <div className="comparison-compare-projects-box-issues">
        {filterData?.map((value, index) => (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(index),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                {value.project_name}
              </CustomText>
            </div>
            {value?.data?.map((topics, indexTopics) => (
              <TopicsComponent
                key={`topics-${indexTopics}`}
                data={topics}
                borderBottom={indexTopics + 1 !== value?.data?.length}
              />
            ))}
          </div>
        ))}
        {filterData?.length === 1 && (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(1),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                No Project keywords to compare with
              </CustomText>
            </div>
            {isShowSelect() && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {props.selectComponent()}
              </div>
            )}
            {isShowCreate() && <CompareCreateNewUI />}
          </div>
        )}
      </div>
    </div>
  );
};

const KolToWatchView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };
  const isShowSelect = () => {
    return listProject.length === 1 && listKeywords.length > 1;
  };
  const isShowCreate = () => {
    return listKeywords.length === 1;
  };
  return (
    <div className="comparison-compare-projects-box">
      <div>KOL to watch</div>
      <div className="comparison-compare-projects-box-kol">
        {filterData?.map((value, index) => (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(index),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                {value.project_name}
              </CustomText>
            </div>
            {value?.data?.map((kol, indexKol) => (
              <KolComponent
                key={`kol-${indexKol}`}
                data={kol}
                borderBottom={indexKol + 1 !== value?.data?.length}
              />
            ))}
          </div>
        ))}
        {filterData?.length === 1 && (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(1),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                No Project keywords to compare with
              </CustomText>
            </div>
            {isShowSelect() && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {props.selectComponent()}
              </div>
            )}
            {isShowCreate() && <CompareCreateNewUI />}
          </div>
        )}
      </div>
    </div>
  );
};

const MostViralTopicsView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };
  const isShowSelect = () => {
    return listProject.length === 1 && listKeywords.length > 1;
  };
  const isShowCreate = () => {
    return listKeywords.length === 1;
  };
  return (
    <div className="comparison-compare-projects-box">
      Most viral topics 🔥
      <div className="comparison-compare-projects-box-issues">
        {filterData?.map((value, index) => (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(index),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                {value.project_name}
              </CustomText>
            </div>
            {value?.data?.map((topics, indexTopics) => (
              <TopicsComponent
                key={`topics-${indexTopics}`}
                data={topics}
                borderBottom={indexTopics + 1 !== value?.data?.length}
              />
            ))}
          </div>
        ))}
        {filterData?.length === 1 && (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(1),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                No Project keywords to compare with
              </CustomText>
            </div>
            {isShowSelect() && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {props.selectComponent()}
              </div>
            )}
            {isShowCreate() && <CompareCreateNewUI />}
          </div>
        )}
      </div>
    </div>
  );
};

const ContextOfDiscussionView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };
  const isShowSelect = () => {
    return listProject.length === 1 && listKeywords.length > 1;
  };
  const isShowCreate = () => {
    return listKeywords.length === 1;
  };
  return (
    <div className="comparison-compare-projects-box">
      <div>Context of a discussion</div>
      <div className="comparison-compare-projects-box-kol">
        {filterData?.map((value, index) => (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(index),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                {value.project_name}
              </CustomText>
            </div>

            <ContextComponent data={value.data} />
          </div>
        ))}
        {filterData?.length === 1 && (
          <div style={{ flex: 1 }}>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(1),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                No Project keywords to compare with
              </CustomText>
            </div>
            {isShowSelect() && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {props.selectComponent()}
              </div>
            )}
            {isShowCreate() && <CompareCreateNewUI />}
          </div>
        )}
      </div>
    </div>
  );
};

const GraphChart = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");
  const options = {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ["#2E90FA", "#079455", "#F04438"],
    xaxis: {
      type: "datetime",
      labels: {
        rotate: 0,
        formatter: function (value) {
          const date = new Date(value);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }); // e.g., "25 Mar"
        },
      },
      tickAmount: 6,
    },
    tooltip: {
      x: {
        show: true,
        format: "dd",
      },
    },
  };
  const series = filterData?.map((value) => ({
    name: value.project_name,
    data: value?.data.map((item, index) => {
      const date = new Date(item.date).toISOString();
      return {
        x: date,
        y: item.data,
      };
    }),
  }));

  return (
    <>
      <div>
        <div className="keyword-component-text">
          <CustomText color="b400" size="2xls" inline>
            Hover on the cart to see detail
          </CustomText>
        </div>
        <div>
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
          />
        </div>
      </div>
    </>
  );
};

const ShareOfVoiceView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");

  const totalReach = filterData.reduce(
    (sum, item) => sum + item.data.reach.value,
    0
  );
  const seriesReach = filterData.map((item) =>
    totalReach === 0 ? 0 : (item.data.reach.value / totalReach) * 100
  );

  const totalMentions = filterData.reduce(
    (sum, item) => sum + item.data.mentions?.value,
    0
  );
  const seriesMentions = filterData.map((item) =>
    // Bug fix: was using item.data.reach.value, should be item.data.mentions.value
    totalMentions === 0 ? 0 : (item.data.mentions.value / totalMentions) * 100
  );

  const options = (type, seriesData) => { // Added seriesData parameter
    return {
      chart: {
        type: "donut",
      },
      labels: filterData.map((value) => value.project_name),
      colors: ["#6DD5FA", "#C6FFDD"], // Consider making these dynamic or more contrasted if needed
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "right",
        markers: {
          radius: 12,
        },
        formatter: function (seriesName, opts) {
          // Use the passed seriesData for correct percentage
          const value = seriesData[opts.seriesIndex];
          return `${value.toFixed(2)}% ${seriesName}`; // Format to 2 decimal places
        },
      },
      tooltip: { // Added tooltip configuration
        y: {
          formatter: function (val) {
            return val.toFixed(2) + "%";
          },
        },
        theme: 'light' // Use light theme for tooltip for better contrast
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "16px",
                color: "#333",
                offsetY: -10,
              },
              value: {
                show: false,
              },
              total: {
                show: true,
                label: type,
                fontSize: "20px",
                fontWeight: 600,
                color: "#333",
              },
            },
          },
        },
      },
      fill: {
        type: "gradient",
      },
    };
  };

  return (
    <div className="comparison-compare-projects-box">
      <div>Share of voice</div>
      <div className="comparison-compare-projects-box-kol">
        <div style={{ flex: 1 }}>
          <div>
            <Chart
              options={options("Reach", seriesReach)} // Pass seriesReach
              series={seriesReach}
              type="donut"
              width="100%"
              height="296px"
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div>
            <Chart
              options={options("Mentions", seriesMentions)} // Pass seriesMentions
              series={seriesMentions}
              type="donut"
              width="100%"
              height="296px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
const SentimentStackedChart = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");

  // Step 1: Transform each sentiment into a percentage
  const series = ["positive", "neutral", "negative"].map((sentimentType) => ({
    name: sentimentType.charAt(0).toUpperCase() + sentimentType.slice(1),
    data: filterData.map((project) => {
      const sentiment = project.data;
      const total = sentiment.positive + sentiment.neutral + sentiment.negative;

      const value = sentiment[sentimentType];
      return total === 0 ? 0 : Number(((value / total) * 100).toFixed(2));
    }),
  }));

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false,
      },
    },
    colors: ["#4DEF8E", "#F5F5F5", "#F49062"], // Positive, Neutral, Negative
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "64px",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: filterData.map((value) => value.project_name),
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}%`,
      },
      max: 100,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "left",
      markers: {
        radius: 4,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    },
    fill: {
      opacity: 1,
      type: "solid",
    },
    title: {
      text: "Hover on the chart to see detail",
      align: "center",
      style: {
        fontSize: "14px",
        fontWeight: 400,
        color: "#888",
      },
    },
  };

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

const PlatformBreakdownChart = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_name");

  const platformSet = new Set();
  filterData.forEach((project) => {
    project.data.forEach((platform) => {
      platformSet.add(platform.name);
    });
  });
  const uniquePlatforms = Array.from(platformSet);
  const series = uniquePlatforms.map((platformName) => {
    return {
      name: platformName,
      data: filterData.map((project) => {
        const found = project.data.find((d) => d.name === platformName);
        return found ? found.percentage : 0;
      }),
    };
  });

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      stackType: "100%",
      toolbar: { show: false },
    },
    xaxis: {
      categories: filterData.map((value) => value.project_name),
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}%`,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        columnWidth: "64px",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      markers: {
        radius: 6,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    title: {
      text: "Hover on the chart to see detail",
      align: "center",
      style: {
        fontSize: "14px",
        fontWeight: 400,
        color: "#888",
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

export default CompareProjects;
