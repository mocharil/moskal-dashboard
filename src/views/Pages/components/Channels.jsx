import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";

const Channels = ({ data = [] }) => {
  const series = [
    {
      name: "Share",
      data: data.map((item) => item.count),
    },
  ];
  const labels = data.map((item) => item.name);

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
    colors: undefined, // will use default distributed colors
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

export default Channels;
