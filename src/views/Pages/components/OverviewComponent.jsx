import CustomText from "../../../components/CustomText";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import "./styles/OverviewComponent.css";
import { formatNumber } from "../../../helpers/utils";

const OverviewComponent = (props) => {
  const data = props.data;

  const isNegative = (value) => {
    return value < 0;
  };

  const overviewList = [
    {
      title: "Total mentions",
      value: data.total_mentions?.display,
      change: `${formatNumber(data.total_mentions?.growth_value)}(${
        data.total_mentions?.growth_percentage_display
      })`,
      negative: isNegative(data.total_mentions?.growth_value),
      tooltip:
        "Track the total number of times your topic is mentioned across platforms. Use this measure the overall volume of discussions.",
    },
    {
      title: "Total reach",
      value: data.total_reach?.display,
      change: `${formatNumber(data.total_reach?.growth_value)}(${
        data.total_reach?.growth_percentage_display
      })`,
      negative: isNegative(data.total_reach?.growth_value),
      tooltip:
        "Understand the potential audience size for your mentions. Reach tells you how many people might have seen the content.",
    },
    {
      title: "Positive mentions",
      value: data.positive_mentions?.display,
      change: `${formatNumber(data.positive_mentions?.growth_value)}(${
        data.positive_mentions?.growth_percentage_display
      })`,
      negative: isNegative(data.positive_mentions?.growth_value),
      tooltip:
        "See the count of mentions with positive sentiment. This helps you assess the share of supportive or favorable conversations.",
    },
    {
      title: "Negative mentions",
      value: data.negative_mentions?.display,
      change: `${formatNumber(data.negative_mentions?.growth_value)}(${
        data.negative_mentions?.growth_percentage_display
      })`,
      negative: true,
      tooltip:
        "Monitor negative mentions to catch emerging issues early. A spike here may indicate controversy or backlash.",
    },
    {
      title: "Presence score",
      value: data.presence_score?.display,
      change: `${formatNumber(data.presence_score?.growth_value?.toFixed(2))}(${
        data.presence_score?.growth_percentage_display
      })`,
      negative: isNegative(data.presence_score?.growth_value),
      tooltip:
        "Measure how visible your topic is across platforms. A higher score means more public attention and discussion.",
    },
    {
      title: "Social media reach",
      value: data.social_media_reach?.display,
      change: `${formatNumber(data.social_media_reach?.growth_value)}(${
        data.social_media_reach?.growth_percentage_display
      })`,
      negative: isNegative(data.social_media_reach?.growth_value),
      tooltip:
        "Analyze the audience size for mentions specifically on social media platforms. Useful for evaluating your online influence.",
    },
    {
      title: "Social media mentions",
      value: data.social_media_mentions?.display,
      change: `${formatNumber(data.social_media_mentions?.growth_value)}(${
        data.social_media_mentions?.growth_percentage_display
      })`,
      negative: isNegative(data.social_media_mentions?.growth_value),
      tooltip:
        "Count the mentions happening on platforms like TikTok, Twitter, and Facebook. Useful for assessing platform-specific traction.",
    },
    {
      title: "Social media reactions",
      value: data.social_media_reactions?.display,
      change: `${formatNumber(data.social_media_reactions?.growth_value)}(${
        data.social_media_reactions?.growth_percentage_display
      })`,
      negative: isNegative(data.social_media_reactions?.growth_value),
      tooltip:
        "See how people react to content-likes, hearts, and other emotional responses. This shows audience engagement beyond mentions.",
    },
    {
      title: "Social media comments",
      value: data.social_media_comments?.display,
      change: `${formatNumber(data.social_media_comments?.growth_value)}(${
        data.social_media_comments?.growth_percentage_display
      })`,
      negative: isNegative(data.social_media_comments?.growth_value),
      tooltip:
        "Measure the volume of comments on social posts related to your topic. Useful for gauging public dialogue depth.",
    },
    {
      title: "Social media shares",
      value: data.social_media_shares?.display,
      change: `${formatNumber(data.social_media_shares?.growth_value)}(${
        data.social_media_shares?.growth_percentage_display
      })`,
      negative: isNegative(data.social_media_shares?.growth_value),
      tooltip:
        "Track how often content about your topic is shared. Shares amplify your reach, so this helps assess virality.",
    },
    {
      title: "Non-social media reach",
      value: data.non_social_media_reach?.display,
      change: `${formatNumber(data.non_social_media_reach?.growth_value)}(${
        data.non_social_media_reach?.growth_percentage_display
      })`,
      negative: isNegative(data.non_social_media_reach?.growth_value),
      tooltip:
        "Capture the reach from new articles, blogs, and other non-social platforms. This helps you understand your media footprint beyond social networks.",
    },
    {
      title: "Non-social media mentions",
      value: data.non_social_media_mentions?.display,
      change: `${formatNumber(data.non_social_media_mentions?.growth_value)}(${
        data.non_social_media_mentions?.growth_percentage_display
      })`,
      negative: isNegative(data.non_social_media_mentions?.growth_value),
      tooltip:
        "Track mentions from websites, news outlets, and other online sources outside social media. Helps you balance digital PR strategies.",
    },
    {
      title: "Total social media interactions",
      value: data.total_social_media_interactions?.display,
      change: `${formatNumber(
        data.total_social_media_interactions?.growth_value
      )}(${data.total_social_media_interactions?.growth_percentage_display})`,
      negative: isNegative(data.total_social_media_interactions?.growth_value),
      tooltip:
        "Sum up all forms of engagement - reactions, comments, and shares. A strong interaction count signals high audience involvement.",
    },
  ];

  return (
    <>
      <div className="overview-component-grid">
        {overviewList.map((item, index) => (
          <div key={index} className="overview-component-card">
            <div className="overview-component-header">
              <CustomText color="b500" size="sss" bold="medium" inline>
                {item.title}
              </CustomText>
              <Tooltip
                title={item.tooltip}
                placement="top"
                sx={{ maxWidth: "300px" }}
              >
                <HelpOutline
                  sx={{ color: "#A4A7AE", width: "15px" }}
                ></HelpOutline>
              </Tooltip>
            </div>
            <CustomText color="b600" size="xls" bold="semibold" inline>
              {item.value}
            </CustomText>
            <CustomText
              color={item.negative ? "r600" : "g600"}
              size="sss"
              bold="medium"
              inline
            >
              {item.change}
            </CustomText>
          </div>
        ))}
      </div>
    </>
  );
};

export default OverviewComponent;
