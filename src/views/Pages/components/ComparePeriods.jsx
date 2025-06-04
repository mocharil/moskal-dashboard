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

import { SaveAlt } from "@mui/icons-material";
import ContextComponent from "./ContextComponent";
import SentimentByCategory from "./SentimentByCategoryComponent";
import { useDispatch, useSelector } from "react-redux";
import DialogDateFilter from "./DialogDateFilter";
import DialogFilter from "./DialogFilter";
import {
  getAnalysisOverview,
  getMentionSentimentBreakdown,
} from "../../../services/analysisService";
import { filterAndDeduplicate } from "../../../helpers/utils";
import {
  getContext,
  getKeywordTrends,
  getKolToWatch,
  getTopicToWatch,
} from "../../../services/topicService";
import LoadingUI from "./LoadingUI";
import { enqueueSnackbar } from "notistack";
import { useDidUpdateEffect } from "../../../helpers/loadState";

const ComparePeriods = (props) => {
  const colorVariable = ["#2E90FA", "#84CAFF"];
  const listKeywords = useSelector((state) => state.keywords.keywords);
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);

  const [selectedMainProject, setSelectedMainProject] = useState(
    activeKeywords.name
  );

  const [overviewData, setOverviewData] = useState([]);
  const [topicsData, setTopicsData] = useState([]);
  const [kolData, setKolData] = useState([]);
  const [issuesData, setIssuesData] = useState([]);
  const [contextData, setContextData] = useState([]);
  const [mentionData, setMentionData] = useState([]);
  const [reachData, setReachData] = useState([]);
  const [positiveSentimentData, setPositiveSentimentData] = useState([]);
  const [negativeSentimentData, setNegativeSentimentData] = useState([]);
  const [sentimentBreakdownData, setSentimentBreakdownData] = useState([]);
  const [channelsShareData, setChannelShareData] = useState([]);

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogMainProjectOpen, setIsDialogMainProjectOpen] = useState(false);

  const [globalDateFilter, setGlobalDateFilter] = useState({
    custom_end_date: "",
    custom_start_date: "",
    date_filter: "custom",
  });
  const [globalAdvanceFilter, setGlobalAdvanceFilter] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoading, setIsFirstLoading] = useState(true);

  useEffect(() => {
    if (globalDateFilter.custom_end_date !== "") {
      reFetchAPI();
    } else {
      const today = new Date();
      const endDate = new Date(today);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29); // last 30 days including today

      const formatDate = (date) => date.toISOString().slice(0, 10);

      setGlobalDateFilter({
        custom_start_date: formatDate(startDate),
        custom_end_date: formatDate(endDate),
        date_filter: "custom",
      });
    }
  }, [globalDateFilter, globalAdvanceFilter, selectedMainProject]);

  const handleOpenDayDialog = () => {
    setIsDialogDayOpen(true);
  };

  const handleCloseDayDialog = () => {
    setIsDialogDayOpen(false);
  };

  const openDialogMainProjectFilterDialog = () => {
    setIsDialogMainProjectOpen(true);
  };

  const changeSelectedMainProject = (event, newValue) => {
    if (newValue !== null) {
      setSelectedMainProject(newValue);
    }
  };

  const handleChangeGlobalDateFilterChange = (reqBody) => {
    setGlobalDateFilter(reqBody);
  };

  const handleChangeMainProjectAdvanceFilter = (reqBody) => {
    setGlobalAdvanceFilter(reqBody);
  };

  const reFetchAPI = async () => {
    setIsLoading(true);
    setOverviewData([]);
    setIssuesData([]);
    setTopicsData([]);
    setKolData([]);
    setMentionData([]);
    setReachData([]);
    setPositiveSentimentData([]);
    setNegativeSentimentData([]);
    setSentimentBreakdownData([]);
    setChannelShareData([]);
    const mainReq = generateReqBody(globalDateFilter, {
      ...globalAdvanceFilter,
      project_name: selectedMainProject,
    });

    const secondaryDateFilter = getPreviousDateRange(globalDateFilter);
    const secondaryReq = generateReqBody(secondaryDateFilter, {
      ...globalAdvanceFilter,
      project_name: selectedMainProject,
    });

    await Promise.all([
      getOverviewData(mainReq),
      getMostViralIssuesData(mainReq),
      getMostViralTopicsData(mainReq),
      getKolToWatchData(mainReq),
      getContextOfDiscussionData(mainReq),
      getMentionReachSentimentData(mainReq),
      getSentimentBreakdownData(mainReq),
      getOverviewData(secondaryReq),
      getMostViralIssuesData(secondaryReq),
      getMostViralTopicsData(secondaryReq),
      getKolToWatchData(secondaryReq),
      getContextOfDiscussionData(secondaryReq),
      getMentionReachSentimentData(secondaryReq),
      getSentimentBreakdownData(secondaryReq),
    ]).then(() => {
      setIsLoading(false);
      setIsFirstLoading(false);
      props.handleChangeLoadingMain(false);
    });
  };

  const getOverviewData = async (projectData) => {
    try {
      const resp = await getAnalysisOverview(projectData);
      setOverviewData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp,
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
        },
      ]);
      console.log(overviewData);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getMostViralIssuesData = async (projectData) => {
    try {
      const resp = await getTopicToWatch(projectData);
      setIssuesData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.slice(0, 3),
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getMostViralTopicsData = async (projectData) => {
    try {
      const resp = await getTopicToWatch(projectData);
      setTopicsData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.slice(0, 3),
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getKolToWatchData = async (projectData) => {
    try {
      const resp = await getKolToWatch(projectData);
      const sortedResp = resp.sort((a, b) => (b.most_viral || 0) - (a.most_viral || 0));
      setKolData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: sortedResp.slice(0, 3),
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getContextOfDiscussionData = async (projectData) => {
    try {
      const resp = await getContext(projectData);
      setContextData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          data: resp.data,
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getMentionReachSentimentData = async (projectData) => {
    try {
      const resp = await getKeywordTrends(projectData);
      setMentionData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
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
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
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
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
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
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
          data: resp.map((value) => ({
            date: value.post_date,
            data: value.total_negative,
          })),
        },
      ]);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getSentimentBreakdownData = async (projectData) => {
    try {
      const resp = await getMentionSentimentBreakdown(projectData);
      setSentimentBreakdownData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
          data: resp?.sentiment_breakdown,
        },
      ]);
      setChannelShareData((prev) => [
        ...prev,
        {
          project_name: projectData.project_name,
          project_start: projectData.custom_start_date,
          project_end: projectData.custom_end_date,
          data: resp?.mentions_by_category?.categories,
        },
      ]);
    } catch (error) {
      console.log("error", error);
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
    }
  };

  const getListPeriods = () => {
    if (globalDateFilter.custom_start_date !== "") {
      const previousPeriod = getPreviousDateRange(globalDateFilter);
      return [
        globalDateFilter.custom_start_date,
        previousPeriod.custom_start_date,
      ];
    } else {
      return [];
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

  function getKeywordsByName(dataArray, name) {
    const item = dataArray.find((obj) => obj.name === name);
    return item ? item.keywords : [];
  }

  function getPreviousDateRange({
    custom_start_date,
    custom_end_date,
    date_filter,
  }) {
    const startDate = new Date(custom_start_date);
    const endDate = new Date(custom_end_date);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const previous_end_date = new Date(startDate);
    previous_end_date.setDate(previous_end_date.getDate() - 1);

    const previous_start_date = new Date(previous_end_date);
    previous_start_date.setDate(previous_start_date.getDate() - diffDays + 1);

    const formatDate = (date) => date.toISOString().slice(0, 10);

    return {
      custom_start_date: formatDate(previous_start_date),
      custom_end_date: formatDate(previous_end_date),
      date_filter: date_filter,
    };
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
              <CustomText CustomText bold="semibold" size="lgs" inline>
                VS
              </CustomText>
              <CustomButton
                sx={{ padding: "8px 16px" }}
                variant="outlined"
                endDecorator={<CalendarTodayIcon />}
              >
                <CustomText bold="semibold" size="xls" inline>
                  Previous Period
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
            {isLoading ? (
              <>
                <LoadingUI />
              </>
            ) : (
              <>
                <OverviewView
                  data={overviewData}
                  listProject={getListPeriods()}
                />

                {/* <MostViralIssuesView
                  data={issuesData}
                  listProject={getListPeriods()}
                  listKeywords={listKeywords}
                /> */}
                <MostViralTopicsView
                  data={topicsData}
                  listProject={getListPeriods()}
                  listKeywords={listKeywords}
                />

                <KolToWatchView
                  data={kolData}
                  listProject={getListPeriods()}
                  listKeywords={listKeywords}
                />

                <ContextOfDiscussionView
                  data={contextData}
                  listProject={getListPeriods()}
                  listKeywords={listKeywords}
                />

                <div className="comparison-compare-projects-box">
                   <CustomText bold="semibold" size="mds" inLine>
     Mentions
      <br></br>
     </CustomText>
                  <GraphChart
                    data={mentionData}
                    listProject={getListPeriods()}
                  />
                </div>

                <div className="comparison-compare-projects-box">
                     <CustomText bold="semibold" size="mds" inLine>
      Reach
      <br></br>
     </CustomText>
                  <GraphChart data={reachData} listProject={getListPeriods()} />
                </div>

                <div className="comparison-compare-projects-box">
                     <CustomText bold="semibold" size="mds" inLine>
     Positive Sentiment :)
      <br></br>
     </CustomText>
                  <GraphChart
                    data={positiveSentimentData}
                    listProject={getListPeriods()}
                  />
                </div>

                <div className="comparison-compare-projects-box">
                 <CustomText bold="semibold" size="mds" inLine>
      Negative Sentiment :(
      <br></br>
     </CustomText>
                  <GraphChart
                    data={negativeSentimentData}
                    listProject={getListPeriods()}
                  />
                </div>

                <div className="comparison-compare-projects-box-kol">
                  <div
                    className="comparison-compare-projects-box"
                    style={{ flex: 1 }}
                  >
                    <CustomText bold="semibold" size="mds" inLine>
      Sentiment breakdown
      <br></br>
     </CustomText>
                    <div>
                      <SentimentStackedChart
                        data={sentimentBreakdownData}
                        listProject={getListPeriods()}
                      />
                    </div>
                  </div>
                  <div
                    className="comparison-compare-projects-box"
                    style={{ flex: 1 }}
                  >
               <CustomText bold="semibold" size="mds" inLine>
      Channels share
      <br></br>
     </CustomText>
                    <div>
                      <PlatformBreakdownChart
                        data={channelsShareData}
                        listProject={getListPeriods()}
                      />
                    </div>
                  </div>
                </div>
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
        handleChangeFilter={handleChangeMainProjectAdvanceFilter}
      />
    </>
  );
};
const OverviewView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_start");
  const columnCount = (filterData.length === 1 ? 2 : filterData.length) + 1;
  const columnWidth = `${100 / columnCount}%`;

  const colorVariable = ["#2E90FA", "#84CAFF"];

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
                <div>{value.project_name}</div>
                <CustomText color="b500" size="2xls" bold="medium">
                  (
                  {formatDateRange({
                    custom_start_date: value.project_start,
                    custom_end_date: value.project_end,
                  })}
                  )
                </CustomText>
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
  const filterData = filterAndDeduplicate(data, listProject, "project_start");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#84CAFF"];
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
                <CustomText bold="semibold" size="2xls" inLine>
                  {value.project_name}
                </CustomText>
                <CustomText color="b500" size="2xls" bold="medium" inline>
                  (
                  {formatDateRange({
                    custom_start_date: value.project_start,
                    custom_end_date: value.project_end,
                  })}
                  )
                </CustomText>
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

const MostViralTopicsView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_start");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#84CAFF"];
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
   
              <CustomText bold="semibold" size="mds" inLine>
                Most viral topics 🔥
                <br></br>
              </CustomText>  
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
              <CustomText color="b500" size="2xls" bold="medium" inline>
                (
                {formatDateRange({
                  custom_start_date: value.project_start,
                  custom_end_date: value.project_end,
                })}
                )
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
  const filterData = filterAndDeduplicate(data, listProject, "project_start");
  const listKeywords = props.listKeywords;
  const colorVariable = ["#2E90FA", "#84CAFF"];
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
     
    <CustomText bold="semibold" size="mds" inLine>
      KOL to watch
      <br></br>
     </CustomText>  
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
              <CustomText color="b500" size="2xls" bold="medium" inline>
                (
                {formatDateRange({
                  custom_start_date: value.project_start,
                  custom_end_date: value.project_end,
                })}
                )
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
const ContextOfDiscussionView = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_start");
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
    
    <CustomText bold="semibold" size="mds" inLine>
      Context of discussion
      <br></br>
     </CustomText>
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
              <CustomText color="b500" size="2xls" bold="medium" inline>
                (
                {formatDateRange({
                  custom_start_date: value.project_start,
                  custom_end_date: value.project_end,
                })}
                )
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
  const filterData = filterAndDeduplicate(data, listProject, "project_start");
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
    colors: ["#2E90FA", "#84CAFF"],
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
  const series = [];

  if (filterData[0]) {
    // Current period (normal)
    series.push({
      name: filterData[0].project_name,
      data: filterData[0].data.map((item) => ({
        x: new Date(item.date).toISOString(),
        y: item.data,
      })),
    });
  }

  if (filterData[1] && filterData[0]) {
    const prevRangeLabel = "Previous Period";

    const alignedPrevData = filterData[0].data.map((item, index) => ({
      x: new Date(item.date).toISOString(), // Use current period dates
      y: filterData[1].data[index]?.data ?? null, // Use previous period values
    }));

    series.push({
      name: prevRangeLabel,
      data: alignedPrevData,
    });
  }

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

const SentimentStackedChart = (props) => {
  const data = props.data;
  const listProject = props.listProject;
  const filterData = filterAndDeduplicate(data, listProject, "project_start");

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
      categories: filterData.map(
        (value, index) =>
          `${value.project_name}-${index === 0 ? "(current)" : "(previous)"}`
      ),
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
  const filterData = filterAndDeduplicate(data, listProject, "project_start");

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
      categories: filterData.map(
        (value, index) =>
          `${value.project_name}-${index === 0 ? "(current)" : "(previous)"}`
      ),
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

const formatDateRange = ({ custom_start_date, custom_end_date }) => {
  const options = { day: "2-digit", month: "short", year: "numeric" };

  const start = new Date(custom_start_date);
  const end = new Date(custom_end_date);

  const startFormatted = start.toLocaleDateString("en-GB", options);
  const endFormatted = end.toLocaleDateString("en-GB", options);

  return `${startFormatted} until ${endFormatted}`;
};
export default ComparePeriods;
