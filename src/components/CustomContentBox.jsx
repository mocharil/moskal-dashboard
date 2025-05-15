import { useState } from "react";
import CustomText from "./CustomText";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import Select, { selectClasses } from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

import "./styles/CustomContentBox.css";

function CustomContentBox(props) {
  const [selectedDays, setSelectedDays] = useState("Last 30 days");

  return (
    <div className="custom-content-box-container">
      <div className="custom-content-header-container">
        <CustomText
          size="lgs"
          color="b900"
          bold="semibold"
          inline
          class="custom-content-header-text"
        >
          {props.title}
          {props.tooltip && (
            <Tooltip
              title={props.tooltip}
              placement="top"
              sx={{ maxWidth: "300px" }}
            >
              <HelpOutline
                sx={{ color: "#A4A7AE", width: "15px" }}
              ></HelpOutline>
            </Tooltip>
          )}
        </CustomText>
        {props.seeAll && (
          <CustomText
            color="brand"
            bold="semibold"
            size="2xls"
            pointer
            inline
            onClick={props.handleSeeAll}
          >
            {props.seeAll}
          </CustomText>
        )}
      </div>
      {props.tabList && (
        <div className="custom-content-selection-container">
          <Tabs
            aria-label="tabs"
            defaultValue={0}
            sx={{
              bgcolor: "transparent",
              margin: "15px 0px",
              width: "fit-content",
            }}
            value={props.activeTab}
            onChange={props.handleChange}
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
              {props.tabList.map((value, index) => (
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
          {props.showSelect && (
            <Select
              placeholder="Select days"
              indicator={<KeyboardArrowDown />}
              sx={{
                width: 150,
                [`& .${selectClasses.indicator}`]: {
                  transition: "0.2s",
                  [`&.${selectClasses.expanded}`]: {
                    transform: "rotate(-180deg)",
                  },
                },
              }}
              value={selectedDays}
            >
              <Option value="Last 30 days">Last 30 days</Option>
            </Select>
          )}
        </div>
      )}

      <div className="custom-content-children">{props.children}</div>
    </div>
  );
}

export default CustomContentBox;
