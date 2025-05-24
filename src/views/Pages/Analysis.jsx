import Paper from "@mui/material/Paper";
import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import CustomText from "../../components/CustomText";
import CustomButton from "../../components/CustomButton";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Checkbox from "@mui/joy/Checkbox";
import CustomContentBox from "../../components/CustomContentBox";
import MentionComponent from "./components/MentionComponent";
import Pagination from "@mui/material/Pagination";
import "./styles/Analysis.css";
import OverviewComponent from "./components/OverviewComponent";
import KeywordComponent from "./components/KeywordComponent";
import ContextComponent from "./components/ContextComponent";
import MentionsByCategoryComponent from "./components/MentionsByCategoryComponent";
import SentimentByCategory from "./components/SentimentByCategoryComponent";
import PopularEmojis from "./components/PopularEmojis";
import MostShareOfVoiceComponent from "./components/MostShareOfVoiceComponent";
import MostFollowersComponent from "./components/MostFollowersComponent";
import TrendingHashtagComponent from "./components/TrendingHashtagComponent";
import TrendingLinkComponent from "./components/TrendingLinkComponent";
import SentimentBreakdownComponent from "./components/SentimentBreakdownComponent";
import PresenceScoreComponent from "./components/PresenceScoreComponent";
import DialogDateFilter from "./components/DialogDateFilter";
import DialogFilter from "./components/DialogFilter";
import { HelpOutline } from "@mui/icons-material";
import {
  getAnalysisOverview,
  getMentionSentimentBreakdown,
  getMostFollowers,
  getMostShareVoice,
  getPopularEmojis,
  getPresenceScore,
  getTrendingHashtag,
  getTrendingLink,
} from "../../services/analysisService";
import {
  getContext,
  getKeywordTrends,
  getMentions,
} from "../../services/topicService";
import { useSelector } from "react-redux";
import LoadingUI from "./components/LoadingUI";
import NoDataUI from "./components/NoDataUI";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";
import { useDidUpdateEffect } from "../../helpers/loadState";

const Analysis = () => {
  const navigate = useNavigate();
  const { keyword } = useParams();

  const [searchBoxValue, setSearchBoxValue] = useState("");
  const [isSearchExactPhraseChecked, setIsSearchExactPhraseChecked] =
    useState(false);

  const tabListMention = ["Most Popular", "From top public profiles"];
  const [activeTabMention, setActiveTabMention] = useState("Most Popular");

  const [mentionData, setMentionData] = useState([]);
  const [overviewData, setOverviewData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [mentionByCategoryData, setMentionByCategoryData] = useState([]);
  const [sentimentByCategoryData, setSentimentByCategoryData] = useState([]);
  const [mostShareVoiceData, setMostShareVoiceData] = useState([]);
  const [mostFollowersData, setMostFollowersData] = useState([]);
  const [presenceScoreData, setPresenceScoreData] = useState({});
  const [sentimentBreakdownData, setSentimentBreakdownData] = useState({});
  const [hashTagData, setHashTagData] = useState([]);
  const [linkData, setLinkData] = useState([]);
  const [contextOfDiscussionData, setContextOfDiscussionData] = useState([]);
  const [mostPopularEmojisData, setMostPopularEmojisData] = useState([]);

  const [isFirstLoading, setIsFirstLoading] = useState(true); // This can remain for the header/search bar section
  const [isLoading, setIsLoading] = useState(true); // True if any batch of fetches is in progress

  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isMentionLoading, setIsMentionLoading] = useState(true);
  const [isKeywordLoading, setIsKeywordLoading] = useState(true);
  const [isMostShareVoiceLoading, setIsMostShareVoiceLoading] = useState(true);
  const [isMostFollowersLoading, setIsMostFollowersLoading] = useState(true);
  const [isTrendingHashtagLoading, setIsTrendingHashtagLoading] =
    useState(true);
  const [isTrendingLinkLoading, setIsTrendingLinkLoading] = useState(true);
  const [
    isMentionSentimentBreakdownLoading,
    setIsMentionSentimentBreakdownLoading,
  ] = useState(true);
  const [isMostPopularEmojisLoading, setIsMostPopularEmojisLoading] =
    useState(true);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [isPresenceScoreLoading, setIsPresenceScoreLoading] = useState(true);

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);

  const [dataReqBody, setDataReqBody] = useState({
    keywords: activeKeywords.keywords,
    owner_id: `${activeKeywords.owner_id}`,
    project_name: activeKeywords.name,
    channels: [],
  });
  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});
  const [dataDateFilter, setDataDateFilter] = useState({});

  const [mentionPage, setMentionPage] = useState({
    page: 1,
    page_size: 5,
    total_pages: 1000,
    total_posts: 10000,
  });

  const [voicePage, setVoicePage] = useState({
    page: 1,
    page_size: 5,
    total_pages: 1000,
    total_posts: 10000,
  });

  const [followerPage, setFollowerPage] = useState({
    page: 1,
    page_size: 5,
    total_pages: 1000,
    total_posts: 10000,
  });

  const [hashtagPage, setHashtagPage] = useState({
    page: 1,
    page_size: 5,
    total_pages: 1000,
    total_posts: 10000,
  });

  const [linkPage, setLinkPage] = useState({
    page: 1,
    page_size: 5,
    total_pages: 1000,
    total_posts: 10000,
  });

  const [currentMentionPage, setCurrentMentionPage] = useState(1);
  const [currentVoicePage, setCurrentVoicePage] = useState(1);
  const [currentFollowerPage, setCurrentFollowerPage] = useState(1);
  const [currentHashtagPage, setCurrentHashtagPage] = useState(1);
  const [currentLinkPage, setCurrentLinkPage] = useState(1);

  // Function to fetch all data concurrently
  const fetchAllAnalysisData = () => {
    // Individual get*Data functions set their own loading states (e.g., setIsOverviewLoading(true))
    // Calling them without await allows them to run in parallel.
    getOverviewData();
    getMentionData(); // This will fetch based on currentMentionPage and activeTabMention
    getKeywordData();
    getMostShareVoiceData(); // Based on currentVoicePage
    getMostFollowersData(); // Based on currentFollowerPage
    getTrendingHashTagData(); // Based on currentHashtagPage
    getTrendingLinkData(); // Based on currentLinkPage
    getMentionSentimentBreakdownData();
    getMostPopularEmojisData();
    getContextData();
    getPresenceScoreData();
  };
  
  useEffect(() => {
    // Handles initial setup of dataReqBody based on activeKeywords from Redux.
    // This ensures dataReqBody has the correct project context.
    // This effect runs on mount and when activeKeywords changes.
    if (activeKeywords && activeKeywords.name && activeKeywords.owner_id !== undefined && Array.isArray(activeKeywords.keywords)) {
      const newReqBody = {
        keywords: activeKeywords.keywords,
        owner_id: String(activeKeywords.owner_id),
        project_name: activeKeywords.name,
        // channels are typically part of dataAdvanceFilter or default in generateReqBody
      };
      setDataReqBody(newReqBody); // Update dataReqBody state
    } else {
      // Optionally handle cases where activeKeywords might not be fully populated.
      // For instance, set dataReqBody to null or a default state if necessary.
      // setDataReqBody(null); // Example: Reset if activeKeywords is not ready
    }
  }, [activeKeywords]); // Removed 'keyword' from here if it's mainly for project context from activeKeywords

  // This effect triggers data fetching when dataReqBody is populated or filters/keyword param change.
  useEffect(() => {
    // Ensure dataReqBody is valid and project_name is present before fetching.
    if (dataReqBody && dataReqBody.project_name) {
      setIsLoading(true); // Indicate a batch of fetches is starting.
      setIsFirstLoading(true); // Also set isFirstLoading for header if it should re-skeletonize on deep filter changes
      fetchAllAnalysisData();
    }
    // If dataReqBody becomes null (e.g., activeKeywords becomes invalid),
    // individual loading states should be managed by the get*Data functions.
  }, [dataReqBody, dataDateFilter, dataAdvanceFilter, keyword]); // Added keyword here to refetch if URL param changes


  useDidUpdateEffect(() => {
    getMentionData();
  }, [activeTabMention, currentMentionPage]);

  useDidUpdateEffect(() => {
    getMostShareVoiceData();
  }, [currentVoicePage]);

  useDidUpdateEffect(() => {
    getMostFollowersData();
  }, [currentFollowerPage]);

  useDidUpdateEffect(() => {
    getTrendingHashTagData();
  }, [currentHashtagPage]);

  useDidUpdateEffect(() => {
    getTrendingLinkData();
  }, [currentLinkPage]);

  useDidUpdateEffect(() => {
    if (isLoadingDone()) {
      setIsFirstLoading(false); // Header loading done
      setIsLoading(false); // All individual fetches in the current batch are complete.
    }
  }, [ // Dependencies are the individual loading states
    isOverviewLoading,
    isMentionLoading,
    isKeywordLoading,
    isMostShareVoiceLoading,
    isMostFollowersLoading,
    isTrendingHashtagLoading,
    isTrendingLinkLoading,
    isMentionSentimentBreakdownLoading,
    isMostPopularEmojisLoading,
    isContextLoading,
    isPresenceScoreLoading,
  ]);

  const generateReqBody = () => {
    const data = {
      keywords: activeKeywords.keywords, // Base project keywords from Redux

      // Keywords from Analysis page's search bar or its DialogFilter
      search_keyword:
        dataAdvanceFilter?.keywords?.length > 0
          ? dataAdvanceFilter.keywords
          : [], // Default to empty array if no specific search on Analysis page

      search_exact_phrases: dataAdvanceFilter?.search_exact_phrases
        ? dataAdvanceFilter.search_exact_phrases // From Analysis page's checkbox or its DialogFilter
        : false,
      case_sensitive: false, // Standard default
      sentiment:
        dataAdvanceFilter?.sentiment?.length > 0
          ? dataAdvanceFilter.sentiment
          : ["positive", "negative", "neutral"], // Default sentiments
      ...(dataDateFilter?.date_filter && {
        date_filter: dataDateFilter.date_filter,
      }),
      ...(dataDateFilter?.custom_start_date && {
        custom_start_date: dataDateFilter.custom_start_date,
      }),
      ...(dataDateFilter?.custom_end_date && {
        custom_end_date: dataDateFilter.custom_end_date,
      }),
      channels:
        dataAdvanceFilter?.channels?.length > 0
          ? dataAdvanceFilter.channels
          : [], // Default to all channels if not specified
      importance: dataAdvanceFilter?.importance
        ? dataAdvanceFilter.importance
        : "all mentions", // Default importance
      influence_score_min: dataAdvanceFilter?.influence_score_min
        ? dataAdvanceFilter.influence_score_min
        : 0, // Default min influence score
      influence_score_max: dataAdvanceFilter?.influence_score_max
        ? dataAdvanceFilter.influence_score_max
        : 1000, // Default max influence score
      ...(dataAdvanceFilter?.region?.length > 0 && {
        region: dataAdvanceFilter.region,
      }),
      ...(dataAdvanceFilter?.language?.length > 0 && {
        language: dataAdvanceFilter.language,
      }),
      ...(dataAdvanceFilter?.domain?.length > 0 && {
        domain: dataAdvanceFilter.domain,
      }),
      owner_id: `${activeKeywords.owner_id}`, // Owner ID from Redux
      project_name: activeKeywords.name, // Project name from Redux
    };
    return data;
  };

  const isLoadingDone = () => {
    return (
      !isOverviewLoading &&
      !isMentionLoading &&
      !isKeywordLoading &&
      !isMostShareVoiceLoading &&
      !isMostFollowersLoading &&
      !isTrendingHashtagLoading &&
      !isTrendingLinkLoading &&
      !isMentionSentimentBreakdownLoading &&
      !isMostPopularEmojisLoading &&
      !isContextLoading &&
      !isPresenceScoreLoading
    );
  };

  const getOverviewData = async () => {
    setIsOverviewLoading(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) { console.warn("generateReqBody returned null in getOverviewData. Skipping API call."); setIsOverviewLoading(false); return; }
      const resp = await getAnalysisOverview(reqBody);
      setOverviewData(resp);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  const getMentionData = async () => {
    setIsMentionLoading(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) { console.warn("generateReqBody returned null in getMentionData. Skipping API call."); setIsMentionLoading(false); return; }
      const mentionReq = {
        ...baseReqBody,
        sort_type: activeTabMention === "Most Popular" ? "popular" : "top_profile",
        page: currentMentionPage,
        page_size: 5,
      };
      const resp = await getMentions(mentionReq);
      if (resp.data) {
        setMentionData(resp.data);
        setMentionPage(resp.pagination);
      }
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsMentionLoading(false);
    }
  };

  const getKeywordData = async () => {
    setIsKeywordLoading(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) { console.warn("generateReqBody returned null in getKeywordData. Skipping API call."); setIsKeywordLoading(false); return; }
      const resp = await getKeywordTrends(reqBody);
      setKeywordData(resp);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsKeywordLoading(false);
    }
  };

  const getMostShareVoiceData = async () => {
    setIsMostShareVoiceLoading(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) { console.warn("generateReqBody returned null in getMostShareVoiceData. Skipping API call."); setIsMostShareVoiceLoading(false); return; }
      const voiceReq = {
        ...baseReqBody,
        page: currentVoicePage,
        page_size: 5,
      };
      const resp = await getMostShareVoice(voiceReq);
      setMostShareVoiceData(resp.data);
      setVoicePage(resp.pagination);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsMostShareVoiceLoading(false);
    }
  };

  const getMostFollowersData = async () => {
    setIsMostFollowersLoading(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) { console.warn("generateReqBody returned null in getMostFollowersData. Skipping API call."); setIsMostFollowersLoading(false); return; }
      const followerReq = {
        ...baseReqBody,
        page: currentFollowerPage,
        page_size: 5,
      };
      const resp = await getMostFollowers(followerReq);
      setMostFollowersData(resp.data);
      setFollowerPage(resp.pagination);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsMostFollowersLoading(false);
    }
  };

  const getTrendingHashTagData = async () => {
    setIsTrendingHashtagLoading(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) { console.warn("generateReqBody returned null in getTrendingHashTagData. Skipping API call."); setIsTrendingHashtagLoading(false); return; }
      const hashtagReq = {
        ...baseReqBody,
        page: currentHashtagPage,
        page_size: 5,
      };
      const resp = await getTrendingHashtag(hashtagReq);
      setHashTagData(resp.data);
      setHashtagPage(resp.pagination);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsTrendingHashtagLoading(false);
    }
  };

  const getTrendingLinkData = async () => {
    setIsTrendingLinkLoading(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) { console.warn("generateReqBody returned null in getTrendingLinkData. Skipping API call."); setIsTrendingLinkLoading(false); return; }
      const linkReq = {
        ...baseReqBody,
        page: currentLinkPage,
        page_size: 5,
      };
      const resp = await getTrendingLink(linkReq);
      setLinkData(resp.data);
      setLinkPage(resp.pagination);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsTrendingLinkLoading(false);
    }
  };

  const getMentionSentimentBreakdownData = async () => {
    setIsMentionSentimentBreakdownLoading(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) { console.warn("generateReqBody returned null in getMentionSentimentBreakdownData. Skipping API call."); setIsMentionSentimentBreakdownLoading(false); return; }
      const resp = await getMentionSentimentBreakdown(reqBody);
      setMentionByCategoryData(resp.mentions_by_category?.categories);
      setSentimentBreakdownData(resp.sentiment_breakdown);
      setSentimentByCategoryData(resp.sentiment_by_category?.categories);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsMentionSentimentBreakdownLoading(false);
    }
  };

  const getMostPopularEmojisData = async () => {
    setIsMostPopularEmojisLoading(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) { console.warn("generateReqBody returned null in getMostPopularEmojisData. Skipping API call."); setIsMostPopularEmojisLoading(false); return; }
      const resp = await getPopularEmojis(reqBody);
      setMostPopularEmojisData(resp.data);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsMostPopularEmojisLoading(false);
    }
  };

  const getContextData = async () => {
    setIsContextLoading(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) { console.warn("generateReqBody returned null in getContextData. Skipping API call."); setIsContextLoading(false); return; }
      const resp = await getContext(reqBody);
      setContextOfDiscussionData(resp.data);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsContextLoading(false);
    }
  };

  const getPresenceScoreData = async () => {
    setIsPresenceScoreLoading(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) { console.warn("generateReqBody returned null in getPresenceScoreData. Skipping API call."); setIsPresenceScoreLoading(false); return; }
      const resp = await getPresenceScore(reqBody);
      setPresenceScoreData(resp);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsPresenceScoreLoading(false);
    }
  };

  const isNoDataUIShow = () => {
    // This check is done when !isLoading (overall loading is false, meaning all fetches attempted)
    return (
      (!mentionData || mentionData.length === 0) &&
      (!overviewData || overviewData.length === 0) && // Assuming overviewData is an array; if object, check Object.keys(overviewData).length === 0
      (!keywordData || (Array.isArray(keywordData) ? keywordData.length === 0 : Object.keys(keywordData).length === 0)) &&
      (!mentionByCategoryData || mentionByCategoryData.length === 0) &&
      (!sentimentByCategoryData || sentimentByCategoryData.length === 0) &&
      (!mostShareVoiceData || mostShareVoiceData.length === 0) &&
      (!mostFollowersData || mostFollowersData.length === 0) &&
      (!presenceScoreData || Object.keys(presenceScoreData).length === 0) && // Assuming presenceScoreData is an object
      (!sentimentBreakdownData || Object.keys(sentimentBreakdownData).length === 0) &&
      (!hashTagData || hashTagData.length === 0) &&
      (!linkData || linkData.length === 0) &&
      (!contextOfDiscussionData || contextOfDiscussionData.length === 0) &&
      (!mostPopularEmojisData || mostPopularEmojisData.length === 0)
    );
  };

  const handleMentionChange = (event, newValue) => {
    setActiveTabMention(newValue);
    setMentionPage({
      ...mentionPage,
      page: 1,
    });
    setCurrentMentionPage(1);
  };

  const handleChangeMentionPage = (event, value) => {
    setMentionPage({
      ...mentionPage,
      page: value,
    });
    setCurrentMentionPage(value);
  };

  const handleChangeFollowerPage = (event, value) => {
    setFollowerPage({
      ...followerPage,
      page: value,
    });
    setCurrentFollowerPage(value);
  };

  const handleChangeVoicePage = (event, value) => {
    setVoicePage({
      ...voicePage,
      page: value,
    });
    setCurrentVoicePage(value);
  };

  const handleChangeHashtagPage = (event, value) => {
    setHashtagPage({
      ...hashtagPage,
      page: value,
    });
    setCurrentHashtagPage(value);
  };

  const handleChangeLinkPage = (event, value) => {
    setLinkPage({
      ...linkPage,
      page: value,
    });
    setCurrentLinkPage(value);
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

  const handleChangeAdvanceFilter = (reqBody) => {
    setDataAdvanceFilter(reqBody);
  };

  const handleChangeDateFilter = (reqBody) => {
    setDataDateFilter(reqBody);
  };

  const handleRedirectCompare = () => {
    navigate(`/${keyword}/comparison`, { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDataAdvanceFilter({
      ...dataAdvanceFilter,
      keywords: searchBoxValue.split(",").map(k => k.trim()).filter(k => k), // Ensure keywords are trimmed and filtered
      search_exact_phrases: isSearchExactPhraseChecked,
    });
  };

  const redirectToMentions = () => {
    const basePayload = generateReqBody();
    // Determine sort_type for Mentions page based on Analysis page's active tab
    // 'top_profile' from Analysis might map to 'popular' or 'recent' in Mentions.
    // Let's map 'top_profile' to 'popular' for now, as it implies high engagement/visibility.
    const sortTypeForMentionsPage = activeTabMention === "Most Popular" 
      ? "popular" 
      : (activeTabMention === "From top public profiles" ? "popular" : "recent"); // Default to recent if tab is unexpected

    const navigationPayload = {
      ...basePayload,
      sort_type: sortTypeForMentionsPage,
    };

    navigate(`/${keyword}/mentions`, {
      state: {
        filters: navigationPayload,
        fromAnalysis: true, // Flag to indicate navigation from Analysis
      },
    });
  };

  return (
    <>
      <div className="analysis-header-container">
        {isFirstLoading ? (
          <>
            <div className="analysis-top-loader skeleton-loader"></div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
      <div className="analysis-content-container">
        {/* Header's isFirstLoading is handled above for the search bar and filters */}
        {/* Content Area: Renders components as their data arrives */}
        {/* Show NoDataUI only if all fetches are complete AND all sections are empty */}
        {(isLoadingDone() && isNoDataUIShow()) ? (
            <NoDataUI />
          ) : (
            <>
              {/* Overview */}
              <CustomContentBox
                title="Overview"
                seeAll="See detail comparison"
                handleSeeAll={handleRedirectCompare}
              >
                {isOverviewLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                    <img src="/loading.svg" alt="Loading overview" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                    <CustomText>Loading overview data...</CustomText>
                  </div>
                ) : overviewData && (Array.isArray(overviewData) ? overviewData.length > 0 : Object.keys(overviewData).length > 0) ? (
                  <OverviewComponent data={overviewData} />
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No overview data available.</CustomText></div>
                )}
              </CustomContentBox>

              {/* Mentions */}
              <CustomContentBox
                title="Mentions"
                seeAll="See all mentions"
                handleSeeAll={redirectToMentions}
                tabList={tabListMention}
                activeTab={activeTabMention}
                handleChange={handleMentionChange}
                tooltip="Monitor mentions across platforms to see how your topic is being discussed. Sort by popularity or recency, and track sentiment to capture the public's perception."
              >
                {isMentionLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <img src="/loading.svg" alt="Loading mentions..." style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                    <CustomText>Loading mentions data...</CustomText>
                  </div>
                ) : mentionData && mentionData.length > 0 ? (
                  <>
                    {mentionData.map((value, index) => (
                      <MentionComponent
                        key={`mention-${index}`}
                        data={value}
                        borderBottom
                        isShowAction
                      />
                    ))}
                    {mentionPage && mentionPage.total_pages > 0 && (
                      <div className="dashboard-pagination">
                        <Pagination
                          count={mentionPage.total_pages}
                          page={currentMentionPage}
                          onChange={handleChangeMentionPage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No mentions data available.</CustomText></div>
                )}
              </CustomContentBox>

              {/* Keyword Trends & Mentions by Categories (Split) */}
              <div className="analysis-content-split">
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Keyword Trends</span>}
                  tooltip="Analyze keyword trends over time. Track mentions and reach to understand how topics are gaining traction and influencing online conversations."
                >
                  {isKeywordLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading keyword trends" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading keyword data...</CustomText>
                    </div>
                  ) : keywordData && (Array.isArray(keywordData) ? keywordData.length > 0 : Object.keys(keywordData).length > 0) ? (
                    <KeywordComponent data={keywordData} type="Mentions & Reach" />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No keyword trends data available.</CustomText></div>
                  )}
                </CustomContentBox>
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Mentions by categories</span>}
                  tooltip="See where conversations happen. Understand which platforms drive the most discussions and focus efforts where they matter most."
                >
                  {isMentionSentimentBreakdownLoading ? ( // This data comes from getMentionSentimentBreakdownData
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading mentions by categories" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading mentions by categories...</CustomText>
                    </div>
                  ) : mentionByCategoryData && mentionByCategoryData.length > 0 ? (
                    <MentionsByCategoryComponent data={mentionByCategoryData} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No mentions by categories data available.</CustomText></div>
                  )}
                </CustomContentBox>
              </div>

              {/* Sentiment & Sentiment by Categories (Split) */}
              <div className="analysis-content-split">
                <CustomContentBox
                  title="Sentiment"
                  tooltip="Visualize sentiment shifts over time. Track the volume of positive and negative mentions to gauge public perception and respond strategically."
                >
                  {isKeywordLoading ? ( /* Uses the same keywordData and loading state as Keyword Trends */
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading sentiment" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading sentiment data...</CustomText>
                    </div>
                  ) : keywordData && (Array.isArray(keywordData) ? keywordData.length > 0 : Object.keys(keywordData).length > 0) ? (
                    <KeywordComponent data={keywordData} /> /* Different type or config for sentiment view of keywordData */
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No sentiment data available.</CustomText></div>
                  )}
                </CustomContentBox>
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Sentiment by categories</span>}
                  tooltip="Break down sentiment by platform. See whether conversations lean positive, neutral, or negative, and how sentiment varies across channels."
                >
                  {isMentionSentimentBreakdownLoading ? ( /* This data also comes from getMentionSentimentBreakdownData */
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading sentiment by categories" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading sentiment by categories...</CustomText>
                    </div>
                  ) : sentimentByCategoryData && sentimentByCategoryData.length > 0 ? (
                    <SentimentByCategory data={sentimentByCategoryData} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No sentiment by categories data available.</CustomText></div>
                  )}
                </CustomContentBox>
              </div>

              {/* Most Share of Voice & Most Followers (Split) */}
              <div className="analysis-content-split">
                <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Most share of voice</span>}>
                  {isMostShareVoiceLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                      <img src="/loading.svg" alt="Loading most share of voice..." style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading share of voice data...</CustomText>
                    </div>
                  ) : mostShareVoiceData && mostShareVoiceData.length > 0 ? (
                    <>
                      <MostShareOfVoiceComponent data={mostShareVoiceData} />
                      {voicePage && voicePage.total_pages > 0 && (
                        <div className="dashboard-pagination">
                          <Pagination
                            count={voicePage.total_pages}
                            page={currentVoicePage}
                            onChange={handleChangeVoicePage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No share of voice data available.</CustomText></div>
                  )}
                </CustomContentBox>
                <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Most followers</span>}>
                  {isMostFollowersLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                      <img src="/loading.svg" alt="Loading most followers..." style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading most followers data...</CustomText>
                    </div>
                  ) : mostFollowersData && mostFollowersData.length > 0 ? (
                    <>
                      <MostFollowersComponent data={mostFollowersData} />
                      {followerPage && followerPage.total_pages > 0 && (
                        <div className="dashboard-pagination">
                          <Pagination
                            count={followerPage.total_pages}
                            page={currentFollowerPage}
                            onChange={handleChangeFollowerPage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No most followers data available.</CustomText></div>
                  )}
                </CustomContentBox>
              </div>

              {/* Presence Score & Sentiment Breakdown (Split) */}
              <div className="analysis-content-split">
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Presence score</span>}
                  tooltip="Track your visibility across platforms with a presence score. This score reflects how much public attention a topic or figure is generating."
                >
                  {isPresenceScoreLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading presence score" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading presence score...</CustomText>
                    </div>
                  ) : presenceScoreData && Object.keys(presenceScoreData).length > 0 ? (
                    <PresenceScoreComponent data={presenceScoreData} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No presence score data available.</CustomText></div>
                  )}
                </CustomContentBox>
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Sentiment breakdown</span>}
                  tooltip="Understand sentiment distribution at a glance. See the proportion of positive, negative, and neutral mentions to assess overall public sentiment."
                >
                  {isMentionSentimentBreakdownLoading ? ( /* This data also comes from getMentionSentimentBreakdownData */
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading sentiment breakdown" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading sentiment breakdown...</CustomText>
                    </div>
                  ) : sentimentBreakdownData && Object.keys(sentimentBreakdownData).length > 0 ? (
                    <SentimentBreakdownComponent data={sentimentBreakdownData} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No sentiment breakdown data available.</CustomText></div>
                  )}
                </CustomContentBox>
              </div>

              {/* Trending Hashtags & Trending Links (Split) */}
              <div className="analysis-content-split">
                <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Trending hashtags</span>}>
                  {isTrendingHashtagLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                      <img src="/loading.svg" alt="Loading trending hashtags..." style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading trending hashtags...</CustomText>
                    </div>
                  ) : hashTagData && hashTagData.length > 0 ? (
                    <>
                      <TrendingHashtagComponent data={hashTagData} />
                      {hashtagPage && hashtagPage.total_pages > 0 && (
                        <div className="dashboard-pagination">
                          <Pagination
                            count={hashtagPage.total_pages}
                            page={currentHashtagPage}
                            onChange={handleChangeHashtagPage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No trending hashtags data available.</CustomText></div>
                  )}
                </CustomContentBox>
                <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Trending links</span>}>
                  {isTrendingLinkLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                      <img src="/loading.svg" alt="Loading trending links..." style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading trending links...</CustomText>
                    </div>
                  ) : linkData && linkData.length > 0 ? (
                    <>
                      <TrendingLinkComponent data={linkData} />
                      {linkPage && linkPage.total_pages > 0 && (
                        <div className="dashboard-pagination">
                          <Pagination
                            count={linkPage.total_pages}
                            page={currentLinkPage}
                            onChange={handleChangeLinkPage}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No trending links data available.</CustomText></div>
                  )}
                </CustomContentBox>
              </div>
              
              {/* Context of Discussion & Most Popular Emojis (Split) */}
              <div className="analysis-content-split">
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Context of discussion</span>}
                  tooltip="Explore the context of discussions with a word cloud. See the most mentioned keywords, their frequency, and the sentiment behind each term to understand public narratives."
                >
                  {isContextLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading context of discussion" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading context data...</CustomText>
                    </div>
                  ) : contextOfDiscussionData && contextOfDiscussionData.length > 0 ? (
                    <ContextComponent data={contextOfDiscussionData} isLoading={false} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No context of discussion data available.</CustomText></div>
                  )}
                </CustomContentBox>
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Most popular emojis</span>}
                  tooltip="Decode emotional responses with emoji insights. See the most-used emojis to understand how audiences express themselves around your topic."
                >
                  {isMostPopularEmojisLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading popular emojis" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading popular emojis...</CustomText>
                    </div>
                  ) : mostPopularEmojisData && mostPopularEmojisData.length > 0 ? (
                    <PopularEmojis data={mostPopularEmojisData} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No popular emojis data available.</CustomText></div>
                  )}
                </CustomContentBox>
              </div>
            </>
          )}
      </div>

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

export default Analysis;
