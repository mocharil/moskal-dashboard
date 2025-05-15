import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import CustomText from "../../../components/CustomText";
import Checkbox from "@mui/joy/Checkbox";
import { useState } from "react";
import "./styles/DialogFilter.css";

import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";
import Dialog from "@mui/material/Dialog";

import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Tab, { tabClasses } from "@mui/joy/Tab";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";

const CheckboxItem = ({ label, value, className, selected, onChange }) => (
  <div className="dashboard-checkbox-container">
    <Checkbox
      type="checkbox"
      checked={selected.includes(value)}
      onChange={() => onChange(value)}
    />
    <div className={className}>{label}</div>
  </div>
);

const SentimentCheckbox = ({ label, value, selected, onChange, color }) => (
  <div className="dashboard-checkbox-container">
    <Checkbox
      type="checkbox"
      checked={selected.includes(value)}
      onChange={() => onChange(value)}
    />
    <CustomText bold="medium" size="2xls" color={color} inline>
      {label}
    </CustomText>
  </div>
);

const DialogFilter = (props) => {
  const [influenceScore, setInfluenceScore] = useState([0, 10]);
  const handleChangeInfluenceScore = (event, newValue) => {
    setInfluenceScore(newValue);
  };
  const [phrase, setPhrase] = useState("");
  const [isExactPhraseChecked, setIsExactPhraseChecked] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [selectedSentiment, setSelectedSentiment] = useState([]);
  const [geoLocation, setGeoLocation] = useState("");
  const [language, setLanguage] = useState("all language");
  const [author, setAuthor] = useState("");
  const [activeVirality, setActiveVirality] = useState("all mentions");
  const [activeVisited, setActiveVisited] = useState("all mentions");
  const [domain, setDomain] = useState("");

  const clearData = () => {
    setInfluenceScore([0, 10]);
    setPhrase("");
    setIsExactPhraseChecked(false);
    setSelectedChannels([]);
    setSelectedSentiment([]);
    setGeoLocation("");
    setLanguage("all language");
    setAuthor("");
    setActiveVirality("all mentions");
    setDomain("");
  };

  const leftGroup = [
    { label: "Tiktok", value: "tiktok", className: "dialog-filter-chip-black" },
    {
      label: "X/Twitter",
      value: "twitter",
      className: "dialog-filter-chip-purple",
    },
    {
      label: "Instagram",
      value: "instagram",
      className: "dialog-filter-chip-red",
    },
    {
      label: "Facebook",
      value: "facebook",
      className: "dialog-filter-chip-blue",
    },
    {
      label: "Youtube",
      value: "youtube",
      className: "dialog-filter-chip-green",
    },
  ];

  const rightGroup = [
    { label: "News", value: "news", className: "dialog-filter-chip-orange" },
    { label: "Web", value: "web", className: "dialog-filter-chip-navy" },
  ];

  const sentiments = [
    { label: "Negative", value: "negative", color: "r500" },
    { label: "Neutral", value: "neutral", color: "b900" },
    { label: "Positive", value: "positive", color: "g500" },
  ];

  const handleToggleChannels = (value) => {
    setSelectedChannels((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleToggleSentiment = (value) => {
    setSelectedSentiment((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleOnChangeExactPhrase = (event) => {
    setIsExactPhraseChecked(event.target.checked);
  };

  const handleChangeLanguage = (event) => {
    setLanguage(event.target.value);
  };

  const handleChangeGeolocation = (event) => {
    setGeoLocation(event.target.value);
  };

  const handleChangeActiveVirality = (event, newValue) => {
    setActiveVirality(newValue);
  };

  const handleChangeActiveVisited = (event, newValue) => {
    setActiveVisited(newValue);
  };
  const handleChangeAuthor = (event) => {
    setAuthor(event.target.value);
  };

  const handleChangeDomain = (event) => {
    setDomain(event.target.value);
  };

  const getTransformData = () => {
    const filterData = {
      ...(phrase.trim() !== "" && { keywords: phrase.split(",") }),
      ...((domain.trim() !== "" || author.trim() !== "") && {
        domain: [
          ...(domain.trim() !== "" ? domain.split(",") : []),
          ...(author.trim() !== "" ? author.split(",") : []),
        ],
      }),
      ...(selectedChannels.length !== 0 && { channels: selectedChannels }),
      ...(selectedSentiment.length !== 0 && { sentiment: selectedSentiment }),
      ...(geoLocation.trim() !== "" && { region: geoLocation.split(",") }),
      ...(language.trim() !== "" &&
        language !== "all language" && { language: language.split(",") }),
      search_exact_phrases: isExactPhraseChecked,
      importance: "all mentions",
      influence_score_min: influenceScore[0],
      influence_score_max: influenceScore[1],
      // region: ["bandung", "jakarta"],
    };
    return filterData;
  };

  const handleClickApply = () => {
    console.log("data", getTransformData());
    props.handleChangeFilter(getTransformData());
    props.onClose();
  };

  const handleOnChangePhrase = (event) => {
    setPhrase(event.target.value);
  };
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      scroll="body"
      maxWidth="xl"
      setFullWidth={true}
    >
      <div className="dialog-filter-container">
        <CustomText bold="semibold" size="mds" inline>
          Advance filters
        </CustomText>
        <div>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              margin: "8px 0px",
            }}
            onSubmit={(e) => e.preventDefault()}
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
              value={phrase}
              onChange={handleOnChangePhrase}
            />
            <IconButton sx={{ p: "10px" }} aria-label="menu">
              <Tooltip title="Tooltip" placement="top">
                <HelpOutline
                  sx={{ color: "#A4A7AE", width: "15px" }}
                ></HelpOutline>
              </Tooltip>
            </IconButton>
          </Paper>

          <div className="dashboard-checkbox-container">
            <Checkbox
              checked={isExactPhraseChecked}
              onClick={handleOnChangeExactPhrase}
            />
            <CustomText inline>Search exact phrase</CustomText>
          </div>
        </div>
        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Saved filters
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <CustomText color="b600" size="2xls" inline>
            Any saved filters will be shown here for easy re-use
          </CustomText>
        </div>
        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Channels
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <div className="dialog-filter-channels-container">
            <div
              className="dialog-filter-channels-inner-container"
              style={{ width: "328px" }}
            >
              {leftGroup.map((item) => (
                <CheckboxItem
                  key={item.value}
                  {...item}
                  selected={selectedChannels}
                  onChange={handleToggleChannels}
                />
              ))}
            </div>
            <div className="dialog-filter-channels-inner-container">
              {rightGroup.map((item) => (
                <CheckboxItem
                  key={item.value}
                  {...item}
                  selected={selectedChannels}
                  onChange={handleToggleChannels}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Sentiment
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <div className="dialog-filter-sentiment-checkbox-container">
            {sentiments.map((item) => (
              <SentimentCheckbox
                key={item.value}
                {...item}
                selected={selectedSentiment}
                onChange={handleToggleSentiment}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Influence Score
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <Slider
            getAriaLabel={() => "Influencer Score"}
            value={influenceScore}
            onChange={handleChangeInfluenceScore}
            valueLabelDisplay="auto"
            max={10}
          />
        </div>
        <div>
          <div className="dialog-filer-split">
            <div className="dashboard-checkbox-container">
              <CustomText bold="medium" size="xls" inline>
                Geolocation
              </CustomText>
              <Tooltip title="Tooltip" placement="top">
                <HelpOutline
                  sx={{ color: "#A4A7AE", width: "15px" }}
                ></HelpOutline>
              </Tooltip>
            </div>
            <div className="dashboard-checkbox-container">
              <CustomText bold="medium" size="xls" inline>
                Exclude provinces
              </CustomText>
              <Switch />
            </div>
          </div>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            onChange={handleChangeGeolocation}
            sx={{ width: "100%" }}
            placeholder="Choose provinces"
          >
            {cities.map((value, index) => (
              <MenuItem value={value.toLowerCase()}>{value}</MenuItem>
            ))}
          </Select>
        </div>

        <div>
          <div className="dialog-filer-split">
            <div className="dashboard-checkbox-container">
              <CustomText bold="medium" size="xls" inline>
                Language
              </CustomText>
              <Tooltip title="Tooltip" placement="top">
                <HelpOutline
                  sx={{ color: "#A4A7AE", width: "15px" }}
                ></HelpOutline>
              </Tooltip>
            </div>
            <div className="dashboard-checkbox-container">
              <CustomText bold="medium" size="xls" inline>
                Exclude languages
              </CustomText>
              <Switch />
            </div>
          </div>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            onChange={handleChangeLanguage}
            value={language}
            sx={{ width: "100%" }}
            placeholder="Choose language"
          >
            <MenuItem value={"all language"}>All Language</MenuItem>
            {languageList.map((value, index) => (
              <MenuItem value={value} style={{ textTransform: "capitalize" }}>
                {value}
              </MenuItem>
            ))}
            <MenuItem value={"indonesia"}>Indonesia</MenuItem>
          </Select>
        </div>

        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Author
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              margin: "8px 0px",
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <IconButton sx={{ p: "10px" }} aria-label="menu">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Author name with delimiter comma (,) i.e Agus, Surya"
              inputProps={{
                "aria-label":
                  "Author name with delimiter comma (,) i.e Agus, Surya",
              }}
              value={author}
              onChange={handleChangeAuthor}
            />
          </Paper>
        </div>

        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Virality/ engagement level
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>

          <Tabs
            aria-label="tabs"
            defaultValue={0}
            sx={{ bgcolor: "transparent", margin: "15px 0px" }}
            value={activeVirality}
            onChange={handleChangeActiveVirality}
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
                sx={{ width: "50%", height: "44px" }}
                value="all mentions"
              >
                <CustomText>All mentions</CustomText>
              </Tab>
              <Tab
                disableIndicator
                sx={{ width: "50%", height: "44px" }}
                value="important mentions"
              >
                <CustomText>Only viral mentions</CustomText>
              </Tab>
            </TabList>
          </Tabs>
        </div>

        {/* <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Visited
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <Tabs
            aria-label="tabs"
            defaultValue={0}
            sx={{ bgcolor: "transparent", margin: "15px 0px" }}
            value={activeVisited}
            onChange={handleChangeActiveVisited}
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
                sx={{ width: "33.33%", height: "44px" }}
                value="all mentions"
              >
                <CustomText>All mentions</CustomText>
              </Tab>
              <Tab
                disableIndicator
                sx={{ width: "33.33%", height: "44px" }}
                value="only visited"
              >
                <CustomText>Only visited</CustomText>
              </Tab>
              <Tab
                disableIndicator
                sx={{ width: "33.33%", height: "44px" }}
                value="only not visited"
              >
                <CustomText>Only not visited</CustomText>
              </Tab>
            </TabList>
          </Tabs>
        </div> */}

        <div>
          <div className="dashboard-checkbox-container">
            <CustomText bold="medium" size="xls" inline>
              Domain
            </CustomText>
            <Tooltip title="Tooltip" placement="top">
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          </div>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              margin: "8px 0px",
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <IconButton sx={{ p: "10px" }} aria-label="menu">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Domain name with delimiter comma (,) i,e medium.com, quora.com"
              inputProps={{
                "aria-label":
                  "Domain name with delimiter comma (,) i,e medium.com, quora.com",
              }}
              value={domain}
              onChange={handleChangeDomain}
            />
          </Paper>
        </div>
        <div className="dialog-filter-button-container">
          <Button variant="outlined" color="grey" onClick={clearData}>
            Clear
          </Button>
          <Button variant="outlined" color="grey" onClick={props.onClose}>
            Cancel
          </Button>
          <Button variant="outlined" color="grey" onClick={handleClickApply}>
            Apply
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DialogFilter;

const languageList = [
  "afrikaans",
  "albanian",
  "amharic",
  "arabic",
  "armenian",
  "assamese",
  "azerbaijani",
  "balinese",
  "bengali",
  "bosnian",
  "bulgarian",
  "burmese",
  "cebuano",
  "chinese",
  "croatian",
  "czech",
  "danish",
  "dutch",
  "english",
  "esperanto",
  "estonian",
  "filipino",
  "finnish",
  "french",
  "georgian",
  "german",
  "greek",
  "haitian",
  "hausa",
  "hebrew",
  "hindi",
  "hungarian",
  "icelandic",
  "indonesia",
  "irish",
  "italian",
  "japanese",
  "javanese",
  "kazakh",
  "khmer",
  "korean",
  "kurdish",
  "latin",
  "latvian",
  "lithuanian",
  "macedonian",
  "malay",
  "malayalam",
  "manipuri",
  "marathi",
  "minangkabau",
  "māori",
  "nepali",
  "norwegian",
  "pashto",
  "persian",
  "polish",
  "portuguese",
  "punjabi",
  "quechua",
  "romanian",
  "russian",
  "saraiki",
  "serbian",
  "sindhi",
  "slovak",
  "slovenian",
  "somali",
  "spanish",
  "sundanese",
  "swahili",
  "swedish",
  "tagalog",
  "tamil",
  "telugu",
  "tetum",
  "thai",
  "turkish",
  "ukrainian",
  "urdu",
  "uzbek",
  "vietnamese",
  "welsh",
  "xhosa",
  "zulu",
];
const cities = [
  "Jakarta Timur",
  "Surabaya",
  "Bandung",
  "Bekasi",
  "Jakarta Barat",
  "Medan",
  "Jakarta Selatan",
  "Depok",
  "Tangerang",
  "Jakarta Utara",
  "Palembang",
  "Semarang",
  "Makassar",
  "Tangerang Selatan",
  "Batam",
  "Pekanbaru",
  "Bogor",
  "Bandar Lampung",
  "Jakarta Pusat",
  "Padang",
  "Malang",
  "Samarinda",
  "Tasikmalaya",
  "Serang",
  "Balikpapan",
  "Pontianak",
  "Banjarmasin",
  "Denpasar",
  "Jambi",
  "Surakarta",
  "Cimahi",
  "Cilegon",
  "Mataram",
  "Manado",
  "Yogyakarta",
  "Jayapura",
  "Kupang",
  "Bengkulu",
  "Palu",
  "Sukabumi",
  "Kendari",
  "Ambon",
  "Cirebon",
  "Dumai",
  "Pekalongan",
  "Binjai",
  "Palangka Raya",
  "Kediri",
  "Tegal",
  "Sorong",
  "Banjarbaru",
  "Pematangsiantar",
  "Banda Aceh",
  "Tarakan",
  "Singkawang",
  "Lubuklinggau",
  "Probolinggo",
  "Pangkalpinang",
  "Tanjungpinang",
  "Padang Sidempuan",
  "Batu",
  "Bitung",
  "Prabumulih",
  "Pasuruan",
  "Ternate",
  "Banjar",
  "Gorontalo",
  "Madiun",
  "Salatiga",
  "Lhokseumawe",
  "Bontang",
  "Tanjungbalai",
  "Tebing Tinggi",
  "Langsa",
  "Palopo",
  "Metro",
  "Bima",
  "Baubau",
  "Parepare",
  "Blitar",
  "Pagar Alam",
  "Payakumbuh",
  "Mojokerto",
  "Bukittinggi",
  "Gunungsitoli",
  "Magelang",
  "Tidore Kepulauan",
  "Kotamobagu",
  "Subulussalam",
  "Pariaman",
  "Tomohon",
  "Sungaipenuh",
  "Sibolga",
  "Tual",
  "Solok",
  "Sawahlunto",
  "Padang Panjang",
  "Sabang",
];
