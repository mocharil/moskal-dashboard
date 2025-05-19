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
  const [sentimentBreakdownData, setSentimentBreakdownData] = useState([]);
  const [hashTagData, setHashTagData] = useState([]);
  const [linkData, setLinkData] = useState([]);
  const [contextOfDiscussionData, setContextOfDiscussionData] = useState([]);
  const [mostPopularEmojisData, setMostPopularEmojisData] = useState([]);

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    getOverviewData();
    getMentionData();
    getKeywordData();
    getMostShareVoiceData();
    getMostFollowersData();
    getTrendingHashTagData();
    getTrendingLinkData();
    getMentionSentimentBreakdownData();
    getMostPopularEmojisData();
    getContextData();
    getPresenceScoreData();
  }, []);

  useDidUpdateEffect(() => {
    setIsFirstLoading(true);
    setIsLoading(true);
    getOverviewData();
    getMentionData();
    getKeywordData();
    getMostShareVoiceData();
    getMostFollowersData();
    getTrendingHashTagData();
    getTrendingLinkData();
    getMentionSentimentBreakdownData();
    getMostPopularEmojisData();
    getContextData();
    getPresenceScoreData();
  }, [keyword]);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    getOverviewData();
    getMentionData();
    getKeywordData();
    getMostShareVoiceData();
    getMostFollowersData();
    getTrendingHashTagData();
    getTrendingLinkData();
    getMentionSentimentBreakdownData();
    getMostPopularEmojisData();
    getContextData();
    getPresenceScoreData();
  }, [dataAdvanceFilter, dataDateFilter]);

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
      setIsFirstLoading(false);
      setIsLoading(false);
    }
  }, [
    mentionData,
    overviewData,
    keywordData,
    mentionByCategoryData,
    sentimentByCategoryData,
    mostShareVoiceData,
    mostFollowersData,
    presenceScoreData,
    sentimentBreakdownData,
    hashTagData,
    linkData,
    contextOfDiscussionData,
    mostPopularEmojisData,
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
      const resp = await getAnalysisOverview(generateReqBody());
      setOverviewData(resp);
      setIsOverviewLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsOverviewLoading(false);
    }
  };

  const getMentionData = async () => {
    setIsMentionLoading(true);
    try {
      const mentionReq = {
        ...generateReqBody(),
        sort_type:
          activeTabMention === "Most Popular" ? "popular" : "recent",
        page: currentMentionPage,
        page_size: 5,
      };
      const resp = await getMentions(mentionReq);
      setIsMentionLoading(false);
      if (resp.data) {
        setMentionData(resp.data);
        setMentionPage(resp.pagination);
      }
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsMentionLoading(false);
    }
  };

  const getKeywordData = async () => {
    setIsKeywordLoading(true);
    try {
      const resp = await getKeywordTrends(generateReqBody());
      setKeywordData(resp);
      setIsKeywordLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsKeywordLoading(false);
    }
  };

  const getMostShareVoiceData = async () => {
    setIsMostShareVoiceLoading(true);
    try {
      const voiceReq = {
        ...generateReqBody(),
        page: currentVoicePage,
        page_size: 5,
      };
      const resp = await getMostShareVoice(voiceReq);
      setMostShareVoiceData(resp.data);
      setVoicePage(resp.pagination);
      setIsMostShareVoiceLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsMostShareVoiceLoading(false);
    }
  };

  const getMostFollowersData = async () => {
    setIsMostFollowersLoading(true);
    try {
      const followerReq = {
        ...generateReqBody(),
        page: currentFollowerPage,
        page_size: 5,
      };
      const resp = await getMostFollowers(followerReq);
      setMostFollowersData(resp.data);
      setFollowerPage(resp.pagination);
      setIsMostFollowersLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsMostFollowersLoading(false);
    }
  };

  const getTrendingHashTagData = async () => {
    setIsTrendingHashtagLoading(true);
    try {
      const hashtagReq = {
        ...generateReqBody(),
        page: currentHashtagPage,
        page_size: 5,
      };
      const resp = await getTrendingHashtag(hashtagReq);
      setHashTagData(resp.data);
      setHashtagPage(resp.pagination);
      setIsTrendingHashtagLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsTrendingHashtagLoading(false);
    }
  };

  const getTrendingLinkData = async () => {
    setIsTrendingLinkLoading(true);
    try {
      const linkReq = {
        ...generateReqBody(),
        page: currentLinkPage,
        page_size: 5,
      };
      const resp = await getTrendingLink(linkReq);
      setLinkData(resp.data);
      setLinkPage(resp.pagination);
      setIsTrendingLinkLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsTrendingLinkLoading(false);
    }
  };

  const getMentionSentimentBreakdownData = async () => {
    setIsMentionSentimentBreakdownLoading(true);
    try {
      const resp = await getMentionSentimentBreakdown(generateReqBody());
      setMentionByCategoryData(resp.mentions_by_category?.categories);
      setSentimentBreakdownData(resp.sentiment_breakdown);
      setSentimentByCategoryData(resp.sentiment_by_category?.categories);
      setIsMentionSentimentBreakdownLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsMentionSentimentBreakdownLoading(false);
    }
  };

  const getMostPopularEmojisData = async () => {
    setIsMostPopularEmojisLoading(true);
    try {
      const resp = await getPopularEmojis(generateReqBody());
      setMostPopularEmojisData(resp.data);
      setIsMostPopularEmojisLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsMostPopularEmojisLoading(false);
    }
  };

  const getContextData = async () => {
    setIsContextLoading(true);
    try {
      const resp = await getContext(generateReqBody());
      setContextOfDiscussionData(resp.data);
      setIsContextLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsContextLoading(false);
    }
  };

  const getPresenceScoreData = async () => {
    setIsPresenceScoreLoading(true);
    try {
      const resp = await getPresenceScore(generateReqBody());
      setPresenceScoreData(resp);
      setIsPresenceScoreLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsPresenceScoreLoading(false);
    }
  };

  const isNoDataUIShow = () => {
    if (!isLoading) {
      return (
        mentionData.length === 0 &&
        overviewData.length === 0 &&
        keywordData.length === 0 &&
        mentionByCategoryData.length === 0 &&
        sentimentByCategoryData.length === 0 &&
        mostShareVoiceData.length === 0 &&
        mostFollowersData.length === 0 &&
        presenceScoreData.length === 0 &&
        sentimentBreakdownData.length === 0 &&
        hashTagData.length === 0 &&
        linkData.length === 0 &&
        contextOfDiscussionData.length === 0 &&
        mostPopularEmojisData.length === 0
      );
    } else {
      return false;
    }
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
      keywords: searchBoxValue.split(","),
      search_exact_phrases: isSearchExactPhraseChecked,
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
        {isFirstLoading ? (
          <>
            <div className="analysis-content-split">
              <div className="analysis-main-loader skeleton-loader"></div>
              <div className="analysis-main-loader skeleton-loader"></div>
            </div>
          </>
        ) : isLoading ? (
          <>
            <LoadingUI />
          </>
        ) : isNoDataUIShow() ? (
          <>
            <NoDataUI />
          </>
        ) : (
          <>
            <CustomContentBox
              title="Overview"
              seeAll="See detail comparison"
              handleSeeAll={handleRedirectCompare}
            >
              <OverviewComponent data={overviewData} />
            </CustomContentBox>
            <CustomContentBox
              title="Mentions"
              seeAll="See all mentions"
              tabList={tabListMention}
              activeTab={activeTabMention}
              handleChange={handleMentionChange}
              tooltip="Monitor mentions across platforms to see how your topic is being discussed. Sort by popularity or recency, and track sentiment to capture the public's perception."
            >
              {isMentionLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <img src="/loading.svg" alt="Loading mentions..." style={{ width: '50px', height: '50px' }} />
                </div>
              ) : (
                <>
                  {mentionData?.map((value, index) => (
                    <MentionComponent
                      key={`mention-${index}`}
                      data={value}
                      borderBottom
                      isShowAction
                    />
                  ))}
                  {mentionData && mentionData.length > 0 && (
                    <div className="dashboard-pagination">
                      <Pagination
                        count={mentionPage.total_pages}
                        page={currentMentionPage}
                        onChange={handleChangeMentionPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CustomContentBox>
            <div className="analysis-content-split">
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Keyword Trends</span>}
                tooltip="Analyze keyword trends over time. Track mentions and reach to understand how topics are gaining traction and influencing online conversations."
              >
                <KeywordComponent data={keywordData} type="Most Popular" />
              </CustomContentBox>
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Mentions by categories</span>}
                tooltip="See where conversations happen. Understand which platforms drive the most discussions and focus efforts where they matter most."
              >
                <MentionsByCategoryComponent data={mentionByCategoryData} />
              </CustomContentBox>
            </div>
            <div className="analysis-content-split">
              <CustomContentBox
                title="Sentiment"
                tooltip="Visualize sentiment shifts over time. Track the volume of positive and negative mentions to gauge public perception and respond strategically."
              >
                <KeywordComponent data={keywordData} />
              </CustomContentBox>
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Sentiment by categories</span>}
                tooltip="Break down sentiment by platform. See whether conversations lean positive, neutral, or negative, and how sentiment varies across channels."
              >
                <SentimentByCategory data={sentimentByCategoryData} />
              </CustomContentBox>
            </div>
            <div className="analysis-content-split">
              <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Most share of voice</span>}>
                {isMostShareVoiceLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <img src="/loading.svg" alt="Loading most share of voice..." style={{ width: '50px', height: '50px' }} />
                  </div>
                ) : (
                  <>
                    <MostShareOfVoiceComponent data={mostShareVoiceData} />
                    {mostShareVoiceData && mostShareVoiceData.length > 0 && (
                      <div className="dashboard-pagination">
                        <Pagination
                          count={voicePage.total_pages}
                          page={currentVoicePage}
                          onChange={handleChangeVoicePage}
                        />
                      </div>
                    )}
                  </>
                )}
              </CustomContentBox>
              <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Most followers</span>}>
                {isMostFollowersLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <img src="/loading.svg" alt="Loading most followers..." style={{ width: '50px', height: '50px' }} />
                  </div>
                ) : (
                  <>
                    <MostFollowersComponent data={mostFollowersData} />
                    {mostFollowersData && mostFollowersData.length > 0 && (
                      <div className="dashboard-pagination">
                        <Pagination
                          count={followerPage.total_pages}
                          page={currentFollowerPage}
                          onChange={handleChangeFollowerPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </CustomContentBox>
            </div>
            <div className="analysis-content-split">
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Presence score</span>}
                tooltip="Track your visibility across platforms with a presence score. This score reflects how much public attention a topic or figure is generating."
              >
                <PresenceScoreComponent data={presenceScoreData} />
              </CustomContentBox>
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Sentiment breakdown</span>}
                tooltip="Understand sentiment distribution at a glance. See the proportion of positive, negative, and neutral mentions to assess overall public sentiment."
              >
                <SentimentBreakdownComponent data={sentimentBreakdownData} />
              </CustomContentBox>
            </div>
            <div className="analysis-content-split">
              <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Trending hashtags</span>}>
                {isTrendingHashtagLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <img src="/loading.svg" alt="Loading trending hashtags..." style={{ width: '50px', height: '50px' }} />
                  </div>
                ) : (
                  <>
                    <TrendingHashtagComponent data={hashTagData} />
                    {hashTagData && hashTagData.length > 0 && (
                      <div className="dashboard-pagination">
                        <Pagination
                          count={hashtagPage.total_pages}
                          page={currentHashtagPage}
                          onChange={handleChangeHashtagPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </CustomContentBox>
              <CustomContentBox title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Trending links</span>}>
                {isTrendingLinkLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <img src="/loading.svg" alt="Loading trending links..." style={{ width: '50px', height: '50px' }} />
                  </div>
                ) : (
                  <>
                    <TrendingLinkComponent data={linkData} />
                    {linkData && linkData.length > 0 && (
                      <div className="dashboard-pagination">
                        <Pagination
                          count={linkPage.total_pages}
                          page={currentLinkPage}
                          onChange={handleChangeLinkPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </CustomContentBox>
            </div>
            <div className="analysis-content-split">
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Context of discussion</span>}
                tooltip="Explore the context of discussions with a word cloud. See the most mentioned keywords, their frequency, and the sentiment behind each term to understand public narratives."
              >
                <ContextComponent data={contextOfDiscussionData} isLoading={isContextLoading} />
              </CustomContentBox>
              <CustomContentBox
                title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Most popular emojis</span>}
                tooltip="Decode emotional responses with emoji insights. See the most-used emojis to understand how audiences express themselves around your topic."
              >
                <PopularEmojis data={mostPopularEmojisData} />
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
