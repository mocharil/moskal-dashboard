import { Autocomplete, TextField, Chip, Box, Fade } from "@mui/material";
import React, { useState, useEffect } from "react";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import "./styles/Onboard.css";
import CustomText from "../../components/CustomText";
import CustomButton from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  addKeywords,
  setActiveKeyword,
} from "../../helpers/redux/slice/keywordSlice";
import { getProjects, postOnboarding, getKeywordSuggestions } from "../../services/projectService";
import { useSnackbar } from "notistack";

const Onboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize navigation function
  const { enqueueSnackbar } = useSnackbar();
  const [projectName, setProjectName] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState("All language");

  useEffect(() => {
    // Check if we're coming from the sidebar
    const urlParams = new URLSearchParams(window.location.search);
    const fromSidebar = urlParams.get('from') === 'sidebar';
    
    // Only redirect to dashboard if not coming from sidebar
    if (!fromSidebar) {
      getProjectsData();
    }
  }, []);

  const getProjectsData = async () => {
    try {
      const project = await getProjects();
  
      if (
        project.accessible_projects.length > 0 ||
        project.owned_projects.length > 0
      ) {
        dispatch(
          addKeywords({
            keywords: [
              ...project.accessible_projects,
              ...project.owned_projects,
            ],
            days: 30,
          })
        );

        dispatch(
          setActiveKeyword({
            activeKeyword: project.owned_projects[0]
              ? project.owned_projects[0]
              : project.accessible_projects[0],
            days: 30,
          })
        );
        navigate(
          `/${
            project.owned_projects[0]
              ? project.owned_projects[0].name
              : project.accessible_projects[0].name
          }/dashboard`,
          { replace: true }
        );
      }
    } catch (error) {
      enqueueSnackbar("Network Error", {
        variant: "error",
      });
      console.log(error);
    }
  };

  const handleChangeLanguage = (event) => {
    setLanguage(event.target.value);
  };

  const fetchSuggestions = async (keyword) => {
    if (!keyword || keyword.trim() === "") return;
    
    setIsFetchingSuggestions(true);
    setSuggestions([]);
    
    try {
      const response = await getKeywordSuggestions(keyword);
      if (response.status === "success" && response.sub_keyword) {
        setSuggestions(response.sub_keyword);
      }
    } catch (error) {
      console.error("Failed to fetch keyword suggestions:", error);
      enqueueSnackbar("Failed to fetch keyword suggestions", {
        variant: "error",
      });
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleKeywordChange = (event, newValue) => {
    if (newValue.length === 0) {
      setProjectName("");
      setKeywords([]);
      setSuggestions([]);
      return;
    }

    // First value is the project name
    if (newValue.length > 0 && (projectName === "" || newValue[0] !== projectName)) {
      const firstKeyword = newValue[0];
      setProjectName(firstKeyword);
      fetchSuggestions(firstKeyword);
    }

    setKeywords(newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleAddSuggestion = (suggestion) => {
    if (!keywords.includes(suggestion)) {
      setKeywords([...keywords, suggestion]);
      // Remove the suggestion from the list
      setSuggestions(suggestions.filter(item => item !== suggestion));
    }
  };
  const handleOnClickSubmit = async () => {
    if (!projectName || keywords.length === 0) {
      enqueueSnackbar("Please enter at least one keyword", {
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First keyword is the project name, rest are keywords
      const keywordsToSend = keywords.slice(1);
      
      const data = {
        projects: [projectName],
        language: language,
        keywords: keywordsToSend,
      };

      const project = await postOnboarding(data);
    

      dispatch(
        addKeywords({
          keywords: project,
          days: 30,
        })
      );

      dispatch(
        setActiveKeyword({
          activeKeyword: project[0],
          days: 30,
        })
      );
      navigate(`/${project[0].name}/dashboard`, { replace: true });
    } catch (error) {
      setIsLoading(false);
      console.error("Register failed:", error);

      const res = error?.response;

      if (res?.data?.detail && typeof res.data.detail === 'string' && res.data.detail.includes("already exists for this user")) {
        enqueueSnackbar(res.data.detail, {
          variant: "error",
        });
      } else if (res?.status === 422 && Array.isArray(res.data?.detail)) {
        // Extract validation message(s)
        const firstError = res.data.detail[0];
        const message = firstError?.msg || "Validation failed.";

        enqueueSnackbar(message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Something went wrong. Please try again.", {
          variant: "error",
        });
        console.error("Register error:", error);
      }
    }
  };

  const isCreateButtonDisabled = () => {
    return keywords.length === 0;
  };

  return (
    <>
      <div className="onboard-container">
        <div className="onboard-left-container">
          <img
            className="onboard-moskal-icon"
            src={window.location.origin + "/MOSKAL.svg"}
          />
          {!isLoading ? (
            <div className="onboard-form-container">
              <div className="onboard-form-inner-container">
                <CustomText bold="semibold" size="s" color="b700" inline>
                  Enter keyword/key phrases*
                </CustomText>
                <Autocomplete
                  multiple
                  id="tags-filled"
                  options={[]}
                  value={keywords}
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  onChange={handleKeywordChange}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      return (
                        <Chip
                          key={index}
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          sx={{
                            transition: 'all 0.3s ease',
                            animation: 'fadeIn 0.3s',
                            '@keyframes fadeIn': {
                              '0%': {
                                opacity: 0,
                                transform: 'translateY(10px)'
                              },
                              '100%': {
                                opacity: 1,
                                transform: 'translateY(0)'
                              }
                            }
                          }}
                        />
                      );
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={keywords.length > 0 ? "" : "i.e. Danantara, EBT, Energi Terbarukan"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#2196f3',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.2)',
                          }
                        }
                      }}
                    />
                  )}
                />
                <CustomText size="2xls" color="b600">
                  First keyword will be used as project name.
                </CustomText>
                
                <Fade in={isFetchingSuggestions} timeout={500}>
                  <Box sx={{ 
                    mt: 2, 
                    display: isFetchingSuggestions ? 'flex' : 'none', 
                    alignItems: 'center',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.6 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.6 }
                    }
                  }}>
                    <img 
                      src={window.location.origin + "/loading.svg"} 
                      alt="Loading" 
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        marginRight: '8px',
                        animation: 'spin 2s infinite linear',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                    <CustomText size="xs" color="b600">
                      Generating keyword suggestions...
                    </CustomText>
                  </Box>
                </Fade>
                
                <Fade in={!isFetchingSuggestions && suggestions.length > 0} timeout={800}>
                  <Box sx={{ 
                    mt: 2, 
                    display: !isFetchingSuggestions && suggestions.length > 0 ? 'block' : 'none'
                  }}>
                    <CustomText size="xs" color="b600">
                      Recommended based on your keywords:
                    </CustomText>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          variant="outlined"
                          onClick={() => handleAddSuggestion(suggestion)}
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
                            '@keyframes fadeIn': {
                              '0%': {
                                opacity: 0,
                                transform: 'translateY(10px)'
                              },
                              '100%': {
                                opacity: 1,
                                transform: 'translateY(0)'
                              }
                            },
                            '&:hover': { 
                              backgroundColor: '#e3f2fd',
                              borderColor: '#2196f3',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              </div>
              <div className="onboard-form-inner-container">
                <CustomText bold="semibold" size="s" color="b700" inline>
                  Language to track*
                </CustomText>
                <FormControl sx={{ width: "100%" }}>
                  <Select
                    value={language}
                    onChange={handleChangeLanguage}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    <MenuItem value={"All language"}>All Language</MenuItem>
                    <MenuItem value={"english"}>English</MenuItem>
                    <MenuItem value={"indonesia"}>Indonesia</MenuItem>
                  </Select>
                </FormControl>
                <CustomText size="2xls" color="b600">
                  We will collect mentions ONLY in the language you choose.
                </CustomText>
              </div>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <CustomButton
                  disabled={isCreateButtonDisabled()}
                  onClick={() => handleOnClickSubmit()}
                  sx={{
                    transition: 'all 0.3s ease',
                    transform: isCreateButtonDisabled() ? 'none' : 'translateY(0)',
                    '&:hover': {
                      transform: isCreateButtonDisabled() ? 'none' : 'translateY(-3px)',
                      boxShadow: isCreateButtonDisabled() ? 'none' : '0 4px 8px rgba(0,0,0,0.2)'
                    },
                    '&:active': {
                      transform: 'translateY(1px)'
                    },
                    animation: 'fadeInButton 0.8s ease-out',
                    '@keyframes fadeInButton': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(20px)'
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                >
                  Create Project
                </CustomButton>
              </Box>
            </div>
          ) : (
            <>
              <div className="onboard-loading-container">
                <img
                  className="onboard-loading-icon"
                  src={window.location.origin + "/loading.svg"}
                />
                <CustomText size="2xls" color="b600">
                  Please wait a moment while we are searching the internet to
                  create the database of mentions about your selected keywords.
                </CustomText>
              </div>
            </>
          )}
          <CustomText inline>@Moskal 2025</CustomText>
        </div>
        <div className="onboard-right-container">
          <img
            className="onboard-image"
            src={window.location.origin + "/project.svg"}
          />
        </div>
      </div>
    </>
  );
};

export default Onboard;
