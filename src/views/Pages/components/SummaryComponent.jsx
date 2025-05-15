import CustomText from "../../../components/CustomText";
import { formatNumber } from "../../../helpers/utils";
import "./styles/SummaryComponent.css";
const SummaryComponent = (props) => {
  const data = props?.data;
  const getFormattedDisplay = (value) => {
    if (value > 0) {
      return `+${formatNumber(value)}`;
    } else {
      return `${formatNumber(value)}`;
    }
  };
  return (
    <>
      <div className="summary-component-text-container">
        <div className="summary-component-text-item">
          <CustomText bold="semibold" size="xls" color="b900" inline>
            {data.total_mentions?.display}
          </CustomText>
          <CustomText
            bold="medium"
            size="sss"
            color={data.total_mentions?.growth_value > 0 ? "g500" : "r500"}
            inline
          >
            {getFormattedDisplay(data.total_mentions?.growth_display)} (
            {data.total_mentions?.growth_percentage_display})
          </CustomText>
          <CustomText bold="medium" size="sss" color="b500" inline>
            Mentions
          </CustomText>
        </div>
        <div className="summary-component-text-item">
          <CustomText bold="semibold" size="xls" color="b900" inline>
            {data.total_reach?.display}
          </CustomText>
          <CustomText
            bold="medium"
            size="sss"
            color={data.total_reach?.growth_value > 0 ? "g500" : "r500"}
            inline
          >
            {getFormattedDisplay(data.total_reach?.growth_display)} (
            {data.total_reach?.growth_percentage_display})
          </CustomText>
          <CustomText bold="medium" size="sss" color="b500" inline>
            Reach
          </CustomText>
        </div>
        <div className="summary-component-text-item">
          <CustomText bold="semibold" size="xls" color="b900" inline>
            {data.total_social_media_interactions?.display}
          </CustomText>
          <CustomText
            bold="medium"
            size="sss"
            color={
              data.total_social_media_interactions?.growth_value > 0
                ? "g500"
                : "r500"
            }
            inline
          >
            {getFormattedDisplay(
              data.total_social_media_interactions?.growth_display
            )}{" "}
            ({data.total_social_media_interactions?.growth_percentage_display})
          </CustomText>
          <CustomText bold="medium" size="sss" color="b500" inline>
            Interactions
          </CustomText>
        </div>
        <div className="summary-component-text-item">
          <CustomText bold="semibold" size="xls" color="b900" inline>
            {data.positive_mentions?.display}
          </CustomText>
          <CustomText
            bold="medium"
            size="sss"
            color={data.positive_mentions?.growth_value > 0 ? "g500" : "r500"}
            inline
          >
            {getFormattedDisplay(data.positive_mentions?.growth_display)} (
            {data.positive_mentions?.growth_percentage_display})
          </CustomText>
          <CustomText bold="medium" size="sss" color="b500" inline>
            Positive
          </CustomText>
        </div>
        <div className="summary-component-text-item">
          <CustomText bold="semibold" size="xls" color="b900" inline>
            {data.negative_mentions?.display}
          </CustomText>
          <CustomText bold="medium" size="sss" color="r500" inline>
            {getFormattedDisplay(data.negative_mentions?.growth_display)} (
            {data.negative_mentions?.growth_percentage_display})
          </CustomText>
          <CustomText bold="medium" size="sss" color="b500" inline>
            Negative
          </CustomText>
        </div>
      </div>
    </>
  );
};

export default SummaryComponent;
