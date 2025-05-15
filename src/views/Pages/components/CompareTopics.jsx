import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import { useEffect, useState } from "react";
import CustomText from "../../../components/CustomText";
import CustomButton from "../../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KolComponent from "./KolComponent";
import TopicsComponent from "./TopicsComponent";
import ReactApexChart from "react-apexcharts";

import Chart from "react-apexcharts";

import {
  HelpOutline,
  PlaceOutlined,
  Public,
  SaveAlt,
  SentimentSatisfiedAlt,
} from "@mui/icons-material";
import ContextComponent from "./ContextComponent";
import SentimentByCategory from "./SentimentByCategoryComponent";
import MentionComponent from "./MentionComponent";
import {
  getContext,
  getIntentEmotionRegion,
  getKeywordTrends,
  getKolToWatch,
  getMentions,
  getTextSentimentData,
  getTopicToWatch,
} from "../../../services/topicService";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import DialogDateFilter from "./DialogDateFilter";
import DialogFilter from "./DialogFilter";
import {
  getAnalysisOverview,
  getMentionSentimentBreakdown,
} from "../../../services/analysisService";
import { filterAndDeduplicate, getLimitArray } from "../../../helpers/utils";
import LoadingUI from "./LoadingUI";
import NoDataUI from "./NoDataUI";
import { useDidUpdateEffect } from "../../../helpers/loadState";

const CompareTopics = (props) => {
  const listKeywords = useSelector((state) => state.keywords.keywords);
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const [selectedMainProject, setSelectedMainProject] = useState(
    activeKeywords.name
  );

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogMainProjectOpen, setIsDialogMainProjectOpen] = useState(false);

  const [globalDateFilter, setGlobalDateFilter] = useState({});
  const [globalAdvanceFilter, setGlobalAdvanceFilter] = useState({});

  const [overviewData, setOverviewData] = useState([]);
  const [kolData, setKolData] = useState([]);
  const [contextData, setContextData] = useState([]);
  const [mentionData, setMentionData] = useState([]);
  const [occurrencesData, setOccurrencesData] = useState([]);
  const [sentimentBreakdownData, setSentimentBreakdownData] = useState([]);
  const [channelsShareData, setChannelShareData] = useState([]);
  const [intentShareData, setIntentShareData] = useState([]);
  const [emotionShareData, setEmotionShareData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [textSentimentData, setTextSentimentData] = useState([]);

  const [listSelectedTopics, setListSelectedTopics] = useState([""]);

  const [dropdownData, setDropdownData] = useState([]);

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTopicListData();
  }, []);

  useDidUpdateEffect(() => {
    if (!listSelectedTopics.includes("")) {
      reFetchAPI();
    }
  }, [
    listSelectedTopics,
    selectedMainProject,
    globalDateFilter,
    globalAdvanceFilter,
  ]);

  const reFetchAPI = async () => {
    setIsLoading(true);
    await Promise.all([
      ...listSelectedTopics.map((value) => {
        const req = generateReqBody(globalDateFilter, {
          ...globalAdvanceFilter,
          project_name: selectedMainProject,
          keywords:
            globalAdvanceFilter.keywords?.length > 0
              ? globalAdvanceFilter.keywords
              : getKeywordsByIssue(dropdownData, value),
        });
        return Promise.all([
          getOverviewData(req, value),
          getMentionsData(req, value),
          getKolToWatchData(req, value),
          getContextOfDiscussionData(req, value),
          getOccurrencesData(req, value),
          getSentimentBreakdownData(req, value),
          getIntentEmotionRegionData(req, value),
          getTextSentiment(req, value),
        ]);
      }),
    ]).then(() => {
      setIsLoading(false);
    });
  };

  const getTopicListData = async () => {
    const reqBody = {
      owner_id: `${activeKeywords.owner_id}`,
      project_name: selectedMainProject,
      channels: [],
    };
    try {
      const resp = await getTopicToWatch(reqBody);
      if (resp) {
        setDropdownData(resp);
      }
      setIsFirstLoading(false);
      setIsLoading(false);
      props.handleChangeLoadingMain(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsFirstLoading(false);
      setIsLoading(false);
      props.handleChangeLoadingMain(false);
    }
  };

  const handleCloseDayDialog = () => {
    setIsDialogDayOpen(false);
  };

  const openDialogMainProjectFilterDialog = () => {
    setIsDialogMainProjectOpen(true);
  };

  const handleOpenDayDialog = () => {
    setIsDialogDayOpen(true);
  };

  const isShowCompareMoreTopics = () => {
    return !listSelectedTopics.includes("");
  };

  const handleAddTopics = () => {
    setListSelectedTopics([...listSelectedTopics, ""]);
  };

  const handleChangeGlobalDateFilterChange = (reqBody) => {
    setGlobalDateFilter(reqBody);
  };

  const handleChangeGlobalAdvanceFilterChange = (reqBody) => {
    setGlobalAdvanceFilter(reqBody);
  };

  const changeSelectedTopic = (newValue, index) => {
    if (newValue !== null) {
      const list = [...listSelectedTopics];
      list[index] = newValue;
      setListSelectedTopics([...list]);
    }
  };

  const handleChangeSelectedMainProject = (event, newValue) => {
    if (newValue !== null) {
      setSelectedMainProject(newValue);
    }
  };

  const getOverviewData = async (projectData, project_issue) => {
    try {
      const resp = await getAnalysisOverview(projectData);
      setOverviewData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp,
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getTextSentiment = async (projectData, project_issue) => {
    try {
      const resp = await getTextSentimentData(projectData);
      setTextSentimentData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp,
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
    }
  };

  const getMentionsData = async (projectData, project_issue) => {
    try {
      const resp = await getMentions(projectData);
      setMentionData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp?.data?.slice(0, 3),
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
    }
  };

  const getKolToWatchData = async (projectData, project_issue) => {
    try {
      const resp = await getKolToWatch(projectData);
      setKolData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.slice(0, 3),
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getContextOfDiscussionData = async (projectData, project_issue) => {
    try {
      const resp = await getContext(projectData);
      setContextData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.data,
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getOccurrencesData = async (projectData, project_issue) => {
    try {
      const resp = await getKeywordTrends(projectData);
      setOccurrencesData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp,
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getSentimentBreakdownData = async (projectData, project_issue) => {
    try {
      const resp = await getMentionSentimentBreakdown(projectData);
      setSentimentBreakdownData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp?.sentiment_breakdown,
          project_issue: project_issue,
        },
      ]);
      setChannelShareData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp?.mentions_by_category?.categories,
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      console.log("error", error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getIntentEmotionRegionData = async (projectData, project_issue) => {
    try {
      const resp = await getIntentEmotionRegion(projectData);
      setEmotionShareData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.emotions_share,
          project_issue: project_issue,
        },
      ]);
      setIntentShareData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.intents_share,
          project_issue: project_issue,
        },
      ]);
      setRegionData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: getLimitArray(resp.regions_share),
          project_issue: project_issue,
        },
      ]);
    } catch (error) {
      console.log("error", error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const generateReqBody = (dateFilter, advanceFilter) => {
    const data = {
      keywords: advanceFilter?.keywords,
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
        : 10,
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

  function getKeywordsByIssue(dataArray, unified_issue) {
    const item = dataArray.find((obj) => obj.unified_issue === unified_issue);
    return item ? item.list_issue : [];
  }

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
              <CustomButton
                sx={{ padding: "8px 16px" }}
                variant="outlined"
                endDecorator={<CalendarTodayIcon />}
                onClick={handleOpenDayDialog}
              >
                <CustomText bold="semibold" size="xls" inline>
                  Date Filter
                </CustomText>
              </CustomButton>
            </div>
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
            <div className="comparison-compare-topics-header">
              <div className="comparison-compare-topics-header-title-container">
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
                    onChange={handleChangeSelectedMainProject}
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
              <div>
                {listSelectedTopics.map((value, index) => (
                  <div className="compare-topic-list-topic-item">
                    <div>Topic {index + 1}*</div>
                    <Select
                      placeholder="Switch Topics"
                      indicator={<KeyboardArrowDown />}
                      sx={{
                        width: "100%",
                        height: 44,
                        [`& .${selectClasses.indicator}`]: {
                          transition: "0.2s",
                          [`&.${selectClasses.expanded}`]: {
                            transform: "rotate(-180deg)",
                          },
                        },
                      }}
                      value={value}
                      onChange={(e, newValue) =>
                        changeSelectedTopic(newValue, index)
                      }
                    >
                      {dropdownData.map((value, index) => (
                        <Option value={value.unified_issue}>
                          {value.unified_issue}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ))}

                {isShowCompareMoreTopics() && (
                  <div>
                    <CustomText
                      size="xls"
                      bold="semibold"
                      color="brand"
                      onClick={handleAddTopics}
                      pointer
                    >
                      Compare more topics +
                    </CustomText>
                  </div>
                )}
              </div>
            </div>
            {isLoading ? (
              <>
                <LoadingUI />
              </>
            ) : (
              <>
                {listSelectedTopics.length === 1 &&
                listSelectedTopics[0] === "" ? (
                  <>
                    <NoDataUI />
                  </>
                ) : (
                  <>
                    <OverviewView
                      data={overviewData}
                      listProject={listSelectedTopics}
                    />
                    {listSelectedTopics.length <= 2 && (
                      <>
                        <MentionsView
                          data={mentionData}
                          listProject={listSelectedTopics}
                        />

                        <KolToWatchView
                          data={kolData}
                          listProject={listSelectedTopics}
                          listKeywords={listKeywords}
                        />
                        <ContextOfDiscussionView
                          data={contextData}
                          listProject={listSelectedTopics}
                          listKeywords={listKeywords}
                        />
                      </>
                    )}

                    <OccurrencesView
                      data={occurrencesData}
                      listProject={listSelectedTopics}
                      listKeywords={listKeywords}
                    />

                    {listSelectedTopics.length <= 2 && (
                      <>
                        <div className="comparison-compare-projects-box-kol">
                          <div
                            className="comparison-compare-projects-box"
                            style={{ flex: 1 }}
                          >
                            Intent share
                            <div>
                              <IntentShare
                                data={intentShareData}
                                listProject={listSelectedTopics}
                              />
                            </div>
                          </div>
                          <div
                            className="comparison-compare-projects-box"
                            style={{ flex: 1 }}
                          >
                            Emotions share
                            <div>
                              <EmotionShare
                                data={emotionShareData}
                                listProject={listSelectedTopics}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="comparison-compare-projects-box-kol">
                          <div
                            className="comparison-compare-projects-box"
                            style={{ flex: 1 }}
                          >
                            Sentiment breakdown
                            <div>
                              <SentimentStackedChart
                                data={sentimentBreakdownData}
                                listProject={listSelectedTopics}
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
                                listProject={listSelectedTopics}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {listSelectedTopics.length > 2 && (
                      <>
                        <div
                          className="comparison-compare-projects-box"
                          style={{ flex: 1 }}
                        >
                          Sentiment breakdown
                          <div>
                            <SentimentStackedChart
                              data={sentimentBreakdownData}
                              listProject={listSelectedTopics}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="comparison-compare-projects-box">
                      <SentimentPerceptionView
                        data={regionData}
                        listProject={listSelectedTopics}
                        textSentimentData={textSentimentData}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <DialogDateFilter
        open={isDialogDayOpen}
        onClose={handleCloseDayDialog}
        handleChangeFilter={handleChangeGlobalDateFilterChange}
      />

      <DialogFilter
        open={isDialogMainProjectOpen}
        onClose={() => setIsDialogMainProjectOpen(false)}
        handleChangeFilter={handleChangeGlobalAdvanceFilterChange}
      />
    </>
  );
};

const OverviewView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");
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
          {val === max && <span> 🔥</span>}
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
          {val === max && <span> 🔥</span>}
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
          {val === max && <span> 🔥</span>}
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
          {percent} ({display}){val === max && <span> 🔥</span>}
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
          {percent} ({display}){val === max && <span> 🔥</span>}
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
          {val === max && <span> 🔥</span>}
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
          {val === max && <span> 🔥</span>}
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
          {display}/100{val === max && <span> 🔥</span>}
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
                {value.project_issue}
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

const MentionsView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };
  return (
    <div className="comparison-compare-projects-box">
      <div>Top Mentions</div>
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
                {value.project_issue}
              </CustomText>
            </div>
            {value?.data?.map((mention, index) => (
              <MentionComponent
                key={`mention-${index}`}
                data={mention}
                borderBottom={value?.data?.length !== index + 1}
                isShowAction
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
          </div>
        )}
      </div>
    </div>
  );
};

const KolToWatchView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
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
                {value.project_issue}
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
          </div>
        )}
      </div>
    </div>
  );
};

const ContextOfDiscussionView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");
  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
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
          </div>
        )}
      </div>
    </div>
  );
};

const OccurrencesView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");

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
    // colors: ["#2E90FA", "#079455", "#F04438"],
    xaxis: {
      type: "datetime",
      labels: {
        rotate: 0,
        formatter: function (value) {
          const date = new Date(value);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
        },
      },
      tickAmount: 6,
    },
    tooltip: {
      shared: true,
      x: {
        show: true,
        format: "dd",
      },
    },
  };

  const series = filterData?.map((value) => ({
    name: value.project_issue,
    data: value?.data.map((item, index) => {
      const date = new Date(item.post_date).toISOString();
      return {
        x: date,
        y: item.total_reach,
      };
    }),
  }));
  return (
    <div className="comparison-compare-projects-box">
      <div>Occurrences</div>
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
    </div>
  );
};

const SentimentStackedChart = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");

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
      categories: filterData.map((value) => value.project_issue),
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
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

const PlatformBreakdownChart = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");

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
      categories: filterData.map((value) => value.project_issue),
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

const IntentShare = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");

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
      toolbar: {
        show: false,
      },
    },
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
      categories: filterData.map((value) => value.project_issue),
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
    <div style={{ maxWidth: 600 }}>
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

const EmotionShare = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");

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
      toolbar: {
        show: false,
      },
    },
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
      categories: filterData.map((value) => value.project_issue),
      // labels: {
      //   rotate: 0,
      // },
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
    <div style={{ maxWidth: 600 }}>
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

const SentimentPerceptionView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_issue");

  const textSentimentData = props.textSentimentData;
  const filterTextData = filterAndDeduplicate(
    textSentimentData,
    listProject,
    "project_issue"
  );

  const colorVariable = ["#2E90FA", "#16B364", "#F04438"];
  const getColor = (index) => {
    const colorIndex = index % colorVariable.length;
    return colorVariable[colorIndex];
  };

  return (
    <div className="comparison-compare-region-box">
      {filterData.map((value, index) => (
        <>
          <div>
            <div
              className="comparison-compare-project-header-text-compare"
              style={{
                "--after-bg": getColor(index),
              }}
            >
              <CustomText bold="semibold" size="2xls" inLine>
                {value.project_issue}
              </CustomText>
            </div>
            <div
              className="overall-sentiment-box-container"
              style={{ margin: "16px 0px" }}
            >
              <div className="overall-sentiment-box-smile">
                <SentimentSatisfiedAlt
                  sx={{ width: "17px", color: "#087443" }}
                />
                <CustomText color="g700" size="2xls">
                  {filterTextData[index]?.data?.positive_topics}
                </CustomText>
              </div>
              <div className="overall-sentiment-box-frown">
                <img
                  className="overall-sentiment-frown-icon"
                  src={window.location.origin + "/face-frown.svg"}
                />
                <CustomText color="r700" size="2xls">
                  {filterTextData[index]?.data?.negative_topics}
                </CustomText>
              </div>
            </div>

            <div>
              <div className="overall-sentiment-top-regions">
                <CustomText bold="semibold" color="b900" size="lgs" inline>
                  Top regions
                </CustomText>
                <Public sx={{ width: "16px" }} />
              </div>
              <div className="overall-sentiment-region-container">
                {value?.data?.map((region, index) => (
                  <div
                    key={`overall-sentiment-${region.name}-${index}`}
                    className="overall-sentiment-region"
                  >
                    <PlaceOutlined sx={{ color: "#535862", width: "16px" }} />{" "}
                    <CustomText color="b600" size="xls" inline>
                      {region.name}
                    </CustomText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ))}
    </div>
  );
};

export default CompareTopics;
