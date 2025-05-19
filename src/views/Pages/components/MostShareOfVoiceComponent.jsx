import CustomText from "../../../components/CustomText";
import { ArrowOutward } from "@mui/icons-material";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import Pagination from "@mui/material/Pagination";
import "./styles/MostShareOfVoiceComponent.css";
import { formatNumber } from "../../../helpers/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const MostShareOfVoiceComponent = (props) => {
  const data = props.data;
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);

  const fallbackUrl = (channel) => {
    console.log("called", channel);
    return `${window.location.origin}/${channel}.png`;
  };

  const handleMentionClick = (username, channel) => {
    if (activeKeywords && activeKeywords.name) {
      navigate(`/${activeKeywords.name}/mentions?domain=${username}&channel=${channel}`);
    } else {
      console.error("Active keyword name not found, cannot navigate to mentions.");
      // Optionally, show an error to the user or navigate to a default page
    }
  };

  return (
    <>
      <table className="most-share-voice-component-table">
        <thead>
          <tr className="most-share-voice-component-table-header">
            <th style={{ textAlign: "left" }}>
              <CustomText color="b500" size="sss" bold="normal">
                Profile name
              </CustomText>
            </th>
            <th>
              <div className="most-share-voice-component-table-header-text">
                <CustomText color="b500" size="sss" bold="normal" inline>
                  Mentions
                </CustomText>
                <Tooltip title="Add" placement="top">
                  <HelpOutline
                    sx={{ color: "#A4A7AE", width: "15px" }}
                  ></HelpOutline>
                </Tooltip>
              </div>
            </th>
            <th>
              <div className="most-share-voice-component-table-header-text">
                <CustomText color="b500" size="sss" bold="normal" inline>
                  Reach
                </CustomText>
                <Tooltip title="Add" placement="top">
                  <HelpOutline
                    sx={{ color: "#A4A7AE", width: "15px" }}
                  ></HelpOutline>
                </Tooltip>
              </div>
            </th>
            <th>
              <div className="most-share-voice-component-table-header-text">
                <CustomText color="b500" size="sss" bold="normal" inline>
                  Share of voice
                </CustomText>
                <Tooltip title="Add" placement="top">
                  <HelpOutline
                    sx={{ color: "#A4A7AE", width: "15px" }}
                  ></HelpOutline>
                </Tooltip>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((value, index) => (
            <tr
              className="most-share-voice-component-row"
              key={`${value.username}-${index}`}
            >
              <td className="most-share-voice-component-profile-name">
                <img
                  className="most-share-voice-component-icon"
                  src={
                    imgError ? fallbackUrl(value.channel) : value.user_image_url
                  }
                  onError={() => setImgError(true)}
                  alt="User profile"
                />
                <div className="most-share-voice-component-profile-name-text">
                  <CustomText color="b700" bold="medium" size="2xls" inline>
                    {value.username}
                  </CustomText>
                  <CustomText color="b500" size="sss" inline>
                    {value.channel}
                  </CustomText>
                </div>
              </td>
              <td>
                <div
                  className="most-share-voice-component-mentions"
                  onClick={() => handleMentionClick(value.username, value.channel)}
                  style={{ cursor: "pointer" }}
                >
                  <CustomText color="brand" bold="semibold" size="2xls" inline>
                    {formatNumber(value.total_mentions)}
                  </CustomText>
                  <ArrowOutward sx={{ color: "#0047AB", width: "20px" }} />
                </div>
              </td>
              <td>
                <CustomText size="2xls" color="b600" bold="medium">
                  {formatNumber(value.total_reach.toFixed(2))}
                </CustomText>
              </td>
              <td>
                <CustomText size="2xls" color="b600" bold="medium">
                  {value.percentage_share_of_voice.toFixed(3)}%
                </CustomText>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default MostShareOfVoiceComponent;
