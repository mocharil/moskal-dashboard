import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Paper from "@mui/material/Paper";
import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router";
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

  const [isLoadingFirst, setIsLoadingFirst] = useState(true);

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
    // keywords: activeKeywords.keywords,
    owner_id: `${activeKeywords.owner_id}`,
    project_name: activeKeywords.name,
    channels: [],
  });

  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});
  const [dataDateFilter, setDataDateFilter] = useState({});

  useEffect(() => {
    console.log("active key", activeKeywords);
    console.log("userdata", userData);
  }, []);

  useEffect(() => {
    if (!hasFetched) {
      getTopicsToWatchData();
      getKolToWatchData();
      getKeywordTrendsData();
      getContextOfDiscussion();
      getMentionsData();
      setHasFetched(true);
    }
  }, [hasFetched]);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    getTopicsToWatchData();
    getKolToWatchData();
    getKeywordTrendsData();
    getContextOfDiscussion();
    getMentionsData();
  }, [keyword]);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    getTopicsToWatchData();
    getKolToWatchData();
    getKeywordTrendsData();
    getContextOfDiscussion();
    getMentionsData();
  }, [dataAdvanceFilter, dataDateFilter]);

  useEffect(() => {
    if (isLoadingDone()) {
      setIsLoading(false);
      setIsLoadingFirst(false);
    }
  }, [topicsData, kolData, keywordData, mentionData, contextData]);

  useEffect(() => {
    if (activeFilterTab === "All Platform") {
      setDataReqBody({
        ...dataReqBody,
        channels: [],
      });
    } else {
      setDataReqBody({
        ...dataReqBody,
        channels: [activeFilterTab.toLowerCase()],
      });
    }
  }, [activeFilterTab]);

  useEffect(() => {
    getMentionsData();
  }, [activeTabMentions, mentionPage]);

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
      keywords:
        dataAdvanceFilter?.keywords?.length > 0
          ? dataAdvanceFilter?.keywords
          : activeKeywords.keywords,
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
        : 10,
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
      const resp = await getTopicToWatch(generateReqBody());
      if (resp) {
        setTopicsData(resp);
        setFilterTopicsData(getLimitArray(resp));
      }
      setIsLoadingTopic(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingTopic(false);
    }
  };

  const getKolToWatchData = async () => {
    setIsLoadingKol(true);
    try {
      const resp = await getKolToWatch(generateReqBody());
      if (resp) {
        setKolData(resp);
        setFilterKolData(getLimitArray(filterKOLMostNegative(resp)));
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

  const getKeywordTrendsData = async () => {
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

  const getContextOfDiscussion = async () => {
    setIsLoadingContext(true);
    try {
      const resp = await getContext(generateReqBody());
      setIsLoadingContext(false);
      setContextData(resp.data);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingContext(false);
    }
  };

  const getMentionsData = async () => {
    setIsLoadingMentions(true);
    try {
      const mentionReq = {
        ...generateReqBody(),
        sort_type: activeTabMentions === "Popular first" ? "popular" : "recent",
        page: mentionPage.page,
        page_size: 10,
      };
      const resp = await getMentions(mentionReq);
      setIsLoadingMentions(false);
      if (resp.data) {
        setMentionData(resp.data);
        if (resp.pagination) {
          setMentionPage(prevState => ({
            ...prevState,
            total_pages: resp.pagination.total_pages,
            total_posts: resp.pagination.total_posts
          }));
        }
      }
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
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
      const newArray = sortByField([...kolData], "viral_score", "asc");
      setFilterKolData(getLimitArray(newArray));
    } else {
      const newArray = getLimitArray(filterKOLMostNegative(kolData));
      setFilterKolData(getLimitArray(newArray));
    }
  };

  const filterKOLMostNegative = (array) => {
    const isNegativeArray = array.filter((value) => value.is_negative_driver);
    const sortedKOL = sortByFieldsMultiple(isNegativeArray, [
      {
        key: "sentiment_negative",
        order: "desc",
      },
      {
        key: "most_viral",
        order: "desc",
      },
    ]);
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
    setDataAdvanceFilter({
      channels: newValue === "all platform" ? [] : [newValue],
    });
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
    setDataAdvanceFilter({
      ...dataAdvanceFilter,
      keywords: searchBoxValue.split(","),
      search_exact_phrases: isSearchExactPhraseChecked,
    });
  };

  return (
    <>
      {isLoadingFirst ? (
        <div className="dashboard-loader-container">
          <CustomText color="brand" bold="semibold" size="mds" inline>
            #{keyword}
          </CustomText>
          <div className="dashboard-loader-longbar skeleton-loader"></div>
          <div className="dashboard-loader-longbar skeleton-loader"></div>
          <div className="dashboard-loader-flex">
            <div className="dashboard-loader-square skeleton-loader"></div>
            <div className="dashboard-loader-square skeleton-loader"></div>
          </div>
          <div className="dashboard-loader-flex">
            <div className="dashboard-loader-square skeleton-loader"></div>
            <div className="dashboard-loader-square skeleton-loader"></div>
          </div>
        </div>
      ) : (
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
            {isLoading ? (
              <LoadingUI />
            ) : isNoDataUIShow() ? (
              <>
                <NoDataUI />
              </>
            ) : (
              <>
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
                      
                      {filterTopicsData?.map((value, index) => (
                        <TopicsComponent
                          key={`topics-${index}`}
                          data={value}
                          borderBottom={index + 1 !== filterTopicsData.length}
                        />
                      ))}
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
                      {filterKolData?.map((value, index) => (
                        <KolComponent
                          key={`kol-${index}`}
                          data={value}
                          borderBottom={index + 1 !== filterKolData.length}
                        />
                      ))}
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
                      <KeywordComponent
                        type={activeTabKeyword}
                        data={keywordData}
                      />
                    </CustomContentBox>
                    <CustomContentBox
                      title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Context of discussion</span>}
                      tabList={tabListContext}
                      activeTab={activeTabContext}
                      handleChange={handleChangeContext}
                      tooltip="Explore the context of discussions with a word cloud. See the most mentioned keywords, their frequency, and the sentiment behind each term to understand public narratives."
                    >
                      <ContextComponent
                        type={activeTabContext.toLowerCase()}
                        data={contextData}
                      />
                    </CustomContentBox>
                  </div>
                  <div className="dashboard-content-flex-two">
                    <CustomContentBox
                      title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Mentions</span>}
                      seeAll
                      tabList={tabListMentions}
                      activeTab={activeTabMentions}
                      handleChange={handleMentionChange}
                      tooltip="Monitor mentions across platforms to see how your topic is being discussed. Sort by popularity or recency, and track sentiment to capture the public's perception."
                    >
                      <>
                        {mentionData?.map((value, index) => (
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
                    </CustomContentBox>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
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
