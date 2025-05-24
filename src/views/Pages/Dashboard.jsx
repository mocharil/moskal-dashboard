import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import React, { useState, useEffect, useRef } from "react";
import InputBase from "@mui/material/InputBase";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Checkbox from "@mui/joy/Checkbox";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";

import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";

import CustomText from "../../components/CustomText";
import CustomButton from "../../components/CustomButton";

import "./styles/Dashboard.css";
import CustomContentBox from "../../components/CustomContentBox";
import TopicsComponent from "./components/TopicsComponent";
import KolComponent from "./components/KolComponent";
import KeywordComponent from "./components/KeywordComponent";
import MentionComponent from "./components/MentionComponent";
import ContextComponent from "./components/ContextComponent";
import { useSelector } from "react-redux";
import {
  getKolToWatch,
  getTopicToWatch,
  getKeywordTrends,
  getContext,
  getMentions,
} from "../../services/topicService";
import {
  getLimitArray,
  sortByField,
  sortByFieldsMultiple,
} from "../../helpers/utils";
import DialogFilter from "./components/DialogFilter";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import DialogDateFilter from "./components/DialogDateFilter";
import { useNavigate } from "react-router-dom";
import LoadingUI from "./components/LoadingUI";
import NoDataUI from "./components/NoDataUI";
import { enqueueSnackbar } from "notistack";
import { useParams } from "react-router-dom";
import { useDidUpdateEffect } from "../../helpers/loadState";

const Dashboard = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const [searchBoxValue, setSearchBoxValue] = useState("");
  const [isSearchExactPhraseChecked, setIsSearchExactPhraseChecked] =
    useState(false);

  const tabListTopic = ["Issues", "Most Viral"];
  const [activeListTopic, setActiveListTopic] = useState("Issues");

  const tabListKol = ["Most negative", "Most viral"];
  const [activeTabListKol, setActiveTabListKol] = useState("Most negative");

  const tabListKeyword = ["Mentions & Reach", "Sentiment"];
  const [activeTabKeyword, setActiveKeyword] = useState("Mentions & Reach");

  const tabListContext = ["All", "Positive", "Negative"];
  const [activeTabContext, setActiveTabContext] = useState("All");

  const tabListMentions = ["Popular first", "Recent"];
  const [activeTabMentions, setActiveTabMentions] = useState("Popular first");

  const [activeFilterTab, setActiveFilterTab] = useState("all platform");

  const [topicsData, setTopicsData] = useState([]);
  const [filterTopicsData, setFilterTopicsData] = useState([]);

  const [kolData, setKolData] = useState([]);
  const [filterKolData, setFilterKolData] = useState([]);

  const [keywordData, setKeywordData] = useState([]);

  const [contextData, setContextData] = useState([]);

  const [mentionData, setMentionData] = useState([]);

  const [hasFetched, setHasFetched] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingTopic, setIsLoadingTopic] = useState(true);
  const [isLoadingKol, setIsLoadingKol] = useState(true);
  const [isLoadingKeyword, setIsLoadingKeyword] = useState(true);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isLoadingMentions, setIsLoadingMentions] = useState(true);

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);

  const [mentionPage, setMentionPage] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1000,
    total_posts: 10000,
  });

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);

  const [dataReqBody, setDataReqBody] = useState({
    owner_id: `${activeKeywords.owner_id}`,
    project_name: activeKeywords.name,
    channels: [],
  });

  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});
  const [dataDateFilter, setDataDateFilter] = useState({});
  
  // Ref to track if initial data has been loaded
  const initialLoadRef = useRef(false);

  // useEffect(() => { // Optional: Keep for debugging if needed, otherwise remove
  //   console.log("active key", activeKeywords);
  //   console.log("userdata", userData);
  // }, []);

  const fetchAllData = () => {
    setIsLoading(true); // Signal that a batch of fetches has started.
    // Set all individual loading states to true when a full refresh is triggered
    setIsLoadingTopic(true);
    setIsLoadingKol(true);
    setIsLoadingKeyword(true);
    setIsLoadingContext(true);
    setIsLoadingMentions(true);

    // Initiate all data fetching operations. They will run in parallel.
    getTopicsToWatchData();
    getKolToWatchData();
    getKeywordTrendsData();
    getContextOfDiscussion(); // Will use activeTabContext by default for general refresh
    getMentionsData();

    // The global `isLoading` state will be set to `false` by the `useEffect`
    // that monitors `isLoadingDone()`, once all individual fetches complete.
  };

  // Initial data load
  useEffect(() => {
    // This effect runs once on component mount.
    fetchAllData();
    initialLoadRef.current = true; // Mark that initial load has completed.
  }, []);

  // Handle filter changes
  useDidUpdateEffect(() => {
    // This effect runs when keyword, dataAdvanceFilter, or dataDateFilter changes,
    // but not on the initial component mount.
    const debounceTimer = setTimeout(() => {
      fetchAllData();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [keyword, dataAdvanceFilter, dataDateFilter]);

  // Handle mentions pagination and tab changes
  useDidUpdateEffect(() => {
    // This effect runs when activeTabMentions or mentionPage.page changes,
    // but not on the initial component mount.
    const debounceTimer = setTimeout(() => {
      getMentionsData();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [activeTabMentions, mentionPage.page]);

  useEffect(() => {
    if (isLoadingDone()) {
      setIsLoading(false);
    }
  }, [isLoadingTopic, isLoadingKol, isLoadingKeyword, isLoadingContext, isLoadingMentions]);

  const isLoadingDone = () => {
    return (
      !isLoadingTopic &&
      !isLoadingKol &&
      !isLoadingKeyword &&
      !isLoadingContext &&
      !isLoadingMentions
    );
  };

  const handleChangeFilterFilter = (reqBody) => {
    setDataReqBody({
      ...dataReqBody,
      ...reqBody,
    });
  };

  const handleChangeAdvanceFilter = (reqBody) => {
    setDataAdvanceFilter(reqBody);
  };

  const handleChangeDateFilter = (reqBody) => {
    setDataDateFilter(reqBody);
  };

  const generateReqBody = () => {
    const data = {
      // Keep existing keywords from activeKeywords
      keywords: activeKeywords.keywords, 
      // Add search_keyword from the search bar input
      search_keyword: 
        dataAdvanceFilter.keywords !== undefined && dataAdvanceFilter.keywords.length > 0
          ? dataAdvanceFilter.keywords
          : [], // Default to empty array if no search input
      search_exact_phrases: dataAdvanceFilter?.search_exact_phrases
        ? dataAdvanceFilter?.search_exact_phrases
        : false,
      case_sensitive: false,
      sentiment:
        dataAdvanceFilter?.sentiment?.length > 0
          ? dataAdvanceFilter?.sentiment
          : ["positive", "negative", "neutral"],
      ...(dataDateFilter?.date_filter && {
        date_filter: dataDateFilter?.date_filter,
      }),
      ...(dataDateFilter?.custom_start_date && {
        custom_start_date: dataDateFilter?.custom_start_date,
      }),
      ...(dataDateFilter?.custom_end_date && {
        custom_end_date: dataDateFilter?.custom_end_date,
      }),
      channels:
        dataAdvanceFilter?.channels?.length > 0
          ? dataAdvanceFilter?.channels
          : [],
      importance: dataAdvanceFilter?.importance
        ? dataAdvanceFilter?.importance
        : "all mentions",
      influence_score_min: dataAdvanceFilter?.influence_score_min
        ? dataAdvanceFilter?.influence_score_min
        : 0,
      influence_score_max: dataAdvanceFilter?.influence_score_max
        ? dataAdvanceFilter?.influence_score_max
        : 1000,
      ...(dataAdvanceFilter?.region?.length > 0 && {
        region: dataAdvanceFilter?.region,
      }),
      ...(dataAdvanceFilter?.language?.length > 0 && {
        language: dataAdvanceFilter?.language,
      }),
      ...(dataAdvanceFilter?.domain?.length > 0 && {
        domain: dataAdvanceFilter?.domain,
      }),
      owner_id: `${activeKeywords.owner_id}`,
      project_name: activeKeywords.name,
    };
    return data;
  };

  const getTopicsToWatchData = async () => {
    setIsLoadingTopic(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getTopicsToWatchData. Skipping API call.");
        // setTopicsData([]); // Optionally clear data or leave as is
        // setFilterTopicsData([]);
        setIsLoadingTopic(false);
        return;
      }
      const resp = await getTopicToWatch(reqBody);
      if (resp) {
        setTopicsData(resp);
        // Apply initial sort/filter based on activeListTopic
        if (activeListTopic === "Most Viral") {
          const newArray = sortByField([...resp], "share_of_voice", "desc");
          setFilterTopicsData(getLimitArray(newArray));
        } else { // "Issues"
          const newArray = sortByField([...resp], "viral_score", "desc");
          setFilterTopicsData(getLimitArray(newArray));
        }
      } else {
        setTopicsData([]);
        setFilterTopicsData([]);
      }
    } catch (error) {
      enqueueSnackbar("Network Error fetching topics", { variant: "error" });
      console.log("Error in getTopicsToWatchData:", error);
      setTopicsData([]); // Clear data on error
      setFilterTopicsData([]);
    } finally {
      setIsLoadingTopic(false);
    }
  };

  const getKolToWatchData = async () => {
    setIsLoadingKol(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getKolToWatchData. Skipping API call.");
        // setKolData([]);
        // setFilterKolData([]);
        setIsLoadingKol(false);
        return;
      }
      const resp = await getKolToWatch(reqBody);
      if (resp) {
        setKolData(resp);
        // Apply initial sort/filter based on activeTabListKol
        if (activeTabListKol === "Most viral") {
          const sortedViral = [...resp].sort((a, b) => {
            const scoreA = parseFloat(a.user_influence_score);
            const scoreB = parseFloat(b.user_influence_score);
            if (isNaN(scoreA) && isNaN(scoreB)) return 0;
            if (isNaN(scoreA)) return 1; // Put NaNs at the end
            if (isNaN(scoreB)) return -1; // Put NaNs at the end
            return scoreB - scoreA; // Descending
          });
          setFilterKolData(getLimitArray(sortedViral));
        } else { // "Most negative"
          const newArray = getLimitArray(filterKOLMostNegative(resp));
          setFilterKolData(newArray); // Already limited by filterKOLMostNegative if needed, or apply getLimitArray here
        }
      } else {
        setKolData([]);
        setFilterKolData([]);
      }
    } catch (error) {
      enqueueSnackbar("Network Error fetching KOLs", { variant: "error" });
      console.log("Error in getKolToWatchData:", error);
      setKolData([]);
      setFilterKolData([]);
    } finally {
      setIsLoadingKol(false);
    }
  };

  const getKeywordTrendsData = async () => {
    setIsLoadingKeyword(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getKeywordTrendsData. Skipping API call.");
        // setKeywordData([]);
        setIsLoadingKeyword(false);
        return;
      }
      const resp = await getKeywordTrends(reqBody);
      setKeywordData(resp || []); // Ensure keywordData is an array even if resp is null/undefined
    } catch (error) {
      enqueueSnackbar("Network Error fetching keyword trends", { variant: "error" });
      console.log("Error in getKeywordTrendsData:", error);
      setKeywordData([]);
    } finally {
      setIsLoadingKeyword(false);
    }
  };

  const getContextOfDiscussion = async (currentTab) => {
    setIsLoadingContext(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) {
        console.warn("generateReqBody returned null in getContextOfDiscussion. Skipping API call.");
        // setContextData([]);
        setIsLoadingContext(false);
        return;
      }
      let sentimentForContext;
      const tabToProcess = currentTab || activeTabContext;

      if (tabToProcess === "Positive") {
        sentimentForContext = ["positive"];
      } else if (tabToProcess === "Negative") {
        sentimentForContext = ["negative"];
      } else {
        sentimentForContext = baseReqBody.sentiment; 
      }

      const reqBodyForContext = { ...baseReqBody, sentiment: sentimentForContext };
      const resp = await getContext(reqBodyForContext);
      setContextData(resp.data || []); // Ensure contextData is an array
    } catch (error) {
      enqueueSnackbar("Network Error fetching context", { variant: "error" });
      console.log("Error in getContextOfDiscussion:", error);
      setContextData([]);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const getMentionsData = async () => {
    setIsLoadingMentions(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getMentionsData. Skipping API call.");
        // setMentionData([]);
        setIsLoadingMentions(false);
        return;
      }
      const mentionReq = {
        ...reqBody,
        sort_type: activeTabMentions === "Popular first" ? "popular" : "recent",
        page: mentionPage.page,
        page_size: 10,
      };
      const resp = await getMentions(mentionReq);
      if (resp && resp.data) {
        setMentionData(resp.data);
        if (resp.pagination) {
          setMentionPage(prevState => ({
            ...prevState,
            total_pages: resp.pagination.total_pages,
            total_posts: resp.pagination.total_posts
          }));
        }
      } else {
        setMentionData([]);
         // Reset pagination if no data or error
        setMentionPage(prevState => ({ ...prevState, total_pages: 0, total_posts: 0, page: 1 }));
      }
    } catch (error) {
      enqueueSnackbar("Network Error fetching mentions", { variant: "error" });
      console.log("Error in getMentionsData:", error);
      setMentionData([]);
      setMentionPage(prevState => ({ ...prevState, total_pages: 0, total_posts: 0, page: 1 }));
    } finally {
      setIsLoadingMentions(false);
    }
  };

  const handleChangeKeywords = (event, newValue) => {
    setActiveKeyword(newValue);
  };

  const handleChangeTopics = (event, newValue) => {
    setActiveListTopic(newValue);
    if (newValue === "Most Viral") {
      const newArray = sortByField([...topicsData], "share_of_voice", "desc");
      setFilterTopicsData(getLimitArray(newArray));
    } else {
      const newArray = sortByField([...topicsData], "viral_score", "desc");
      setFilterTopicsData(getLimitArray(newArray));
    }
  };

  const handleKOLChange = (event, newValue) => {
    setActiveTabListKol(newValue);
    if (newValue === "Most viral") {
      const sortedViral = [...kolData].sort((a, b) => {
        const scoreA = parseFloat(a.user_influence_score);
        const scoreB = parseFloat(b.user_influence_score);
        if (isNaN(scoreA) && isNaN(scoreB)) return 0;
        if (isNaN(scoreA)) return 1; // Put NaNs at the end
        if (isNaN(scoreB)) return -1; // Put NaNs at the end
        return scoreB - scoreA; // Descending
      });
      setFilterKolData(getLimitArray(sortedViral));
    } else { // "Most negative"
      const newArray = filterKOLMostNegative(kolData);
      setFilterKolData(getLimitArray(newArray));
    }
  };

  const filterKOLMostNegative = (array) => {
    const isNegativeArray = array.filter((value) => value.is_negative_driver === true);
    // Custom sort for influence_score numerically in descending order
    const sortedKOL = [...isNegativeArray].sort((a, b) => {
      const scoreA = parseFloat(a.user_influence_score);
      const scoreB = parseFloat(b.user_influence_score);
      // Handle cases where parsing might result in NaN, though ideally data is clean
      if (isNaN(scoreA) && isNaN(scoreB)) return 0;
      if (isNaN(scoreA)) return 1; // Put NaNs at the end for descending
      if (isNaN(scoreB)) return -1; // Put NaNs at the end for descending
      return scoreB - scoreA; // For descending order
    });
    return sortedKOL;
  };

  const handleChangeMentionPage = (event, value) => {
    setMentionPage({
      ...mentionPage,
      page: value,
    });
  };

  const handleFilterTabChange = (event, newValue) => {
    setActiveFilterTab(newValue);
    // Debounce the filter update
    setTimeout(() => {
      setDataAdvanceFilter(prev => ({
        ...prev,
        channels: newValue === "all platform" ? [] : [newValue],
      }));
    }, 300);
  };

  const handleMentionChange = (event, newValue) => {
    setActiveTabMentions(newValue);
    setMentionPage({
      ...mentionPage,
      page: 1,
    });
  };

  const handleRedirectTopics = () => {
    navigate(`/${keyword}/topics`, { replace: true });
  };

  const handleRedirectKOL = () => {
    navigate(`/${keyword}/kol`, { replace: true });
  };

  const handleChangeContext = (event, newValue) => {
    setActiveTabContext(newValue);
    // Fetch context data with the new sentiment filter
    getContextOfDiscussion(newValue);
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

  const isNoDataUIShow = () => {
    if (!isLoading) {
      return (
        topicsData.length === 0 &&
        kolData.length === 0 &&
        keywordData.length === 0 &&
        contextData.length === 0 &&
        mentionData.length === 0
      );
    } else {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedKeywords = (searchBoxValue || "") // Ensure searchBoxValue is not null/undefined
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k); // Filter out empty strings after trimming
    setDataAdvanceFilter({
      ...dataAdvanceFilter,
      keywords: processedKeywords, // This now correctly stores the search bar input
      search_exact_phrases: isSearchExactPhraseChecked,
    });
  };

  return (
    <>
      <>
        <div className="dashboard-container">
          <div>
            <CustomText color="brand" bold="semibold" size="mds">
              #{keyword}
            </CustomText>
              <div className="dashboard-search-container">
                <Paper
                  component="form"
                  sx={{
                    p: "2px 4px",
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                  }}
                  onSubmit={handleSubmit}
                >
                  <IconButton sx={{ p: "10px" }} aria-label="menu">
                    <SearchIcon />
                  </IconButton>
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search for keywords.. use commas (,) for multiple keywords"
                    inputProps={{
                      "aria-label":
                        "Search for keywords.. use commas (,) for multiple keywords",
                    }}
                    value={searchBoxValue}
                    onChange={(e) => setSearchBoxValue(e.target.value)}
                  />
                  <IconButton sx={{ p: "10px" }} aria-label="menu">
                  <Tooltip title="Tooltip" placement="top">
                    <HelpOutline
                      sx={{ color: "#A4A7AE", width: "15px" }}
                    ></HelpOutline>
                  </Tooltip>
                  </IconButton>
                </Paper>
                <CustomButton
                  variant="outlined"
                  endDecorator={<CalendarTodayIcon />}
                  onClick={handleOpenDayDialog}
                >
                  Date Filter
                </CustomButton>

                <CustomButton
                  endDecorator={<FilterAltIcon />}
                  onClick={handleOpenFilterDialog}
                >
                  Advance Filter
                </CustomButton>
              </div>
              <div className="dashboard-checkbox-container">
                <Checkbox
                  checked={isSearchExactPhraseChecked}
                  onChange={(e) =>
                    setIsSearchExactPhraseChecked(e.target.checked)
                  }
                />
                <CustomText>Search exact phrase</CustomText>
              </div>
            </div>
            <div>
              <Tabs
                aria-label="tabs"
                defaultValue={0}
                sx={{ bgcolor: "transparent", margin: "15px 0px" }}
                value={activeFilterTab}
                onChange={handleFilterTabChange}
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
                  <Tab
                    disableIndicator
                    sx={{ width: "16.5%", height: "44px" }}
                    value="all platform"
                  >
                    <CustomText>All Platform</CustomText>
                  </Tab>
                  <Tab
                    disableIndicator
                    sx={{ width: "16.5%", height: "44px" }}
                    value="tiktok"
                  >
                    <CustomText>Tiktok</CustomText>
                  </Tab>
                  <Tab
                    disableIndicator
                    sx={{ width: "16.5%", height: "44px" }}
                    value="twitter"
                  >
                    <CustomText>X/Twitter</CustomText>
                  </Tab>
                  <Tab
                    disableIndicator
                    sx={{ width: "16.5%", height: "44px" }}
                    value="instagram"
                  >
                    <CustomText>Instagram</CustomText>
                  </Tab>

                  <Tab
                    disableIndicator
                    sx={{ width: "16.5%", height: "44px" }}
                    value="media"
                  >
                    <CustomText>Media</CustomText>
                  </Tab>
                </TabList>
              </Tabs>
            </div>
            {/* Main data container */}
            <>
              {isNoDataUIShow() && !isLoading ? ( // Show global NoDataUI only if all individual fetches are done and all data is empty
                <NoDataUI />
              ) : (
                <div className="dashboard-data-container">
                  <div className="dashboard-content-flex-two">
                    <CustomContentBox
                      title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Topics to watch 🔥</span>}
                        seeAll="See all Topics"
                        handleSeeAll={handleRedirectTopics}
                        tabList={tabListTopic}
                        handleChange={handleChangeTopics}
                        activeTab={activeListTopic}
                        tooltip="Explore trending topics and sentiment shifts over time. Use the date filter to adjust he analysis range and uncover insights into public conversations."
                      >
                        {isLoadingTopic ? (
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                            <img src="/loading.svg" alt="Loading topics" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                            <CustomText>Analysis Topics data...</CustomText>
                          </div>
                        ) : filterTopicsData?.length > 0 ? (
                          filterTopicsData.map((value, index) => (
                            <TopicsComponent
                              key={`topics-${index}`}
                              data={value}
                              borderBottom={index + 1 !== filterTopicsData.length}
                            />
                          ))
                        ) : (
                          <div style={{ padding: '20px', textAlign: 'center' }}>
                            <CustomText>No topic data available.</CustomText>
                          </div>
                        )}
                      </CustomContentBox>
                      <CustomContentBox
                        title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>KOL to Watch</span>}
                        seeAll="See all KOL"
                        handleSeeAll={handleRedirectKOL}
                        tabList={tabListKol}
                        handleChange={handleKOLChange}
                        activeTab={activeTabListKol}
                        tooltip="Track key opinion leaders (KOLs) driving online conversations. See who's shaping narratives, their influence level, and the topics they're actively discussing."
                      >
                        {isLoadingKol ? (
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                            <img src="/loading.svg" alt="Loading KOLs" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                            <CustomText>Analysis KOL ...</CustomText>
                          </div>
                        ) : filterKolData?.length > 0 ? (
                          filterKolData.map((value, index) => (
                            <KolComponent
                              key={`kol-${index}`}
                              data={value}
                              borderBottom={index + 1 !== filterKolData.length}
                            />
                          ))
                        ) : (
                          <div style={{ padding: '20px', textAlign: 'center' }}>
                            <CustomText>No KOL data available.</CustomText>
                          </div>
                        )}
                      </CustomContentBox>
                    </div>
                    <div className="dashboard-content-flex-two">
                      <CustomContentBox
                        title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Keywords Trends</span>}
                        tabList={tabListKeyword}
                        handleChange={handleChangeKeywords}
                        activeTab={activeTabKeyword}
                        tooltip="Analyze keyword trends over time. Track mentions and reach to understand how topics are gaining traction and influencing online conversations."
                      >
                        {isLoadingKeyword ? (
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <img src="/loading.svg" alt="Loading keyword trends" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                            <CustomText>Loading keyword trends...</CustomText>
                          </div>
                        ) : keywordData && (Array.isArray(keywordData) ? keywordData.length > 0 : Object.keys(keywordData).length > 0) ? (
                          <KeywordComponent
                            type={activeTabKeyword}
                            data={keywordData}
                          />
                        ) : (
                          <div style={{ padding: '20px', textAlign: 'center', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CustomText>No keyword trend data available.</CustomText>
                          </div>
                        )}
                      </CustomContentBox>
                      <CustomContentBox
                        title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Context of discussion</span>}
                        tabList={tabListContext}
                        activeTab={activeTabContext}
                        handleChange={handleChangeContext}
                        tooltip="Explore the context of discussions with a word cloud. See the most mentioned keywords, their frequency, and the sentiment behind each term to understand public narratives."
                      >
                        {/* ContextComponent handles its own isLoading and no data internally via its `isLoading` prop */}
                        <ContextComponent
                          type={activeTabContext.toLowerCase()}
                          data={contextData}
                          isLoading={isLoadingContext} 
                        />
                      </CustomContentBox>
                    </div>
                    <CustomContentBox
                      title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Mentions</span>}
                      seeAll // Assuming this is a boolean prop, if it's meant to show "See all" text, it should be a string
                      tabList={tabListMentions}
                      activeTab={activeTabMentions}
                      handleChange={handleMentionChange}
                      tooltip="Monitor mentions across platforms to see how your topic is being discussed. Sort by popularity or recency, and track sentiment to capture the public's perception."
                    >
                      {isLoadingMentions ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                          <img src="/loading.svg" alt="Loading mentions" style={{ width: '50px', height: '50px', marginBottom: '8px' }} />
                          <CustomText>Loading mentions data...</CustomText>
                        </div>
                      ) : mentionData?.length > 0 ? (
                        <>
                          {mentionData.map((value, index) => (
                            <MentionComponent
                              key={`mention-${index}`}
                              data={value}
                              borderBottom
                              isShowAction
                            />
                          ))}
                          <div className="dashboard-pagination">
                            <Pagination
                              count={mentionPage.total_pages}
                              page={mentionPage.page}
                              onChange={handleChangeMentionPage}
                              renderItem={(item) => (
                                <PaginationItem
                                  components={{
                                    previous: () => (
                                      <img src="/chevron-left.svg" alt="Previous" className="pagination-arrow" />
                                    ),
                                    next: () => (
                                      <img src="/chevron-right.svg" alt="Next" className="pagination-arrow" />
                                    ),
                                  }}
                                  {...item}
                                />
                              )}
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           <CustomText>No mentions data available.</CustomText>
                        </div>
                      )}
                    </CustomContentBox>
                  </div>
                )}
            </>
          </div>
        </>
      <DialogDateFilter
        open={isDialogDayOpen}
        onClose={handleCloseDayDialog}
        handleChangeFilter={handleChangeDateFilter}
      />

      <DialogFilter
        open={isDialogFilterOpen}
        onClose={handleCloseFilterDialog}
        handleChangeFilter={handleChangeAdvanceFilter}
      />
    </>
  );
};

export default Dashboard;
