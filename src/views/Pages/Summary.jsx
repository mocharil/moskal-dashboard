import React, { useState, useEffect } from "react";
import CustomText from "../../components/CustomText";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";

import CustomButton from "../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import KolComponent from "./components/KolComponent";
import MentionComponent from "./components/MentionComponent";
import CustomContentBox from "../../components/CustomContentBox";
import "./styles/Summary.css";
import SummaryComponent from "./components/SummaryComponent";
import KeywordComponent from "./components/KeywordComponent";
import AnalysisComponent from "./components/AnalysisComponent";
import DialogDateFilter from "./components/DialogDateFilter";
import {
  getKeywordTrends,
  getKolToWatch,
  getMentions,
} from "../../services/topicService";
import { getLimitArray, sortByField } from "../../helpers/utils";
import { getSummaryOverview } from "../../services/summaryService";
import { useSelector } from "react-redux";
import { getAnalysisOverview } from "../../services/analysisService";
import LoadingUI from "./components/LoadingUI";
import NoDataUI from "./components/NoDataUI";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";
import { useDidUpdateEffect } from "../../helpers/loadState";

const Summary = () => {
  const { keyword } = useParams(); 
  const navigate = useNavigate();
  // location is no longer needed for report-specific summary view

  // Removed isReportSummaryView and reportSpecificSummary states

  const [mentionData, setMentionData] = useState([]);
  const [kolData, setKolData] = useState([]);
  const [keywordData, setKeywordData] = useState([]);
  const [statData, setStatData] = useState([]);
  const [summaryData, setSummaryData] = useState({});

  const [filterMentionData, setFilterMentionData] = useState([]);
  const [filterKolData, setFilterKolData] = useState([]);

  const tabListMention = ["Popular", "Recent"];
  const tabListKol = ["Popular KOL", "Popular sites"];

  const [activeTabMentions, setActiveTabMentions] = useState("Popular");
  const [activeTabKol, setActiveTabKol] = useState("Popular KOL");

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);

  const [isLoadingFirst, setIsLoadingFirst] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingKol, setIsLoadingKol] = useState(true);
  const [isLoadingMentions, setIsLoadingMentions] = useState(true);
  const [isLoadingKeyword, setIsLoadingKeyword] = useState(true);
  const [isLoadingStat, setIsLoadingStat] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);

  const [dataReqBody, setDataReqBody] = useState({
    // Initialize directly as it's always for keyword summary now
    keywords: activeKeywords.keywords,
    owner_id: `${activeKeywords.owner_id}`,
    project_name: activeKeywords.name,
    channels: [],
  });
  const [dataDateFilter, setDataDateFilter] = useState({});
  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});

  useEffect(() => {
    // This effect now always runs for the keyword-based summary
    // Ensure activeKeywords is loaded before setting dataReqBody and fetching
    if (keyword && activeKeywords) {
      setDataReqBody({
        keywords: activeKeywords.keywords,
        owner_id: `${activeKeywords.owner_id}`,
        project_name: activeKeywords.name,
        channels: [],
      });
      // Initial data fetch
      getMentionsData();
      getKolToWatchData();
      getKeywordData();
      getStatData();
      getSummaryData();
    }
  }, [keyword, activeKeywords]); // Depend on keyword and activeKeywords

  // Effect for keyword changes (existing logic, simplified)
  useDidUpdateEffect(() => {
    if (keyword && dataReqBody) { // dataReqBody check is still good
      setIsLoadingFirst(true);
      setIsLoading(true);
      // Update dataReqBody if activeKeywords changed for the new 'keyword'
      if (activeKeywords && activeKeywords.name === keyword) {
         setDataReqBody(prev => ({
            ...prev,
            keywords: activeKeywords.keywords,
            owner_id: `${activeKeywords.owner_id}`,
            project_name: activeKeywords.name,
        }));
      }
      getMentionsData();
      getKolToWatchData();
      getKeywordData();
      getStatData();
      getSummaryData();
    }
  }, [keyword]); // Only keyword, dataReqBody will be updated by the main useEffect or this one

  // Effect for loading completion (existing logic, simplified)
  useDidUpdateEffect(() => {
    if (isLoadingDone()) {
      setIsLoadingFirst(false);
      setIsLoading(false);
    }
  }, [mentionData, kolData, keywordData, statData, summaryData]);

  // Effect for date filter changes (existing logic, simplified)
  useDidUpdateEffect(() => {
    if (dataReqBody) { // dataReqBody check is still good
      setIsLoading(true);
      getMentionsData();
      getKolToWatchData();
      getKeywordData();
      getStatData();
      getSummaryData();
    }
  }, [dataDateFilter]);

  // Effect for mentions tab changes (existing logic, simplified)
  useDidUpdateEffect(() => {
    if (dataReqBody) { // dataReqBody check is still good
      getMentionsData();
    }
  }, [activeTabMentions]);

  const generateReqBody = () => {
    if (!dataReqBody || !activeKeywords) return null; // Guard against null dataReqBody or activeKeywords

    const data = {
      keywords:
        dataAdvanceFilter?.keywords?.length > 0
          ? dataAdvanceFilter?.keywords
          : dataReqBody.keywords, // Use from dataReqBody state
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
      owner_id: dataReqBody.owner_id, 
      project_name: dataReqBody.project_name, 
    };
    return data;
  };

  const isLoadingDone = () => {
    // Simplified: no longer depends on isReportSummaryView
    return (
      !isLoadingKol &&
      !isLoadingMentions &&
      !isLoadingKeyword &&
      !isLoadingStat &&
      !isLoadingSummary
    );
  };

  const getStatData = async () => {
    setIsLoadingStat(true);
    try {
      const resp = await getSummaryOverview(generateReqBody());
      setStatData(resp);
      setIsLoadingStat(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingStat(false);
    }
  };

  const getKeywordData = async () => {
    setIsLoadingKeyword(true);
    try {
      const resp = await getKeywordTrends(generateReqBody());
      setKeywordData(resp);
      setIsLoadingKeyword(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingKeyword(false);
    }
  };

  const getMentionsData = async () => {
    setIsLoadingMentions(true);
    try {
      const mentionReq = {
        ...generateReqBody(),
        sort_type: activeTabMentions === "Popular" ? "popular" : "recent",
        // page: mentionPage.page,
        // page_size: 10,
      };
      const resp = await getMentions(mentionReq);
      setIsLoadingMentions(false);
      setMentionData(resp.data);
      setFilterMentionData(getLimitArray(resp.data));
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingMentions(false);
    }
  };

  const getKolToWatchData = async () => {
    setIsLoadingKol(true);
    try {
      const resp = await getKolToWatch(generateReqBody());
      if (resp) {
        setKolData(resp);
        const newArray = sortByField([...resp], "most_viral", "desc");
        setFilterKolData(getLimitArray(newArray));
      }
      setIsLoadingKol(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingKol(false);
    }
  };

  const getSummaryData = async () => {
    setIsLoadingSummary(true);
    try {
      const resp = await getAnalysisOverview(generateReqBody());
      setSummaryData(resp);
      setIsLoadingSummary(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingSummary(false);
    }
  };
  const handleOpenDayDialog = () => {
    setIsDialogDayOpen(true);
  };

  const handleCloseDayDialog = () => {
    setIsDialogDayOpen(false);
  };
  const handleChangeDateFilter = (reqBody) => {
    setDataDateFilter(reqBody);
  };
  const isNoDataUIShow = () => {
    if (!isLoading) {
      return (
        mentionData.length === 0 &&
        kolData === 0 &&
        keywordData === 0 &&
        statData === 0 &&
        summaryData === 0
      );
    } else {
      return false;
    }
  };
  const handleRedirectAnalysis = () => {
    if (keyword) navigate(`/${keyword}/analysis`, { replace: true });
  };

  const handleRedirectKOL = () => {
    if (keyword) navigate(`/${keyword}/kol`, { replace: true });
  };

  const handleChangeMentions = (event, newValue) => {
    setActiveTabMentions(newValue);
  };

  const handleChangeKOL = (event, newValue) => {
    // console.log(newValue); // Keep or remove console.log as per project standards
    setActiveTabKol(newValue);
    if (newValue === "Popular KOL") {
      const newArray = sortByField([...kolData], "most_viral", "desc");
      setFilterKolData(getLimitArray(newArray));
    } else {
      const newArray = sortByField([...kolData], "engagement_rate", "desc");
      setFilterKolData(getLimitArray(newArray));
    }
  };

  const redirectToMentions = () => {
    const basePayload = generateReqBody();
    const sortTypeForMentionsPage = activeTabMentions === "Popular" ? "popular" : "recent";
    
    const navigationPayload = {
      ...basePayload,
      sort_type: sortTypeForMentionsPage 
    };

    if (keyword) { // Ensure keyword is defined before navigating
      navigate(`/${keyword}/mentions`, { 
        state: { 
          filters: navigationPayload, 
          fromSummary: true // Flag to indicate navigation from Summary
        } 
      });
    }
  };

  // Removed the 'if (isReportSummaryView)' block as this component now only handles keyword-based summary

  // Below is the existing rendering logic for keyword-based summary
  return (
    <>
      <div className="summary-search-bar-container">
        {isLoadingFirst ? (
          <>
            <div className="summary-top-loader skeleton-loader"></div>
          </>
        ) : (
          <>
            <div className="summary-search-bar-left">
              <div>
                <svg
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  tabIndex="-1"
                  width="56"
                  viewBox="0 0 100 100"
                >
                  <circle
                    strokeDasharray={`${summaryData.presence_score?.value} 100`}
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#0047AB"
                    strokeWidth="16"
                    fill="none"
                    pathLength="100"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    stroke="#E9EAEB"
                    strokeWidth="1"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="32"
                    stroke="#E9EAEB"
                    strokeWidth="1"
                    fill="none"
                  />
                  <text
                    aria-hidden="true"
                    tabIndex="-1"
                    x="30"
                    y="55"
                    className="summary-circle-text"
                  >
                    {summaryData.presence_score?.display}%
                  </text>
                </svg>
              </div>
              <div>
                <CustomText bold="semibold" size="lgs" color="b900" inline>
                  {activeKeywords?.name} {/* Added optional chaining for safety */}
                </CustomText>
                <div className="summary-presence-score">
                  <CustomText size="2xls" color="b500" inline>
                    Presence Score
                  </CustomText>

                  <Tooltip
                    title="Track your visibility across platforms with a presence score. This score reflects how much public attention a topic or figure is generating."
                    placement="top"
                    sx={{ maxWidth: "300px" }}
                  >
                    <HelpOutline
                      sx={{ color: "#A4A7AE", width: "16px" }}
                    ></HelpOutline>
                  </Tooltip>
                </div>
              </div>
            </div>
            <div className="summary-search-bar-right">
              <CustomButton
                variant="outlined"
                endDecorator={<CalendarTodayIcon />}
                onClick={handleOpenDayDialog}
              >
                Date Filter
              </CustomButton>
              <CustomButton variant="outlined-blue">
                Latest Mentions
              </CustomButton>
            </div>
          </>
        )}
      </div>
      <div className="summary-content-container">
        {isLoadingFirst ? (
          <>
            <div className="summary-content-flex-two">
              <div className="summary-content-flex-vertical">
                <div className="summary-content-loader skeleton-loader"></div>
              </div>
              <div className="summary-content-flex-vertical">
                <div className="summary-content-loader-small-1 skeleton-loader"></div>
                <div className="summary-content-loader-small-2 skeleton-loader"></div>
              </div>
            </div>
            <div className="summary-content-flex-two">
              <div className="summary-content-loader skeleton-loader"></div>
              <div className="summary-content-loader skeleton-loader"></div>
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
            <div className="summary-content-flex-two">
              <div className="summary-content-flex-vertical">
                <CustomContentBox
                  title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Top mentions</span>}
                  seeAll="See All Mentions"
                  handleSeeAll={redirectToMentions} // Added handleSeeAll
                  activeTab={activeTabMentions}
                  tabList={tabListMention}
                  handleChange={handleChangeMentions}
                  tooltip="Monitor mentions across platforms to see how your topics is being discussed. Sort by popularity or recency, and track sentiment to capture the public's preception."
                >
                  <>
                    {filterMentionData?.map((value, index) => (
                      <MentionComponent
                        key={`mention-${index}`}
                        data={value}
                        borderBottom={index + 1 !== filterMentionData.length}
                      />
                    ))}
                  </>
                </CustomContentBox>
              </div>
              <div className="summary-content-flex-vertical">
                <div>
                  <CustomContentBox
                    title="Summary"
                    tooltip="Get a snapshot of your topic's overall performance. Track mentions, reach, interactions, and sentiment shifts over time to understand the big picture."
                  >
                    <SummaryComponent data={summaryData} />
                  </CustomContentBox>
                </div>
                <div>
                  <CustomContentBox
                    title="Keyword"
                    tooltip="Analyze keyword trends over time. Track mentions and reach to understand how topics are gaining traction and influencing online conversations."
                  >
                    <KeywordComponent
                      data={keywordData}
                      type="Mentions & Reach"
                    />
                  </CustomContentBox>
                </div>
              </div>
            </div>
            <div className="summary-content-flex-two">
              <CustomContentBox
                title="Influencer"
                seeAll="See all mentions"
                activeTab={activeTabKol}
                tabList={tabListKol}
                handleSeeAll={handleRedirectKOL}
                handleChange={handleChangeKOL}
                tooltip="Identify influential voices driving the conversation. See who's talking about your topic, their sentiment, and how much reach they generate."
              >
                {filterKolData?.map((value, index) => (
                  <KolComponent
                    key={`kol-${index}`}
                    data={value}
                    borderBottom={index + 1 !== filterKolData.length}
                  />
                ))}
              </CustomContentBox>
              <CustomContentBox
                title="Stats"
                seeAll="See analysis"
                handleSeeAll={handleRedirectAnalysis}
                tooltip="Analyze detailed engagement metrics. Track mentions, shares, likes, and video activity across platforms to measure audience interaction and sentiment shifts."
              >
                <AnalysisComponent data={statData} />
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
    </>
  );
};

export default Summary;
