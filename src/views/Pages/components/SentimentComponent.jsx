import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
import "./styles/KeywordComponent.css";
const SentimentComponent = () => {
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
    colors: ["#D92D20", "#079455"],
    xaxis: {
      categories: [
        "20 Jan",
        "21 Jan",
        "22 Jan",
        "23 Jan",
        "24 Jan",
        "25 Jan",
        "26 Jan",
        "27 Jan",
        "28 Jan",
        "29 Jan",
        "30 Jan",
      ],
    },
  };

  const series = [
    {
      name: "Negative",
      data: [145, 152, 138, 124, 133, 126, 121, 120, 16, 18, 115],
    },
    {
      name: "Positive",
      data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32],
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
        <div>
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
          />
        </div>
      </div>
    </>
  );
};

export default SentimentComponent;
