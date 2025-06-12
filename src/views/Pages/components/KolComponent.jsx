import CustomText from "../../../components/CustomText";
import { ArrowOutward, ExpandMore } from "@mui/icons-material";

import "./styles/KolComponent.css";
import { useState } from "react";
import { formatNumber } from "../../../helpers/utils";

const KolComponent = (props) => {
  const data = props.data;
  const handleClickVisit = () => {
    let link = data.link_user;

    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link;
    }
    if (!/^https?:\/\/(www\.)?/i.test(link)) {
      link = link.replace(/^https?:\/\//i, "https://www.");
    }

    window.open(link, "_blank")?.focus();
  };
  const [imgError, setImgError] = useState(false);

  let fallbackUrl;
  if (data.channel && data.channel.toLowerCase() === 'youtube') {
    fallbackUrl = `${window.location.origin}/youtube.png`;
  } else {
    fallbackUrl = `${window.location.origin}/${data.channel}.png`;
  }
  return (
    <>
      <div
        className={`kol-component-container ${
          props.borderBottom && "kol-component-border-bottom"
        }`}
      >
        {/* <div className="kol-component-icon"></div> */}
        <img
          className="kol-component-icon"
          src={!data.user_image_url || imgError ? fallbackUrl : data.user_image_url}
          onError={() => setImgError(true)}
          alt="User profile"
        />
        <div className="kol-component-right-container">
          <div className="kol-component-header">
            <CustomText bold="medium" size="xls" color="b900" inline>
              {data.username}
            </CustomText>
            <CustomText
              bold="semibold"
              size="2xls"
              color="brand"
              inline
              pointer
              class="kol-component-right-flex-align"
              onClick={handleClickVisit}
            >
              Vist
              <ArrowOutward className="kol-component-right-icon" />
            </CustomText>
          </div>
          <div className="kol-component-chip-container">
            {data.is_negative_driver && (
              <div className="kol-component-chip-negative-driver">
                Negative driver
              </div>
            )}
            <div className="kol-component-chip-normal">
              {data.user_category}
              {/* <ExpandMore sx={{ width: 1, height: 1, color: "#717680" }} /> */}
            </div>
          </div>
          <div className="kol-component-detail">
            <CustomText size="sss" color="b500" inline>
              {data.channel}
            </CustomText>
            <div className="kol-component-bullet"></div>
            {data.channel !== "news" && (
              <>
                <CustomText size="sss" color="b500" inline>
                  {formatNumber(data.user_followers)} followers
                </CustomText>
                <div className="kol-component-bullet"></div>
              </>
            )}
            <CustomText size="sss" color="b500" inline>
              Influence level {data.user_influence_score?.toFixed(2)}/10
            </CustomText>            
          </div>
          <CustomText size="sss" color="b500">
            Actively discussing
          </CustomText>
          <div className="kol-component-issues-list">
            {data.unified_issue?.map((value, index) => (
              <CustomText
                key={`${value}-${index}`}
                bold="semibold"
                size="2xls"
                color="brand"
                pointer
                style={{ display: 'block', marginBottom: '4px' }}
              >
                {`• ${value}`}
              </CustomText>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default KolComponent;
