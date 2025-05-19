import React, { useState, useEffect } from "react";
import CustomContentBox from "../../../components/CustomContentBox";
import CustomText from "../../../components/CustomText";
import MentionComponent from "./MentionComponent";
import ContextComponent from "./ContextComponent";
import KolComponent from "./KolComponent";
import Occurrences from "./Occurrences";
import EmotionShare from "./EmotionShare";
import OverallSentiment from "./OverallSentiment";
import TopicShare from "./TopicShare";
import Channels from "./Channels";
import IntentShare from "./IntentShare";
import "./styles/TopicsDetail.css";
import { useSelector } from "react-redux";
import CustomButton from "../../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { ArrowBackIos } from "@mui/icons-material";
import DialogDateFilter from "./DialogDateFilter";
import DialogFilter from "./DialogFilter";
import { formatNumber, getLimitArray } from "../../../helpers/utils";
import {
  getContext,
  getMentions,
  getKolToWatch,
  getIntentEmotionRegion,
  getKeywordTrends,
  getMentionSentimentBreakdown,
  getTopicToWatch,
  getTextSentimentData,
} from "../../../services/topicService";
import { useNavigate, useParams } from "react-router-dom";
import NoDataUI from "./NoDataUI";
import { useDidUpdateEffect } from "../../../helpers/loadState";
import LoadingUI from "./LoadingUI";
import { enqueueSnackbar } from "notistack";

const TopicsDetail = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const topicsData = useSelector((state) => state.topics);

  const [isLoadingFirst, setIsLoadingFirst] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [mentionData, setMentionData] = useState([]);
  const [kolData, setKolData] = useState([]);
  const [contextData, setContextData] = useState([]);
  const [occurrencesData, setOccurrencesData] = useState([]);
  const [emotionShareData, setEmotionShareData] = useState([]);
  const [intentShareData, setIntentShareData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [channelShareData, setChannelShareData] = useState([]);
  const [sentimentData, setSentimentData] = useState({});
  const [listTopicsData, setListTopicsData] = useState([]);

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);

  const [isLoadingMentions, setIsLoadingMentions] = useState(true);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isLoadingKol, setIsLoadingKol] = useState(true);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(true);
  const [isLoadingChannelShare, setIsLoadingChannelShare] = useState(true);
  const [isLoadingIntentEmotionRegion, setIsLoadingIntentEmotionRegion] =
    useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);

  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});
  const [dataDateFilter, setDataDateFilter] = useState({});

  const [isLoadingTextSentiment, setIsLoadingTextSentiment] = useState(true);
  const [textSentimentData, setTextSentimentData] = useState({});

  const [dataReqBody, setDataReqBody] = useState({
    // keywords: activeKeywords.keywords,
    owner_id: `${activeKeywords.owner_id}`,
    project_name: activeKeywords.name,
    channels: [],
    keywords: [...topicsData.list_issue],
  });

  useEffect(() => {
    getMentionsData();
    getContextData();
    getKOLData();
    getOccurrencesData();
    getChannelShareData();
    getIntentEmotionRegionData();
    getTopicsShareData(); // Restored
    getTextSentiment();
  }, []);

  useEffect(() => {
    if (isDataComplete()) {
      setIsLoading(false);
      setIsLoadingFirst(false);
    }
  }, [
    isLoadingMentions,
    isLoadingContext,
    isLoadingKol,
    isLoadingOccurrences,
    isLoadingChannelShare,
    isLoadingIntentEmotionRegion,
    isLoadingTopics, // Restored
    isLoadingTextSentiment,
  ]);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    getMentionsData();
    getContextData();
    getKOLData();
    getOccurrencesData();
    getChannelShareData();
    getIntentEmotionRegionData();
    getTopicsShareData(); // Restored
    getTextSentiment();
  }, [dataAdvanceFilter, dataDateFilter]);

  const isDataComplete = () => {
    return (
      !isLoadingMentions &&
      !isLoadingContext &&
      !isLoadingKol &&
      !isLoadingOccurrences &&
      !isLoadingChannelShare &&
      !isLoadingIntentEmotionRegion &&
      !isLoadingTopics && // Restored
      !isLoadingTextSentiment
    );
  };

  const getMentionsData = async () => {
    setIsLoadingMentions(true);
    try {
      const resp = await getMentions(generateReqBody());
      setIsLoadingMentions(false);
      if (resp.data) {
        setMentionData(getLimitArray(resp.data));
      }
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingMentions(false);
    }
  };

  const getContextData = async () => {
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

  const getKOLData = async () => {
    setIsLoadingKol(true);
    try {
      const resp = await getKolToWatch(generateReqBody());
      if (resp) {
        setKolData(getLimitArray(resp));
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

  const getIntentEmotionRegionData = async () => {
    setIsLoadingIntentEmotionRegion(true);
    try {
      const resp = await getIntentEmotionRegion(generateReqBody());
      setEmotionShareData(resp.emotions_share);
      setIntentShareData(resp.intents_share);
      setRegionData(getLimitArray(resp.regions_share));
      setIsLoadingIntentEmotionRegion(false);
    } catch (error) {
      console.log(error);
      setIsLoadingIntentEmotionRegion(false);
    }
  };

  const getOccurrencesData = async () => {
    setIsLoadingOccurrences(true);
    try {
      const resp = await getKeywordTrends(generateReqBody());
      setOccurrencesData(resp);
      setIsLoadingOccurrences(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingOccurrences(false);
    }
  };

  const getChannelShareData = async () => {
    setIsLoadingChannelShare(true);
    try {
      const resp = await getMentionSentimentBreakdown(generateReqBody());
      setChannelShareData(resp?.mentions_by_category?.categories);
      setSentimentData(resp?.sentiment_breakdown);
      setIsLoadingChannelShare(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingChannelShare(false);
    }
  };

  const getTopicsShareData = async () => { // Restored
    setIsLoadingTopics(true);
    try {
      const resp = await getTopicToWatch(generateReqBody(true)); // Pass true to use activeKeywords.keywords
      if (resp) {
        setListTopicsData(resp);
      }
      setIsLoadingTopics(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingTopics(false);
    }
  };

  const getTextSentiment = async () => {
    setIsLoadingTextSentiment(true);
    try {
      const resp = await getTextSentimentData(generateReqBody());
      setTextSentimentData(resp);
      console.log(resp);
      setIsLoadingTextSentiment(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setIsLoadingTextSentiment(false);
    }
  };

  const getTotal = () => {
    return topicsData.positive + topicsData.negative + topicsData.neutral;
  };

  const getPositive = () => {
    return ((topicsData.positive / getTotal()) * 100).toFixed(2);
  };

  const getNegative = () => {
    return ((topicsData.negative / getTotal()) * 100).toFixed(2);
  };

  const getNeutral = () => {
    return ((topicsData.neutral / getTotal()) * 100).toFixed(2);
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

  const redirectToKOL = () => {
    navigate(`/${keyword}/topics`, { replace: true });
  };

  const handleChangeAdvanceFilter = (reqBody) => {
    setDataAdvanceFilter(reqBody);
  };

  const handleChangeDateFilter = (reqBody) => {
    setDataDateFilter(reqBody);
  };

  const isDataEmpty = () => {
    return (
      mentionData.length === 0 &&
      kolData.length === 0 &&
      contextData.length === 0 &&
      occurrencesData.length === 0 &&
      emotionShareData.length === 0 &&
      intentShareData.length === 0 &&
      regionData.length === 0 &&
      channelShareData.length === 0 &&
      listTopicsData.length === 0 // Restored
    );
  };

  const generateReqBody = (useActiveKeywordsAsDefault = false) => {
    const defaultKeywords = useActiveKeywordsAsDefault
      ? activeKeywords.keywords
      : [...topicsData.list_issue];

    const data = {
      keywords:
        dataAdvanceFilter?.keywords?.length > 0
          ? dataAdvanceFilter?.keywords
          : defaultKeywords,
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

  return (
    <>
      <div className="topics-search-bar-additional">
        <CustomText color="b900" size="lgs" bold="semibold" inline>
          Topic analysis: {activeKeywords.name}
        </CustomText>
      </div>

      <div className="topics-search-bar-2">
        {isLoadingFirst ? (
          <>
            <div className="topics-search-loading skeleton-loader"></div>
          </>
        ) : (
          <>
            <div className="topics-search-bar-back">
              <ArrowBackIos sx={{ width: "20px", color: "#0047AB" }} />
              <CustomText
                color="brand"
                size="xls"
                bold="semibold"
                inline
                pointer
                onClick={redirectToKOL}
              >
                Back to Overview
              </CustomText>
            </div>
            <div className="topic-search-bar-button-container">
              <CustomButton
                variant="outlined"
                endDecorator={<CalendarTodayIcon />}
                onClick={handleOpenDayDialog}
              >
                Last 30 days
              </CustomButton>

              <CustomButton
                endDecorator={<FilterAltIcon />}
                onClick={handleOpenFilterDialog}
              >
                Advance Filter
              </CustomButton>
            </div>
          </>
        )}
      </div>
      <div className="topics-content-container">
        {isLoadingFirst ? (
          <>
            <div className="topics-loading-content-1 skeleton-loader"></div>
            <div className="topics-loading-content-2 skeleton-loader"></div>
          </>
        ) : (
          <>
            {isDataEmpty() ? (
              <>
                <NoDataUI />
              </>
            ) : (
              <>
                {isLoading ? (
                  <LoadingUI />
                ) : (
                  <>
                    <div className="topic-detail-header-container">
                      <div className="topic-detail-header">
                        <CustomText
                          bold="semibold"
                          color="b900"
                          size="s"
                          inline
                        >
                          {topicsData.unified_issue}
                        </CustomText>
                        <div className="topics-component-stat-container">
                          <img
                            className="topics-component-bubble"
                            src={
                              window.location.origin + "/message-circle-02.svg"
                            }
                          />
                          <CustomText color="b600" size="sss" inline>
                            {formatNumber(topicsData.total_posts)} Mentions
                          </CustomText>
                          <div className="topics-component-bullet-grey"></div>
                          <div className="topics-component-bullet-gradient topics-gradient-green"></div>
                          <CustomText color="g700" size="sss" inline>
                            {getPositive()}% positive
                          </CustomText>
                          <div className="topics-component-bullet-grey"></div>
                          <div className="topics-component-bullet-gradient topics-gradient-red"></div>
                          <CustomText color="r700" size="sss" inline>
                            {getNegative()}% negative
                          </CustomText>
                          <div className="topics-component-bullet-grey"></div>
                          <div className="topics-component-bullet-gradient topics-gradient-gray"></div>
                          <CustomText color="b600" size="sss" inline>
                            {getNeutral()}% neutral
                          </CustomText>
                        </div>
                      </div>
                      <CustomText color="b600" size="mds">
                        {topicsData.description}
                      </CustomText>
                    </div>
                    <div>
                      <div className="topic-detail-flex-2">
                        <div className="topic-detail-flex-vertical">
                          <CustomContentBox
                            title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Top mentions</span>}
                            seeAll="See all mentions"
                            tooltip="Monitor the most impactful mentions driving the conversation. See which posts are gaining traction and influencing sentiment, sorted by engagement and platform reach."
                          >
                            <>
                              {mentionData?.map((value, index) => (
                                <MentionComponent
                                  key={`mention-${index}`}
                                  data={value}
                                  borderBottom={
                                    index + 1 !== mentionData.length
                                  }
                                />
                              ))}
                            </>
                          </CustomContentBox>
                        </div>
                        <div className="topic-detail-flex-vertical">
                          <CustomContentBox
                            title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Context of discussion</span>}
                            tooltip="Explore the context of discussions with a word cloud. See the most mentioned keywords, their frequency, and the sentiment behind each term to understand public narratives."
                          >
                            <ContextComponent data={contextData} />
                          </CustomContentBox>
                          <CustomContentBox
                            title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>KOL to watch</span>}
                            
                            seeAll="See all KOL"
                            handleSeeAll={redirectToKOL}
                            tooltip="Track key opinion leaders (KOLs) driving online conversations. See who's shaping narratives, their influence level, and the topics they're actively discussing."
                          >
                            {kolData?.map((value, index) => (
                              <KolComponent
                                key={`kol-${index}`}
                                data={value}
                                borderBottom={index + 1 !== kolData.length}
                              />
                            ))}
                          </CustomContentBox>
                        </div>
                      </div>
                      <div className="topic-detail-flex-2">
                        <CustomContentBox
                          title="Occurrences"
                          tooltip="Visualize how mentions fluctuate overtime. Spot conversation spikes, correlate them with key events, and identify momentum shifts in public interest."
                        >
                          <Occurrences data={occurrencesData} />
                        </CustomContentBox>
                        <CustomContentBox
                          title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Channel share</span>}
                          tooltip="See where conversations are happening. Compare platform activity to understand where your topic resonates most and tailor your outreach strategy."
                        >
                          <Channels data={channelShareData} />
                        </CustomContentBox>
                      </div>
                      <div className="topic-detail-flex-2">
                        <CustomContentBox
                          title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Intent Share</span>} 
                          tooltip="Understand why people are talking about this topic. Analyze conversation intent-whether it's informational, advocacy-driven or purely entertaining-to refine your messaging."
                        >
                          <IntentShare data={intentShareData} />
                        </CustomContentBox>
                        <CustomContentBox
                          title= {<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Emotions share</span>}
                          tooltip="Explore the emotional undertone of conversations. Track emotional distribution to uncover how people feel about he topic, beyond just positive or negative sentiment."
                        >
                          <EmotionShare data={emotionShareData} />
                        </CustomContentBox>
                      </div>
                      <div className="topic-detail-flex-2">
                        <CustomContentBox
                          title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Overall sentiments</span>}
                          tooltip="Get a complete view of public sentiment. See the percentage of positive, negative, and neutral mentions, alongside insights into the factors driving each sentiment."
                        >
                          <OverallSentiment
                            sentiment={sentimentData}
                            region={regionData}
                            textSentimentData={textSentimentData}
                          />
                        </CustomContentBox>
                        <CustomContentBox
                          title={<span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>Topics share</span>}
                          tooltip="Analyze topic prominence relative to other discussions. See how much of the conversation your topic captures, helping you gauge its share of public attention."
                        >
                          <TopicShare
                            data={(() => {
                              let displayTopics = listTopicsData.slice(0, 9);
                              const currentTopicUnifiedIssue = topicsData.unified_issue;
                              const currentTopicInDisplay = displayTopics.find(
                                (topic) => topic.unified_issue === currentTopicUnifiedIssue
                              );

                              if (!currentTopicInDisplay && currentTopicUnifiedIssue) {
                                const currentTopicData = {
                                  unified_issue: currentTopicUnifiedIssue,
                                  total_posts: topicsData.total_posts, // Assuming this is the correct value for the current topic's bar
                                  // Add any other properties TopicShare might expect, if necessary
                                };
                                if (displayTopics.length < 9) {
                                  displayTopics.push(currentTopicData);
                                } else {
                                  // Replace the last item if already 9, to make space for current topic
                                  // Or, if you want to always add it and potentially have 10 items:
                                  // displayTopics.pop(); // to keep it at 9 before adding
                                  // displayTopics.push(currentTopicData);
                                  // For now, let's ensure it's visible, potentially replacing the 9th if not already there
                                  // A better approach might be to ensure the top X includes current if it's not there.
                                  // For simplicity, if not in top 9, add it as 10th, or replace 9th if list is full.
                                  // Let's ensure it's added, making it up to 10 items.
                                  if (displayTopics.length === 9) { // if it was already 9, and current is not in it
                                     displayTopics.pop(); // remove last to make space
                                  }
                                  displayTopics.push(currentTopicData);
                                }
                              }
                              // Ensure we don't exceed 10 items, prioritizing the current topic
                              // This logic might need refinement based on exact display rules for >9 items + current
                              // A simple slice to 10 at the end if it grew beyond.
                              return displayTopics.slice(0,10);
                            })()}
                            currentTopicUnifiedIssue={topicsData.unified_issue}
                          />
                        </CustomContentBox>
                      </div>
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

export default TopicsDetail;
