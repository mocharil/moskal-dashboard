import ReactApexChart from "react-apexcharts";
import Chart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
const SentimentByCategory = (props) => {
  const data = props.data;
  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "64px",
      },
    },
    colors: ["#4DEF8E", "#F5F5F5", "#F49062"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((value) => value.name),
    },
    yaxis: { labels: { formatter: (val) => `${val}K` } },
    legend: { position: "bottom" },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `${val} mentions` } },
  };

  const series = [
    { name: "Positive", data: data.map((value) => value.positive) },
    { name: "Neutral", data: data.map((value) => value.neutral) },
    { name: "Negative", data: data.map((value) => value.negative) },
  ];

  return (
    <div>
      <div className="keyword-component-text">
        <CustomText color="b400" size="2xls" inline>
          Hover on the cart to see detail
        </CustomText>
      </div>
      <div className="chart-container">
        <Chart options={options} series={series} type="bar" height={300} />
      </div>
    </div>
  );
};

export default SentimentByCategory;
