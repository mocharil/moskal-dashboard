import React, { useState, useEffect, useRef } from "react";
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
import { getLimitArray, sortByField, sortByFieldsMultiple } from "../../helpers/utils";
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

  // const [isLoadingFirst, setIsLoadingFirst] = useState(true); // Removed: No more top-level skeleton
  const [isLoading, setIsLoading] = useState(true); // True if any batch of fetches is in progress

  const [isLoadingKol, setIsLoadingKol] = useState(true);
  const [isLoadingMentions, setIsLoadingMentions] = useState(true);
  const [isLoadingKeyword, setIsLoadingKeyword] = useState(true);
  const [isLoadingStat, setIsLoadingStat] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);

  const [dataReqBody, setDataReqBody] = useState(null); // Initialize dataReqBody to null
  const [dataDateFilter, setDataDateFilter] = useState({});
  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});

  const fetchAllSummaryData = () => { // currentReqBody parameter removed as it was unused
    // Individual get*Data functions already manage their own isLoading(true) state internally.
    // Calling them here without await allows them to run concurrently.
    // Each component will display its data as soon as its specific fetch completes.
    
    // generateReqBody is called inside each get*Data function, using the latest state values.
    getMentionsData();
    getKolToWatchData();
    getKeywordData();
    getStatData();
    getSummaryData();
  };

  useEffect(() => {
    // Handles initial load and changes to keyword or activeKeywords
    // Ensure activeKeywords and its essential properties are available
    if (keyword && activeKeywords && activeKeywords.name && activeKeywords.owner_id !== undefined && Array.isArray(activeKeywords.keywords)) {
      const newReqBody = {
        keywords: activeKeywords.keywords,
        owner_id: String(activeKeywords.owner_id), // Ensure owner_id is a string
        project_name: activeKeywords.name,
        channels: activeKeywords.channels || [], // Use channels from activeKeywords if present
      };
      setDataReqBody(newReqBody);
    } else {
      setDataReqBody(null); // Reset if activeKeywords is not fully ready
    }
  }, [keyword, activeKeywords]);

  // This effect triggers data fetching when dataReqBody is populated or dateFilter changes.
  // Using regular useEffect instead of useDidUpdateEffect to ensure it runs on initial render and page refresh
  useEffect(() => {
    if (dataReqBody && dataReqBody.project_name) {
      setIsLoading(true); // Indicate a batch of fetches is starting
      fetchAllSummaryData();
    }
    // If dataReqBody becomes null (e.g., activeKeywords becomes invalid),
    // individual loading states should be managed by the get*Data functions or an isLoadingDone effect.
  }, [dataReqBody, dataDateFilter]); // Trigger on dataReqBody object change or date filter change


  // Effect for overall loading completion
  useEffect(() => {
    if (isLoadingDone()) {
      setIsLoading(false); // All individual fetches in the current batch are complete.
      // if (isLoadingFirst) { // Removed block related to isLoadingFirst
      //   setIsLoadingFirst(false); 
      // }
    }
  }, [isLoadingKol, isLoadingMentions, isLoadingKeyword, isLoadingStat, isLoadingSummary]); // isLoadingFirst removed from dependencies

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
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getStatData. Skipping API call.");
        setIsLoadingStat(false);
        return;
      }
      const resp = await getSummaryOverview(reqBody);
      setStatData(resp);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsLoadingStat(false);
    }
  };

  const getKeywordData = async () => {
    setIsLoadingKeyword(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getKeywordData. Skipping API call.");
        setIsLoadingKeyword(false);
        return;
      }
      const resp = await getKeywordTrends(reqBody);
      setKeywordData(resp);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsLoadingKeyword(false);
    }
  };

  const getMentionsData = async () => {
    setIsLoadingMentions(true);
    try {
      const baseReqBody = generateReqBody();
      if (!baseReqBody) {
        console.warn("generateReqBody returned null in getMentionsData. Skipping API call.");
        setIsLoadingMentions(false);
        return;
      }
      const mentionReq = {
        ...baseReqBody,
        sort_type: activeTabMentions === "Popular" ? "popular" : "recent",
      };
      const resp = await getMentions(mentionReq);
      setMentionData(resp.data);
      setFilterMentionData(getLimitArray(resp.data));
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsLoadingMentions(false);
    }
  };

  const getKolToWatchData = async () => {
    setIsLoadingKol(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getKolToWatchData. Skipping API call.");
        setIsLoadingKol(false);
        return;
      }
      const resp = await getKolToWatch(reqBody);
      if (resp) {
        setKolData(resp);
        // Apply initial sort/filter based on the activeTabKol
        if (activeTabKol === "Popular KOL") {
          const filteredKOL = resp.filter(kol => kol.channel !== 'news');
          const sortedKOL = sortByFieldsMultiple([...filteredKOL], [
            { key: 'user_influence_score', order: 'desc' },
            { key: 'user_followers', order: 'desc' }
          ]);
          setFilterKolData(getLimitArray(sortedKOL));
        } else { // "Popular sites"
          const filteredSites = resp.filter(kol => {
            const channel = kol.channel?.toLowerCase();
            const category = kol.user_category?.toLowerCase();
            return channel === 'news' || category === 'news account';
          });
          
          const sortedSites = sortByFieldsMultiple([...filteredSites], [
            { key: 'link_post', order: 'desc' },
            { key: 'user_influence_score', order: 'desc' }
          ]);
          setFilterKolData(getLimitArray(sortedSites));
        }
      }
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
      setIsLoadingKol(false);
    }
  };

  const getSummaryData = async () => {
    setIsLoadingSummary(true);
    try {
      const reqBody = generateReqBody();
      if (!reqBody) {
        console.warn("generateReqBody returned null in getSummaryData. Skipping API call.");
        setIsLoadingSummary(false);
        return;
      }
      const resp = await getAnalysisOverview(reqBody);
      setSummaryData(resp);
    } catch (error) {
      enqueueSnackbar("Network Error", { variant: "error" });
      console.log(error);
    } finally {
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
  const allDataSectionsEmpty = () => {
    // This function checks if all data sections are empty, assuming their fetches are complete.
    return (
      (!mentionData || mentionData.length === 0) &&
      (!kolData || kolData.length === 0) &&
      (!keywordData || (Array.isArray(keywordData) ? keywordData.length === 0 : Object.keys(keywordData).length === 0)) &&
      (!statData || (Array.isArray(statData) ? statData.length === 0 : Object.keys(statData).length === 0)) &&
      (!summaryData || Object.keys(summaryData).length === 0)
    );
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
    setActiveTabKol(newValue);
    if (newValue === "Popular KOL") {
      const filteredKOL = kolData.filter(kol => kol.channel !== 'news');
      const sortedKOL = sortByFieldsMultiple([...filteredKOL], [
        { key: 'user_influence_score', order: 'desc' },
        { key: 'user_followers', order: 'desc' }
      ]);
      setFilterKolData(getLimitArray(sortedKOL));
    } else { // "Popular sites"
      const filteredSites = kolData.filter(kol => {
        const channel = kol.channel?.toLowerCase();
        const category = kol.user_category?.toLowerCase();
        return channel === 'news' || category === 'news account';
      });
      
      const sortedSites = sortByFieldsMultiple([...filteredSites], [
        
        { key: 'link_post', order: 'desc' },
        { key: 'user_influence_score', order: 'desc' }
        
      ]);
      setFilterKolData(getLimitArray(sortedSites));
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
        {/* isLoadingFirst condition removed, search bar structure renders immediately */}
        {/* Data inside (like presence_score) will populate when isLoadingSummary is false */}
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
      </div>

      {/* Content Area: Renders immediately. Individual components manage their loading state. */}
      {/* !isLoadingFirst condition removed */}
      <div className="summary-content-container">
        {/* Show NoDataUI only if all fetches are complete AND all sections are empty */}
        {isLoadingDone() && allDataSectionsEmpty() ? (
            <NoDataUI />
          ) : (
            <>
              {/* Row 1 */}
              <div className="summary-content-flex-two">
                {/* Top Mentions Section */}
                <div className="summary-content-flex-vertical">
                  <CustomContentBox
                    title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Top mentions</span>}
                    seeAll="See All Mentions"
                    handleSeeAll={redirectToMentions}
                    activeTab={activeTabMentions}
                    tabList={tabListMention}
                    handleChange={handleChangeMentions}
                    tooltip="Monitor mentions across platforms to see how your topics is being discussed. Sort by popularity or recency, and track sentiment to capture the public's preception."
                  >
                    {isLoadingMentions ? (
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                        <img src="/loading.svg" alt="Loading mentions" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                        <CustomText>Loading mentions data...</CustomText>
                      </div>
                    ) : filterMentionData?.length > 0 ? (
                      filterMentionData.map((value, index) => (
                        <MentionComponent
                          key={`mention-${index}`}
                          data={value}
                          borderBottom={index + 1 !== filterMentionData.length}
                        />
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No mentions data available.</CustomText></div>
                    )}
                  </CustomContentBox>
                </div>

                {/* Summary & Keyword Sections */}
                <div className="summary-content-flex-vertical">
                  <div>
                    <CustomContentBox
                      title="Summary"
                      tooltip="Get a snapshot of your topic's overall performance. Track mentions, reach, interactions, and sentiment shifts over time to understand the big picture."
                    >
                      {isLoadingSummary ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                          <img src="/loading.svg" alt="Loading summary" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                          <CustomText>Loading summary data...</CustomText>
                        </div>
                      ) : summaryData && Object.keys(summaryData).length > 0 ? (
                        <SummaryComponent data={summaryData} />
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No summary data available.</CustomText></div>
                      )}
                    </CustomContentBox>
                  </div>
                  <div>
                    <CustomContentBox
                      title="Keyword"
                      tooltip="Analyze keyword trends over time. Track mentions and reach to understand how topics are gaining traction and influencing online conversations."
                    >
                      {isLoadingKeyword ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }}>
                          <img src="/loading.svg" alt="Loading keywords" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                          <CustomText>Loading keyword data...</CustomText>
                        </div>
                      ) : keywordData && (Array.isArray(keywordData) ? keywordData.length > 0 : Object.keys(keywordData).length > 0) ? (
                        <KeywordComponent
                          data={keywordData}
                          type="Mentions & Reach" // Ensure this type is appropriate or make it dynamic
                        />
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No keyword data available.</CustomText></div>
                      )}
                    </CustomContentBox>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="summary-content-flex-two">
                {/* Influencer Section */}
                <CustomContentBox
                  title="Influencer"
                  seeAll="See all KOLs" // Corrected "See all" text
                  activeTab={activeTabKol}
                  tabList={tabListKol}
                  handleSeeAll={handleRedirectKOL}
                  handleChange={handleChangeKOL}
                  tooltip="Identify influential voices driving the conversation. See who's talking about your topic, their sentiment, and how much reach they generate."
                >
                  {isLoadingKol ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading influencers" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading influencer data...</CustomText>
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
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No influencer data available.</CustomText></div>
                  )}
                </CustomContentBox>

                {/* Stats Section */}
                <CustomContentBox
                  title="Stats"
                  seeAll="See analysis"
                  handleSeeAll={handleRedirectAnalysis}
                  tooltip="Analyze detailed engagement metrics. Track mentions, shares, likes, and video activity across platforms to measure audience interaction and sentiment shifts."
                >
                  {isLoadingStat ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                      <img src="/loading.svg" alt="Loading stats" style={{ width: '30px', height: '30px', marginBottom: '8px' }} />
                      <CustomText>Loading stats data...</CustomText>
                    </div>
                  ) : statData && (Array.isArray(statData) ? statData.length > 0 : Object.keys(statData).length > 0) ? (
                    <AnalysisComponent data={statData} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}><CustomText>No stats data available.</CustomText></div>
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
    </>
  );
};

export default Summary;
