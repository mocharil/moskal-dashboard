import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
const SentimentBreakdownComponent = (props) => {
  const data = props.data;
  const series = [data.positive, data.neutral, data.negative];
  const options = {
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
        size: 100,
      },
    },
    grid: {
      padding: {
        bottom: -100,
      },
    },
    dataLabels: {
      enabled: false,
    },
    labels: ["positive", "neutral", "negative"],
    colors: ["#4DEF8E", "#F5F5F5", "#F49062"],
    fill: {
      type: "gradient",
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "14px",
        color: "#000", // black text in tooltip
      },
    },
  };
  return (
    <>
      <div>
        <div className="keyword-component-text">
          <CustomText color="b400" size="2xls" inline>
            Hover on the cart to see detail
          </CustomText>
        </div>
        <div className="chart-container">
          <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={200}
          />
        </div>
      </div>
    </>
  );
};

export default SentimentBreakdownComponent;
