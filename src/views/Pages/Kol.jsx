import CustomText from "../../components/CustomText";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import CustomButton from "../../components/CustomButton";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { ArrowOutward } from "@mui/icons-material";
import CustomChip from "../../components/CustomChip";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import React, { useState, useEffect } from "react";
import "./styles/Kol.css";
import { getKolOverview } from "../../services/kolService";
import { formatNumber } from "../../helpers/utils";
import DialogDateFilter from "./components/DialogDateFilter";
import DialogFilter from "./components/DialogFilter";

import { useSelector } from "react-redux";
import LoadingUI from "./components/LoadingUI";
import { enqueueSnackbar } from "notistack";
import NoDataUI from "./components/NoDataUI";
import { useParams } from "react-router-dom";
import { Pagination } from "@mui/material";
import { useDidUpdateEffect } from "../../helpers/loadState";

const Kol = () => {
  const tabList = ["All", "Individual", "Brand/Media"];
  const { keyword } = useParams();
  const [activeTab, setActiveTab] = useState("All");
  const [imageErrors, setImageErrors] = useState({});

  const [kolData, setKolData] = useState([]);
  const [filterData, setFilterData] = useState([]);

  const [firstLoading, setFirstLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  const userData = useSelector((state) => state.user);

  const [dataReqBody, setDataReqBody] = useState({
    owner_id: `${activeKeywords.owner_id}`,
    project_name: activeKeywords.name,
    channels: [],
  });

  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});
  const [dataDateFilter, setDataDateFilter] = useState({});

  const [kolPage, setKolPage] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1000,
    total_posts: 10000,
  });

  useEffect(() => {
    getKolData();
  }, []);

  useDidUpdateEffect(() => {
    setFirstLoading(true);
    setIsLoading(true);
    getKolData();
  }, [keyword]);

  useDidUpdateEffect(() => {
    setIsLoading(true);
    getKolData();
  }, [dataAdvanceFilter, dataDateFilter, kolPage]);

  const handleResetFilter = () => {
    handleOnChangeTab(() => {}, "All");
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
  const getKolData = async () => {
    try {
      const resp = await getKolOverview({
        ...generateReqBody(),
        page: kolPage.page,
        page_size: 10,
      });
      setKolData(resp);
      setFilterData(resp);
      setFirstLoading(false);
      setIsLoading(false);
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
      setFirstLoading(false);
      setIsLoading(false);
    }
  };

  const handleChangeKolPage = (event, value) => {
    setKolPage({
      ...kolPage,
      page: value,
    });
  };

  const handleOnChangeTab = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === "All") {
      sortByAll();
    } else if (newValue === "Individual") {
      sortByIndividual();
    } else {
      sortByBrandMedia();
    }
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

  const sortByIndividual = () => {
    const newData = [...kolData].filter(
      (value) =>
        value.user_category !== "News Account" &&
        value.user_category !== "Influencer"
    );
    setFilterData(newData);
  };

  const sortByBrandMedia = () => {
    const newData = [...kolData].filter(
      (value) =>
        value.user_category === "News Account" ||
        value.user_category === "Influencer"
    );
    setFilterData(newData);
  };

  const sortByAll = () => {
    setFilterData(kolData);
  };

  const handleChangeAdvanceFilter = (reqBody) => {
    setKolPage({
      ...kolPage,
      page: 1,
    });
    setDataAdvanceFilter(reqBody);
  };

  const handleChangeDateFilter = (reqBody) => {
    setKolPage({
      ...kolPage,
      page: 1,
    });
    setDataDateFilter(reqBody);
  };

  return (
    <>
      <div className="kol-header-container">
        <CustomText color="b900" size="lgs" bold="semibold">
          Key Opinion Leader (KOL)
        </CustomText>
        {firstLoading ? (
          <>
            <div className="kol-loader-top skeleton-loader"></div>
          </>
        ) : (
          <>
            <div className="kol-header-filter-container">
              <Tabs
                aria-label="tabs"
                defaultValue={0}
                sx={{
                  bgcolor: "transparent",
                  margin: "15px 0px",
                  width: "fit-content",
                }}
                value={activeTab}
                onChange={handleOnChangeTab}
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
                  {tabList?.map((value, index) => (
                    <Tab
                      key={`tab-tabs-${index}`}
                      disableIndicator
                      sx={{ width: "fit-content", height: "36px" }}
                      value={value}
                    >
                      <CustomText>{value}</CustomText>
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
              <div className="kol-header-right">
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
            </div>
          </>
        )}
      </div>
      <div className="kol-main">
        {firstLoading ? (
          <>
            <div className="kol-loader-content skeleton-loader"></div>
          </>
        ) : (
          <>
            {isLoading ? (
              <>
                <LoadingUI />
              </>
            ) : (
              <>
                {filterData.length > 0 ? (
                  <>
                    <div className="kol-container">
                      <table className="kol-table-container">
                        <thead className="kol-table-header-container">
                          <tr>
                            <th className="">
                              <CustomText
                                bold="semibold"
                                color="b500"
                                size="sss"
                              >
                                Profile name
                              </CustomText>
                            </th>
                            <th className="">
                              <div className="kol-table-header-item">
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                  inline
                                >
                                  Mentions
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="">
                              <div className="kol-table-header-item">
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                >
                                  Reach
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="">
                              <div className="kol-table-header-item">
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                >
                                  Followers
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="">
                              <div className="kol-table-header-item">
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                >
                                  Share of Voice
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="">
                              <div
                                className="kol-table-header-item"
                                style={{ justifyContent: "flex-start" }}
                              >
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                >
                                  Actively discussing
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="kol-table-header-sentiment">
                              <div
                                className="kol-table-header-item"
                                style={{ justifyContent: "flex-start" }}
                              >
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                >
                                  Sentiments
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th className="">
                              <div className="kol-table-header-item">
                                <CustomText
                                  bold="semibold"
                                  color="b500"
                                  size="sss"
                                >
                                  Influence Score
                                </CustomText>
                                <Tooltip title="Add" placement="top">
                                  <HelpOutline
                                    sx={{ color: "#A4A7AE", width: "15px" }}
                                  ></HelpOutline>
                                </Tooltip>
                              </div>
                            </th>
                            <th> </th>
                          </tr>
                        </thead>
                        <tbody className="kol-body-container">
                          {filterData?.map((item, idx) => (
                            <tr key={idx} className="">
                              <td>
                                <CustomText
                                  color="b900"
                                  bold="medium"
                                  size="sss"
                                  inline
                                >
                                  <ProfileName
                                    kol={item}
                                    imageErrors={imageErrors}
                                    setImageErrors={setImageErrors}
                                  />
                                </CustomText>
                              </td>
                              <td>
                                <div className="kol-flex-item">
                                  <CustomText
                                    color="brand"
                                    size="sss"
                                    bold="medium"
                                    inline
                                  >
                                    {formatNumber(item.link_post)}
                                  </CustomText>
                                  <ArrowOutward
                                    sx={{
                                      width: "20px",
                                      height: "20px",
                                      color: "#0047AB",
                                    }}
                                  />
                                </div>
                              </td>
                              <td>
                                <CustomText
                                  color="b900"
                                  bold="medium"
                                  size="2xls"
                                  inline
                                >
                                  {formatNumber(item.reach_score?.toFixed(2))}
                                </CustomText>
                              </td>
                              <td>
                                <CustomText
                                  color="b900"
                                  bold="medium"
                                  size="2xls"
                                  inline
                                >
                                  {formatNumber(item.user_followers)}
                                </CustomText>
                              </td>
                              <td>
                                <CustomText
                                  color="b900"
                                  bold="medium"
                                  size="2xls"
                                  inline
                                >
                                  {formatNumber(
                                    item.share_of_voice?.toFixed(2)
                                  )}
                                </CustomText>
                              </td>
                              <td style={{ textAlign: "left" }}>
                                <CustomText
                                  color="brand"
                                  bold="medium"
                                  size="sss"
                                  inline
                                >
                                  {item.unified_issue?.map((value, index) => (
                                    <>{`${value} ${
                                      index === item.unified_issue.length
                                        ? ","
                                        : ""
                                    }`}</>
                                  ))}
                                </CustomText>
                              </td>
                              <td>
                                <div>{sentiment(item)}</div>
                              </td>
                              <td>
                                {influenceShare(
                                  item.user_influence_score?.toFixed(2)
                                )}
                              </td>
                              <td>
                                <img
                                  className="kol-trash-icon"
                                  src={window.location.origin + "/trash-01.svg"}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="dashboard-pagination">
                        <Pagination
                          count={kolPage.total_pages}
                          page={kolPage.page}
                          onChange={handleChangeKolPage}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="kol-empty-loading-container">
                      {/* <EmptyState resetFilter={handleResetFilter} /> */}
                      <NoDataUI />
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

export default Kol;

const ProfileName = ({ kol, imageErrors, setImageErrors }) => {
  const openLink = () => {
    let link = kol.link_user;

    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link;
    }
    if (!/^https?:\/\/(www\.)?/i.test(link)) {
      link = link.replace(/^https?:\/\//i, "https://www.");
    }

    window.open(link, "_blank")?.focus();
  };

  const fallbackUrl = `${window.location.origin}/${kol.channel}.png`;
  const isErrored = imageErrors[kol.user_image_url];

  const handleImgError = () => {
    setImageErrors((prev) => ({ ...prev, [kol.user_image_url]: true }));
  };

  return (
    <div className="kol-profile-name-container">
      <img
        className="kol-profile-name-icon"
        src={isErrored ? fallbackUrl : kol.user_image_url}
        onError={handleImgError}
        alt="User profile"
      />
      <CustomText color="b700" size="2xls" bold="medium" inline>
        {kol.username}
      </CustomText>
      <div className="kol-flex-item">
        <CustomText
          color="brand"
          size="2xls"
          bold="medium"
          onClick={openLink}
          pointer
          inline
        >
          {kol.channel}.com
        </CustomText>
        <ArrowOutward
          sx={{ width: "20px", height: "20px", color: "#0047AB" }}
        />
      </div>
      {kol.is_negative_driver && <CustomChip error>Negative Driver</CustomChip>}
      <div className="kol-profile-name-multi-chip">
        <CustomChip neutral isDownIcon>
          {kol.user_category}
        </CustomChip>
      </div>
    </div>
  );
};

const sentiment = (value) => {
  const total =
    value.sentiment_negative +
    value.sentiment_neutral +
    value.sentiment_positive;
  return (
    <div className="kol-sentiment">
      <div className="kol-sentiment-item">
        <div className="kol-sentiment-dot kol-sentiment-dot-green"></div>
        <CustomText bold="medium" size="2xls" color="g700" inline>
          {((value.sentiment_positive / total) * 100)?.toFixed(2)}% positive
        </CustomText>
      </div>
      <div className="kol-sentiment-item">
        <div className="kol-sentiment-dot kol-sentiment-dot-red"></div>
        <CustomText bold="medium" size="2xls" color="r700" inline>
          {((value.sentiment_negative / total) * 100)?.toFixed(2)}% negative
        </CustomText>
      </div>
      <div className="kol-sentiment-item">
        <div className="kol-sentiment-dot kol-sentiment-dot-grey"></div>
        <CustomText bold="medium" size="2xls" color="b600" inline>
          {((value.sentiment_neutral / total) * 100)?.toFixed(2)}% neutral
        </CustomText>
      </div>
    </div>
  );
};

const influenceShare = (share) => {
  return (
    <div className="kol-share-container">
      <div className="kol-share-chart-container">
        <div className="kol-share-chart" style={{ width: `${share}%` }}></div>
      </div>
      <CustomText>{share}%</CustomText>
    </div>
  );
};
