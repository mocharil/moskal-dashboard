import ReactApexChart from "react-apexcharts";
import CustomText from "../../../components/CustomText";
import "./styles/PresenceScoreComponent.css";

const PresenceScoreComponent = ({ data }) => {
  const presenceScore = data.current_presence_score?.toFixed(0);

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
          });
        },
      },
      tickAmount: 6,
    },
  };

  const presenceData = data.presence_over_time?.map((item) => {
    const date = new Date(item.date).toISOString(); // updated from item.post_date to item.date
    return {
      x: date,
      y: item.score?.toFixed(2),
    };
  });

  const series = [
    {
      name: "Your Presence Score",
      data: presenceData,
    },
  ];

  return (
    <div className="presence-score-component-container">
      <div className="presence-score-component-left">
        <div>
          <svg
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            tabIndex="-1"
            width="112"
            viewBox="0 0 100 100"
          >
            <circle
              strokeDasharray={`${presenceScore} 100`}
              cx="50"
              cy="50"
              r="40"
              stroke="#0047AB"
              strokeWidth="16"
              fill="none"
              pathLength="100"
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke="#E9EAEB"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="32"
              stroke="#E9EAEB"
              strokeWidth="1"
              fill="none"
            />
            <text
              aria-hidden="true"
              tabIndex="-1"
              x="30"
              y="55"
              className="summary-circle-text"
            >
              {presenceScore}%
            </text>
          </svg>
        </div>
        <CustomText color="b500" bold="medium" size="sss">
          Your Presence Score
        </CustomText>
      </div>
      <div className="presence-score-component-right">
        <CustomText color="b400" size="2xls" inline>
          Hover on the chart to see detail
        </CustomText>
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={150}
        />
      </div>
    </div>
  );
};

export default PresenceScoreComponent;
