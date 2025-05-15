import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
import {
  SentimentSatisfiedAlt,
  HelpOutline,
  PlaceOutlined,
} from "@mui/icons-material";
import "./styles/OverallSentiment.css";

const OverallSentiment = (props) => {
  const region = props.region;
  const sentiment = props.sentiment;
  const textSentiment = props.textSentimentData;
  const options = {
    chart: {
      width: 112,
      type: "donut",
    },
    fill: {
      type: "gradient",
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#4DEF8E", "#F49062", "#F5F5F5"],
    legend: {
      show: false,
    },
    tooltip: {
      theme: "light", // ensures text is dark
      style: {
        color: "#000", // optional; CSS might still be needed
      },
    },
    labels: ["positive", "negative", "neutral"],
  };
  const labelData = [
    {
      name: "positive",
      color: "#4DEF8E",
    },
    {
      name: "negative",
      color: "#F49062",
    },
    {
      name: "neutral",
      color: "#F5F5F5",
    },
  ];
  const series = [sentiment.positive, sentiment.negative, sentiment.neutral];
  return (
    <>
      <div className="overall-sentiment-upper-container">
        <div>
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            width={112}
          />
          <div className="overall-sentiment-label-container">
            {labelData?.map((value, index) => (
              <div
                className="overall-sentiment-label-item"
                key={`overall-sentiment-${value.name}-${index}`}
              >
                <div
                  className="overall-sentiment-label-bullet"
                  style={{ backgroundColor: `${value.color}` }}
                ></div>
                <CustomText color="b600" bold="medium" size="xls" inline>
                  {value.name}
                </CustomText>
              </div>
            ))}
          </div>
        </div>
        <div className="overall-sentiment-box-container">
          <div className="overall-sentiment-box-smile">
            <SentimentSatisfiedAlt sx={{ width: "17px", color: "#087443" }} />
            <CustomText color="g700" size="2xls">
              {textSentiment?.positive_topics}
            </CustomText>
          </div>
          <div className="overall-sentiment-box-frown">
            <img
              className="overall-sentiment-frown-icon"
              src={window.location.origin + "/face-frown.svg"}
            />
            <CustomText color="r700" size="2xls">
              {textSentiment?.negative_topics}
            </CustomText>
          </div>
        </div>
      </div>
      <div>
        <div className="overall-sentiment-top-regions">
          <CustomText bold="semibold" color="b900" size="lgs" inline>
            Top regions
          </CustomText>
          <HelpOutline sx={{ color: "#A4A7AE", width: "16px" }} />
        </div>
        <div className="overall-sentiment-region-container">
          {region?.map((value, index) => (
            <div
              key={`overall-sentiment-${value.name}-${index}`}
              className="overall-sentiment-region"
            >
              <PlaceOutlined sx={{ color: "#535862", width: "16px" }} />{" "}
              <CustomText color="b600" size="xls" inline>
                {value.name}
              </CustomText>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OverallSentiment;
