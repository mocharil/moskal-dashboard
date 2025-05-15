import CustomText from "../../../components/CustomText";
import "./styles/AnalysisComponent.css";
import Chart from "react-apexcharts";

const AnalysisComponent = (props) => {
  const data = props.data;
  const isPositive = (number) => {
    return number > 0;
  };
  return (
    <>
      <div className="analysis-component-container">
        <div className="analysis-component-item">
          <div className="analysis-component-item-left">
            <div className="analysis-component-icon">
              <img
                src={window.location.origin + "/monitor-04.svg"}
                style={{ width: "20px" }}
              />
            </div>
            <div className="analysis-component-item-text">
              <CustomText bold="semibold" size="xls" color="b900" inline>
                {data.non_social_mentions?.display}
              </CustomText>
              <CustomText
                bold="medium"
                size="sss"
                color={
                  isPositive(data.non_social_mentions?.growth) ? "g500" : "r500"
                }
                inline
              >
                {data.non_social_mentions?.growth_display} (
                {data.non_social_mentions?.growth_percentage_display})
              </CustomText>
              <CustomText bold="medium" size="sss" color="b500" inline>
                Non-social mentions
              </CustomText>
            </div>
          </div>
          <RandomGraph
            isPositive={isPositive(data.non_social_mentions?.growth)}
            data={data.time_series?.non_social_mentions}
          />
        </div>
        <div className="analysis-component-item">
          <div className="analysis-component-item-left">
            <div className="analysis-component-icon">
              <img
                src={window.location.origin + "/message-circle-02.svg"}
                style={{ width: "20px" }}
              />
            </div>
            <div className="analysis-component-item-text">
              <CustomText bold="semibold" size="xls" color="b900" inline>
                {data.social_media_mentions?.display}
              </CustomText>
              <CustomText
                bold="medium"
                size="sss"
                color={
                  isPositive(data.social_media_mentions?.growth)
                    ? "g500"
                    : "r500"
                }
                inline
              >
                {data.social_media_mentions?.growth_display} (
                {data.social_media_mentions?.growth_percentage_display})
              </CustomText>
              <CustomText bold="medium" size="sss" color="b500" inline>
                Social media mentions
              </CustomText>
            </div>
          </div>
          <RandomGraph
            isPositive={isPositive(data.social_media_mentions?.growth)}
            data={data.time_series?.social_media_mentions}
          />
        </div>
        <div className="analysis-component-item">
          <div className="analysis-component-item-left">
            <div className="analysis-component-icon">
              <img
                src={window.location.origin + "/video-recorder.svg"}
                style={{ width: "20px" }}
              />
            </div>
            <div className="analysis-component-item-text">
              <CustomText bold="semibold" size="xls" color="b900" inline>
                {data.video_mentions?.display}
              </CustomText>
              <CustomText
                bold="medium"
                size="sss"
                color={
                  isPositive(data.video_mentions?.growth) ? "g500" : "r500"
                }
                inline
              >
                {data.video_mentions?.growth_display} (
                {data.video_mentions?.growth_percentage_display})
              </CustomText>
              <CustomText bold="medium" size="sss" color="b500" inline>
                Video incl. Tiktok
              </CustomText>
            </div>
          </div>
          <RandomGraph
            isPositive={isPositive(data.video_mentions?.growth)}
            data={data.time_series?.video_mentions}
          />
        </div>
        <div className="analysis-component-item">
          <div className="analysis-component-item-left">
            <div className="analysis-component-icon">
              <img
                src={window.location.origin + "/share-07.svg"}
                style={{ width: "20px" }}
              />
            </div>
            <div className="analysis-component-item-text">
              <CustomText bold="semibold" size="xls" color="b900" inline>
                {data.social_media_shares?.display}
              </CustomText>
              <CustomText
                bold="medium"
                size="sss"
                color={
                  isPositive(data.social_media_shares?.growth) ? "g500" : "r500"
                }
                inline
              >
                {data.social_media_shares?.growth_display} (
                {data.social_media_shares?.growth_percentage_display})
              </CustomText>
              <CustomText bold="medium" size="sss" color="b500" inline>
                Social media shares
              </CustomText>
            </div>
          </div>
          <RandomGraph
            isPositive={isPositive(data.social_media_shares?.growth)}
            data={data.time_series?.social_media_shares}
          />
        </div>
        <div className="analysis-component-item">
          <div className="analysis-component-item-left">
            <div className="analysis-component-icon">
              <img
                src={window.location.origin + "/heart.svg"}
                style={{ width: "20px" }}
              />
            </div>
            <div className="analysis-component-item-text">
              <CustomText bold="semibold" size="xls" color="b900" inline>
                {data.social_media_likes?.display}
              </CustomText>
              <CustomText
                bold="medium"
                size="sss"
                color={
                  isPositive(data.social_media_likes?.growth) ? "g500" : "r500"
                }
                inline
              >
                {data.social_media_likes?.growth_display} (
                {data.social_media_likes?.growth_percentage_display})
              </CustomText>
              <CustomText bold="medium" size="sss" color="b500" inline>
                Social media likes
              </CustomText>
            </div>
          </div>
          <RandomGraph
            isPositive={isPositive(data.social_media_likes?.growth)}
            data={data.time_series?.social_media_likes}
          />
        </div>
      </div>
    </>
  );
};

export default AnalysisComponent;

const RandomGraph = ({ isPositive, data = [] }) => {
  const chartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [isPositive ? "#17B26A" : "#F04438"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { show: false },
    },
    grid: { show: false },
    tooltip: { enabled: false },
  };

  const chartSeriesPositive = [
    {
      name: "Value",
      data: data.map((value) => value?.value),
    },
  ];

  const chartSeriesNegative = [
    {
      name: "Value",
      data: data.map((value) => value?.value),
    },
  ];
  return (
    <div style={{ width: "64px", height: "32px" }}>
      <Chart
        options={chartOptions}
        series={isPositive ? chartSeriesPositive : chartSeriesNegative}
        type="line"
        height={100}
      />
    </div>
  );
};
