import CustomText from "../../../components/CustomText";
import { ArrowOutward } from "@mui/icons-material";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import Pagination from "@mui/material/Pagination";
import "./styles/MostFollowersComponent.css";
import { formatNumber } from "../../../helpers/utils";
import { useState } from "react";

const MostFollowersComponent = (props) => {
  const data = props.data;
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = (channel) => {
    console.log("called", channel);
    return `${window.location.origin}/${channel}.png`;
  };
  return (
    <>
      <table className="most-followers-component-table">
        <thead>
          <tr className="most-followers-component-table-header">
            <th style={{ textAlign: "left" }}>
              <CustomText color="b500" size="sss" bold="normal">
                Profile name
              </CustomText>
            </th>
            <th>
              <div className="most-followers-component-table-header-text">
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
              <div className="most-followers-component-table-header-text">
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
              <div className="most-followers-component-table-header-text">
                <CustomText color="b500" size="sss" bold="normal" inline>
                  Followers
                </CustomText>
                <Tooltip title="Add" placement="top">
                  <HelpOutline
                    sx={{ color: "#A4A7AE", width: "15px" }}
                  ></HelpOutline>
                </Tooltip>
              </div>
            </th>
            <th>
              <div className="most-followers-component-table-header-text">
                <CustomText color="b500" size="sss" bold="normal" inline>
                  Influence Score
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
          {data.map((value, index) => (
            <tr
              className="most-followers-component-row"
              key={`${value.username}-${index}`}
            >
              <td className="most-followers-component-profile-name">
                <img
                  className="most-share-voice-component-icon"
                  src={
                    imgError ? fallbackUrl(value.channel) : value.user_image_url
                  }
                  onError={() => setImgError(true)}
                  alt="User profile"
                />
                <div className="most-followers-component-profile-name-text">
                  <CustomText color="b700" bold="medium" size="2xls" inline>
                    {value.username}
                  </CustomText>
                  <CustomText color="b500" size="sss" inline>
                    {value.channel}
                  </CustomText>
                </div>
              </td>
              <td>
                <div className="most-followers-component-mentions">
                  <CustomText color="brand" bold="semibold" size="2xls" inline>
                    {formatNumber(value.total_mentions)}
                  </CustomText>
                  <ArrowOutward sx={{ color: "#0047AB", width: "20px" }} />
                </div>
              </td>
              <td>
                <CustomText size="2xls" color="b600" bold="medium">
                  {formatNumber(value.total_reach?.toFixed(2))}
                </CustomText>
              </td>
              <td>
                <CustomText size="2xls" color="b600" bold="medium">
                  {formatNumber(value.followers)}
                </CustomText>
              </td>
              <td>
                <div className="most-followers-center-influence">
                  <InfluenceScore value={value.influence_score?.toFixed(2)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default MostFollowersComponent;

const InfluenceScore = (props) => {
  return (
    <>
      <div className="most-followers-component-influence-score-container">
        <div className="most-followers-component-influence-score-outer-bar">
          <div
            className="most-followers-component-influence-score-inner-bar"
            style={{ width: `${props.value}0%` }}
          ></div>
        </div>
        <CustomText>{props.value}</CustomText>
      </div>
    </>
  );
};
