import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
import { getArrayOfKey, formatDate } from "../../../helpers/utils";
import "./styles/KeywordComponent.css";
const KeywordComponent = (props) => {
  const options = {
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
    },
    colors:
      props.type === "Mentions & Reach"
        ? ["#2E90FA", "#079455"]
        : ["#D92D20", "#079455"],

    xaxis: {
      type: "datetime",
      labels: {
        rotate: 0,
        formatter: function (value) {
          const date = new Date(value);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }); // e.g., "25 Mar"
        },
      },
      tickAmount: 6,
    },
    tooltip: {
      x: {
        show: true,
        format: "dd MMM", // Changed to 'dd MMM' to match the image '03 May'
      },
      y: {
        formatter: function (value, { seriesIndex, w }) {
          const seriesName = w.globals.seriesNames[seriesIndex];
          if (seriesName === "Mentions" || seriesName === "Positive" || seriesName === "Negative") {
            return parseInt(value).toLocaleString();
          }
          if (seriesName === "Reach") {
            // Ensure 'Reach' is formatted to show decimals as in the image
            return parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
          }
          return value;
        },
      },
    },
  };
  const reachData = props.data?.map((item, index) => {
    const date = new Date(item.post_date).toISOString();
    return {
      x: date,
      y: item.total_reach,
    };
  });

  const mentionData = props.data?.map((item, index) => {
    const date = new Date(item.post_date).toISOString();
    return {
      x: date,
      y: item.total_mentions,
    };
  });

  const positiveData = props.data?.map((item, index) => {
    const date = new Date(item.post_date).toISOString();
    return {
      x: date,
      y: item.total_positive,
    };
  });

  const negativeData = props.data?.map((item, index) => {
    const date = new Date(item.post_date).toISOString();
    return {
      x: date,
      y: item.total_negative,
    };
  });
  const seriesMention = [
    {
      name: "Reach",
      data: reachData,
    },
    {
      name: "Mentions",
      data: mentionData,
    },
  ];

  const seriesNegative = [
    {
      name: "Negative",
      data: negativeData,
    },
    {
      name: "Positive",
      data: positiveData,
    },
  ];
  return (
    <>
      <div>
        <div className="keyword-component-text">
          <CustomText color="b400" size="2xls" inline>
            Hover on the cart to see detail
          </CustomText>
        </div>
        <div className="keyword-chart-container">
          <ReactApexChart
            options={options}
            series={
              props.type === "Mentions & Reach" ? seriesMention : seriesNegative
            }
            type="line"
            height={350}
            width="100%"
          />
        </div>
      </div>
    </>
  );
};

export default KeywordComponent;
