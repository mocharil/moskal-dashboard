import TopicsTable from "./components/TopicsTable";
import CustomText from "../../components/CustomText";
import CustomButton from "../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { ArrowBackIos } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import TopicsDetail from "./components/TopicsDetail";
import DialogDateFilter from "./components/DialogDateFilter";
import DialogFilter from "./components/DialogFilter";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import "./styles/Topic.css";
import { getTopicToWatch } from "../../services/topicService";
import { addTopics } from "../../helpers/redux/slice/topicSlice";
import LoadingUI from "./components/LoadingUI";
import NoDataUI from "./components/NoDataUI";
import { enqueueSnackbar } from "notistack";
import { useDidUpdateEffect } from "../../helpers/loadState";

const Topics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { keyword } = useParams();
  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);
  const [topicsData, setTopicsData] = useState([]);
  const [isLoadingFirst, setIsLoadingFirst] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTopic, setIsLoadingTopic] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    getTopicData();
  }, []);

  useDidUpdateEffect(() => {
    setIsLoadingFirst(true);
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page on keyword change
    getTopicData();
  }, [keyword]);

  useDidUpdateEffect(() => {
    if (isLoadingDone()) {
      setIsLoadingFirst(false);
      setIsLoading(false);
    }
  }, [topicsData]);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page on filter change
    getTopicData();
  }, [dataAdvanceFilter, dataDateFilter]);

  const getTopicData = async () => {
    setIsLoadingTopic(true);
    try {
      const resp = await getTopicToWatch(generateReqBody());
      if (resp) {
        setTopicsData(resp);
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
  const isLoadingDone = () => {
    return !isLoadingTopic;
  };

  const handleDetailClick = (data) => {
    dispatch(
      addTopics({
        topics: data,
        expiresInDays: 30,
      })
    );
    navigate(`/${keyword}/topics-detail`, { replace: true });
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

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const isNoDataUIShow = () => {
    if (!isLoading) {
      return topicsData.length === 0;
    } else {
      return false;
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTopics = topicsData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(topicsData.length / itemsPerPage);

  return (
    <>
      <div className="topics-search-bar-container">
        <div className="topics-search-bar">
          <CustomText color="b900" size="lgs" bold="semibold" inline>
            Topic analysis: {activeKeywords.name}
          </CustomText>
          {!isLoadingFirst && (
            <div className="topic-search-bar-button-container">
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
          )}
        </div>
        {isLoadingFirst && (
          <>
            <div className="topics-search-loading skeleton-loader"></div>
          </>
        )}
      </div>

      <div className="topics-content-container">
        {isLoadingFirst ? (
          <>
            <div className="topics-loading-content-1 skeleton-loader"></div>
            <div className="topics-loading-content-2 skeleton-loader"></div>
          </>
        ) : isLoading ? (
          <>
            <LoadingUI />
          </>
        ) : isNoDataUIShow() ? (
          <>
            <NoDataUI text="No ongoing topics yet. Data will be displayed here once topics are compiled." />
          </>
        ) : (
          <>
            <TopicsTable
              data={currentTopics}
              handleDetailClick={handleDetailClick}
            />
            {totalPages > 1 && (
              <Stack spacing={2} sx={{ marginTop: 2, alignItems: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Stack>
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

export default Topics;
