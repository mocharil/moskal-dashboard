import {
  ArrowOutward
} from "@mui/icons-material";
import CustomText from "../../../components/CustomText";
import "./styles/MentionComponent.css";
import { formatDateAMPM, formatNumber } from "../../../helpers/utils";
import { useState } from "react";
const MentionComponent = (props) => {
  const data = props.data;
  const [imgError, setImgError] = useState(false);

  const fallbackUrl = `${window.location.origin}/${data.channel}.png`;

  const getSentiment = () => {
    if (data.sentiment === "negative") {
      return (
        <div className="mention-component-chip-negative">
          Negative
          {/* <ExpandMore sx={{ width: 12, height: 12, color: "#F04438" }} /> */}
        </div>
      );
    } else if (data.sentiment === "positive") {
      return (
        <div className="mention-component-chip-positive">
          Positive
          {/* <ExpandMore sx={{ width: 12, height: 12, color: "#17B26A" }} /> */}
        </div>
      );
    } else {
      return (
        <div className="mention-component-chip-neutral">
          Neutral
          {/* <ExpandMore sx={{ width: 1, height: 1, color: "#717680" }} /> */}
        </div>
      );
    }
  };

  const openLink = () => {
    let link = data.link_post;

    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link;
    }
    if (!/^https?:\/\/(www\.)?/i.test(link)) {
      link = link.replace(/^https?:\/\//i, "https://www.");
    }

    window.open(link, "_blank")?.focus();
  };

  const getBottomScore = () => {
    if (data.channel === "instagram") {
      return (
        <>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/message-circle-02.svg"}
            alt="comments"
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.comments)}
          </CustomText>
          <div className="mention-component-bullet"></div>
      
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/thumbs-up.svg"}
            alt="likes"
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.likes)}
          </CustomText>
      
          {data.views !== undefined && data.views !== null && data.views !== 0  && (
            <>
              <div className="mention-component-bullet"></div>
              <img
                className="mentions-small-icon"
                src={window.location.origin + "/views.svg"}
                alt="views"
              />
              <CustomText size="2xls" color="b500" inline>
                {formatNumber(data.views)}
              </CustomText>
            </>
          )}
        </>
      );
    } else if (data.channel === "twitter") {
      return (
        <>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/views.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.views)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/retweets.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.retweets)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/message-circle-02.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.replies)}
          </CustomText>
          <div className="mention-component-bullet"></div>
        </>
      );
    } else if (data.channel === "linkedin") {
      return (
        <>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/message-circle-02.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.comments)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/thumbs-up.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.likes)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/retweets.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.reposts)}
          </CustomText>
          <div className="mention-component-bullet"></div>
        </>
      );
    } else if (data.channel === "tiktok") {
      return (
        <>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/message-circle-02.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.comments)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/thumbs-up.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.likes)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/share-07.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.shares)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/favorite.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.favorites)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          {data.views !== undefined && data.views !== null && data.views !== 0  && (
            <>
              <div className="mention-component-bullet"></div>
              <img
                className="mentions-small-icon"
                src={window.location.origin + "/views.svg"}
                alt="views"
              />
              <CustomText size="2xls" color="b500" inline>
                {formatNumber(data.views)}
              </CustomText>
            </>
          )}
        </>
      );
    } else if (data.channel === "reddit") {
      return (
        <>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/message-circle-02.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.comments)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/votes.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.votes)}
          </CustomText>
          <div className="mention-component-bullet"></div>
        </>
      );
    } else if (data.channel === "youtube") {
      return (
        <>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/message-circle-02.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.comments)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/thumbs-up.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.likes)}
          </CustomText>
          <div className="mention-component-bullet"></div>
          <img
            className="mentions-small-icon"
            src={window.location.origin + "/views.svg"}
          />
          <CustomText size="2xls" color="b500" inline>
            {formatNumber(data.views)}
          </CustomText>
          <div className="mention-component-bullet"></div>
        </>
      );
    } else {
      return <></>;
    }
  };
  return (
    <>
      <div
        className={`mention-component-container ${
          props.borderBottom && "mention-component-border-bottom"
        }`}
      >
        <div>
          <img
            className="kol-component-icon"
            src={imgError ? fallbackUrl : data.user_image_url}
            onError={() => setImgError(true)}
            alt="User profile"
          />
        </div>
        <div className="mention-component-right-container">
          <div className="mention-component-header">
            <CustomText bold="medium" color="b900" size="xls" inline>
              {data.username}
            </CustomText>
            {getSentiment()}
          </div>
          <div className="mention-component-detail">
            <CustomText size="2xls" color="b500" inline>
              {data.channel}
            </CustomText>
            <div className="mention-component-bullet"></div>
            {data.channel !== "news" ? (
              <>
                {data.user_followers ? (
                  <>
                    <CustomText size="2xls" color="b500" inline>
                      {formatNumber(data.user_followers)} followers
                    </CustomText>
                    <div className="mention-component-bullet"></div>
                  </>
                ) : data.user_connections ? (
                  <>
                    <CustomText size="2xls" color="b500" inline>
                      {formatNumber(data.user_connections)} connections
                    </CustomText>
                    <div className="mention-component-bullet"></div>
                  </>
                ) : data.subscriber ? (
                  <>
                    <CustomText size="2xls" color="b500" inline>
                      {formatNumber(data.subscriber)} subscribers
                    </CustomText>
                    <div className="mention-component-bullet"></div>
                  </>
                ) : null}
              </>
            ) : (
              <></>
            )}
            <CustomText size="2xls" color="b500" inline>
              Influencer level {data.influence_score?.toFixed(2)}/10
            </CustomText>
          </div>
          <div className="mention-text-container">
            <CustomText
              color="b500"
              size="xls"
              inline
              class="mention-component-desc"
            >
              {data.channel === "news" ? data.description : data.post_caption}
            </CustomText>
          </div>
          <div className="mention-component-footer">
            <div className="mention-component-detail">
              {getBottomScore()}

              <img
                className="mentions-small-icon"
                src={window.location.origin + "/calendar.svg"}
              />
              <CustomText size="2xls" color="b500" inline>
                {formatDateAMPM(data.post_created_at)}
              </CustomText>
            </div>
            {props.isShowAction && (
              <div className="mention-component-footer-right">
                <CustomText
                  bold="semibold"
                  size="2xls"
                  color="brand"
                  inline
                  pointer
                  class="mention-component-right-flex-align"
                  onClick={openLink}
                >
                  View Post
                  <ArrowOutward className="mention-component-right-icon-blue" />
                </CustomText>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MentionComponent;
