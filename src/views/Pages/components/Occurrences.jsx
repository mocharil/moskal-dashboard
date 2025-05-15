import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
import "./styles/KeywordComponent.css";
const Occurrences = (props) => {
  const data = props.data;
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
    colors: ["#2E90FA"],
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
  };

  const reachData = data?.map((item, index) => {
    const date = new Date(item.post_date).toISOString();
    return {
      x: date,
      y: item.total_reach,
    };
  });

  const seriesMention = [
    {
      name: "Mentions",
      data: reachData,
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
            series={seriesMention}
            type="line"
            height={350}
          />
        </div>
      </div>
    </>
  );
};

export default Occurrences;
