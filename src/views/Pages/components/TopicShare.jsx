import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";

const HIGHLIGHT_COLOR = "#FF8C00"; // Example: DarkOrange
const DEFAULT_COLOR = "#008FFB";   // Example: Default ApexCharts blue

const TopicShare = ({ data = [], currentTopicUnifiedIssue }) => {
  const series = [
    {
      name: "Share",
      data: data.map((item) => item.total_posts),
    },
  ];
  const labels = data.map((item) => item.unified_issue);

  const chartColors = data.map((item) =>
    item.unified_issue === currentTopicUnifiedIssue
      ? HIGHLIGHT_COLOR
      : DEFAULT_COLOR
  );

  const options = {
    chart: {
      height: 350,
      type: "bar",
    },
    plotOptions: {
      bar: {
        columnWidth: "70%",
        distributed: true,
        borderRadius: 10,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} posts`,
      },
    },
    colors: chartColors,
  };

  return (
    <>
      <div className="keyword-component-text">
        <CustomText color="b400" size="2xls" inline>
          Hover on the chart to see details
        </CustomText>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </>
  );
};

export default TopicShare;
