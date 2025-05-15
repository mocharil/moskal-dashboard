import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
import "./styles/IntentShare.css";

const IntentShare = ({ data = [] }) => {
  const series = data.map((item) => item.percentage);
  const labels = data.map((item) => item.name);

  const options = {
    chart: {
      type: "donut",
    },
    labels,
    fill: {
      type: "gradient",
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: "right",
      horizontalAlign: "center",
      verticalAlign: "middle",
      fontSize: "14px",
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        vertical: 5,
      },
    },
    // No custom colors defined – use ApexCharts default
  };

  return (
    <div className="intent-share-container">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        width="100%"
        height={380}
      />
    </div>
  );
};

export default IntentShare;
