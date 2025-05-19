import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import Checkbox from "@mui/joy/Checkbox";
import Tooltip from "@mui/joy/Tooltip";
import HelpOutline from "@mui/icons-material/HelpOutline";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";

import CustomText from "../../components/CustomText";
import CustomButton from "../../components/CustomButton";
import MentionComponent from "./components/MentionComponent";
import DialogFilter from "./components/DialogFilter";
import DialogDateFilter from "./components/DialogDateFilter";
import LoadingUI from "./components/LoadingUI";
import NoDataUI from "./components/NoDataUI";

import { getMentions } from "../../services/topicService";
import { useDidUpdateEffect } from "../../helpers/loadState";
import { enqueueSnackbar } from "notistack";

import "./styles/Mentions.css";
import "../Pages/styles/Dashboard.css"; // Reusing some dashboard styles

const Mentions = () => {
  const { keyword: keywordFromParams } = useParams(); // Renamed to avoid conflict
  const [searchBoxValue, setSearchBoxValue] = useState("");
  const [isSearchExactPhraseChecked, setIsSearchExactPhraseChecked] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent"); // "recent" or "popular"

  const [mentionData, setMentionData] = useState([]);
  const [isLoadingMentions, setIsLoadingMentions] = useState(true);
  const [mentionPage, setMentionPage] = useState({
    page: 1,
    page_size: 10,
    total_pages: 1,
    total_posts: 0,
  });

  const [isDialogDayOpen, setIsDialogDayOpen] = useState(false);
  const [isDialogFilterOpen, setIsDialogFilterOpen] = useState(false);

  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);
  // const userData = useSelector((state) => state.user); // If needed for API calls

  const [dataAdvanceFilter, setDataAdvanceFilter] = useState({});
  const [dataDateFilter, setDataDateFilter] = useState({});

  const initialLoadRef = useRef(true);

  const generateReqBody = () => {
    const data = {
      keywords: activeKeywords.keywords,
      search_keyword:
        dataAdvanceFilter.keywords !== undefined &&
        dataAdvanceFilter.keywords.length > 0
          ? dataAdvanceFilter.keywords
          : [],
      search_exact_phrases: dataAdvanceFilter?.search_exact_phrases || isSearchExactPhraseChecked,
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
        : 1000, // Assuming 1000, check if this should be 100
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
      sort_type: sortOrder,
      page: mentionPage.page,
      page_size: mentionPage.page_size,
    };
    return data;
  };

  const fetchMentionsData = async () => {
    if (!activeKeywords.name) {
      // Don't fetch if activeKeywords is not ready
      setIsLoadingMentions(false);
      return;
    }
    setIsLoadingMentions(true);
    try {
      const reqBody = generateReqBody();
      const resp = await getMentions(reqBody);
      if (resp.data) {
        setMentionData(resp.data);
        if (resp.pagination) {
          setMentionPage((prevState) => ({
            ...prevState,
            total_pages: resp.pagination.total_pages || 1,
            total_posts: resp.pagination.total_posts || 0,
          }));
        } else {
           setMentionPage((prevState) => ({
            ...prevState,
            total_pages: 1,
            total_posts: resp.data.length,
          }));
        }
      } else {
        setMentionData([]);
        setMentionPage((prevState) => ({
            ...prevState,
            total_pages: 1,
            total_posts: 0,
          }));
      }
    } catch (error) {
      enqueueSnackbar("Error fetching mentions: " + (error?.message || "Network Error"), {
        variant: "error",
      });
      console.error("Error fetching mentions:", error);
      setMentionData([]);
       setMentionPage((prevState) => ({
            ...prevState,
            total_pages: 1,
            total_posts: 0,
          }));
    } finally {
      setIsLoadingMentions(false);
    }
  };
  
  useEffect(() => {
    if (activeKeywords.name) { // Ensure activeKeywords is populated
        fetchMentionsData();
        initialLoadRef.current = false;
    }
  }, [activeKeywords.name]); // Depend on activeKeywords.name to ensure it's ready


  useDidUpdateEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMentionsData();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [
    keywordFromParams, // from react-router
    dataAdvanceFilter,
    dataDateFilter,
    sortOrder,
    mentionPage.page,
    isSearchExactPhraseChecked // Added this dependency
  ]);


  const handleOpenDayDialog = () => setIsDialogDayOpen(true);
  const handleCloseDayDialog = () => setIsDialogDayOpen(false);
  const handleOpenFilterDialog = () => setIsDialogFilterOpen(true);
  const handleCloseFilterDialog = () => setIsDialogFilterOpen(false);

  const handleChangeDateFilter = (newFilter) => {
    setDataDateFilter(newFilter);
    setMentionPage(prev => ({ ...prev, page: 1 }));
  };

  const handleChangeAdvanceFilter = (newFilter) => {
    // If keywords are coming from advanced filter, clear searchBoxValue
    if (newFilter.keywords && newFilter.keywords.length > 0) {
      setSearchBoxValue(""); 
    }
    setDataAdvanceFilter(newFilter);
    setMentionPage(prev => ({ ...prev, page: 1 }));
  };
  
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    const processedKeywords = (searchBoxValue || "")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    
    // When submitting search, update dataAdvanceFilter with new keywords
    // and ensure search_exact_phrases is also updated.
    setDataAdvanceFilter(prev => ({
        ...prev,
        keywords: processedKeywords,
        search_exact_phrases: isSearchExactPhraseChecked 
    }));
    setMentionPage(prev => ({ ...prev, page: 1 }));
  };

  const handleChangeMentionPage = (event, value) => {
    setMentionPage((prev) => ({ ...prev, page: value }));
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setMentionPage(prev => ({ ...prev, page: 1 }));
  };


  return (
    <div className="mentions-page-container"> {/* Changed class for page level */}
      <CustomText color="brand" bold="semibold" size="mds">
        Mentions for #{keywordFromParams}
      </CustomText>
      <div className="dashboard-search-container"> {/* Reusing dashboard class */}
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
          onSubmit={handleSubmitSearch}
        >
          <IconButton sx={{ p: "10px" }} aria-label="menu" type="submit">
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search mentions... use commas (,) for multiple keywords"
            value={searchBoxValue}
            onChange={(e) => setSearchBoxValue(e.target.value)}
          />
          <Tooltip title="Enter keywords to search within mentions. Use a comma to separate multiple keywords." placement="top">
            <HelpOutline sx={{ color: "#A4A7AE", width: "15px", marginRight: '5px' }} />
          </Tooltip>
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
      <div className="dashboard-checkbox-container"> {/* Reusing dashboard class */}
        <Checkbox
          checked={isSearchExactPhraseChecked}
          onChange={(e) => {
            setIsSearchExactPhraseChecked(e.target.checked);
            // Trigger search when checkbox changes if searchBoxValue has content
            if (searchBoxValue.trim()) {
                 setDataAdvanceFilter(prev => ({
                    ...prev,
                    search_exact_phrases: e.target.checked
                }));
            }
          }}
          label={<CustomText>Search exact phrase</CustomText>}
        />
      </div>

      <div className="mentions-controls">
        <div className="sort-buttons-container">
          <button
            className={`sort-button ${sortOrder === "recent" ? "active" : ""}`}
            onClick={() => handleSortChange("recent")}
          >
            Recent First
          </button>
          <button
            className={`sort-button ${sortOrder === "popular" ? "active" : ""}`}
            onClick={() => handleSortChange("popular")}
          >
            Popular First
          </button>
        </div>
      </div>

      {isLoadingMentions ? (
        <LoadingUI />
      ) : mentionData && mentionData.length > 0 ? (
        <div className="mentions-content-list">
          {mentionData.map((mention, index) => (
            <MentionComponent
              key={mention.id || `mention-${index}`} // Prefer a unique ID from data
              data={mention}
              borderBottom={index < mentionData.length - 1}
              isShowAction={true} // Assuming we always want "View Post"
            />
          ))}
          {mentionPage.total_pages > 1 && (
            <div className="dashboard-pagination"> {/* Reusing dashboard class */}
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
          )}
        </div>
      ) : (
        <NoDataUI message="No mentions found for the current filters." />
      )}

      <DialogDateFilter
        open={isDialogDayOpen}
        onClose={handleCloseDayDialog}
        handleChangeFilter={handleChangeDateFilter}
        currentFilters={dataDateFilter}
      />
      <DialogFilter
        open={isDialogFilterOpen}
        onClose={handleCloseFilterDialog}
        handleChangeFilter={handleChangeAdvanceFilter}
        currentFilters={dataAdvanceFilter}
      />
    </div>
  );
};

export default Mentions;
