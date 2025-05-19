import React, { useState, useEffect } from "react";
import CustomText from "../../../components/CustomText";
import { ArrowOutward } from "@mui/icons-material";
import ReactApexChart from "react-apexcharts";
import { useNavigate, useParams } from "react-router-dom"; // Added import

import "./styles/TopicsTable.css";
const TopicsTable = (props) => {
  const navigate = useNavigate(); // Added navigate
  const { keyword } = useParams(); // Added keyword from params

  const handleClickLearnMore = (id) => {
    props.handleDetailClick(id);
  };
  const data = props.data;
  return (
    <>
      <div>
        <div className="topic-table-header">
          <CustomText color="b900" bold="semibold" size="s" inline>
            Overview
          </CustomText>
          <CustomText color="b600" size="mds" inline>
            Explore the pivotal issues and emerging trends in the politic arena
          </CustomText>
        </div>
        <div>
          <div className="topic-table-container">
            <table className="topic-table-table-container">
              <thead className="topic-table-table-header-container">
                <tr>
                  <th className="">
                    <CustomText bold="semibold" color="b500" size="sss">
                      Topic Name{" "}
                    </CustomText>
                  </th>
                  <th className="">
                    <CustomText bold="semibold" color="b500" size="sss">
                      Description{" "}
                    </CustomText>
                  </th>
                  <th className="">
                    <CustomText bold="semibold" color="b500" size="sss">
                      Mentions
                    </CustomText>
                  </th>
                  <th className="">
                    <CustomText bold="semibold" color="b500" size="sss">
                      Reach
                    </CustomText>
                  </th>
                  <th className="">
                    <CustomText bold="semibold" color="b500" size="sss">
                      Share of Voice
                    </CustomText>
                  </th>
                  <th className="">
                    <CustomText bold="semibold" color="b500" size="sss">
                      Sentiment Share
                    </CustomText>
                  </th>
                  <th> </th>
                </tr>
              </thead>
              <tbody className="topic-table-body-container">
                {data.map((item, idx) => (
                  <tr key={idx} className="">
                    <td className="topic-table-topic">
                      <CustomText color="b900" bold="medium" size="2xls" inline>
                        {item.unified_issue}
                      </CustomText>
                    </td>
                    <td className="topic-table-description">
                      <CustomText color="b600" size="2xls" inline>
                        {item.description}
                      </CustomText>
                    </td>
                    <td className="topic-table-mentions">
                      <CustomText
                        bold="semibold"
                        size="2xls"
                        color="brand"
                        inline
                        pointer
                        class="topics-table-component-right-flex-align"
                        onClick={() => {
                          try {
                            // Ensure 'keyword' from useParams is defined before using it in a route
                            if (typeof keyword === 'undefined') {
                              console.error("Route parameter 'keyword' is undefined. Cannot navigate.");
                              return; // Prevent further execution
                            }

                            const directKeywords = [];
                            if (item.list_issue && Array.isArray(item.list_issue)) {
                              for (const issueString of item.list_issue) {
                                // Use the string directly as a keyword, after trimming
                                if (typeof issueString === 'string' && issueString.trim() !== '') {
                                  directKeywords.push(issueString.trim());
                                }
                              }
                            }

                            if (directKeywords.length > 0) {
                              const keywordsQuery = directKeywords.map(kw => `keywords=${encodeURIComponent(kw)}`).join('&');
                              console.log(`Navigating to: /${keyword}/mentions?${keywordsQuery}`);
                              navigate(`/${keyword}/mentions?${keywordsQuery}`, { replace: true });
                            } else {
                              console.log(`Navigating to: /${keyword}/mentions (no keywords)`);
                              navigate(`/${keyword}/mentions`, { replace: true });
                            }
                          } catch (error) {
                            console.error("Error processing keywords for navigation:", error);
                            // Fallback navigation: ensure 'keyword' is defined here too
                            if (typeof keyword !== 'undefined') {
                              navigate(`/${keyword}/mentions`, { replace: true });
                            } else {
                              console.error("Route parameter 'keyword' is undefined in catch block. Cannot navigate for fallback.");
                            }
                          }
                        }}
                      >
                        {item.total_posts}
                        <ArrowOutward className="topics-table-component-right-icon" />
                      </CustomText>
                    </td>
                    <td className="topic-table-reach">
                      <CustomText bold="medium" size="2xls" color="b900" inline>
                        {item.reach_score?.toFixed(2)}
                      </CustomText>
                    </td>
                    <td className="topic-table-voice">
                      <ShareOfVoice share={item.share_of_voice?.toFixed(2)} />
                    </td>
                    <td className="topic-table-sentiment">
                      <SentimentShare sentiment={item} />
                    </td>
                    <td className="topic-table-learn">
                      <CustomText
                        bold="semibold"
                        size="2xls"
                        color="brand"
                        inline
                        pointer
                        class="topics-table-component-right-flex-align"
                        onClick={() => handleClickLearnMore(item)}
                      >
                        Learn more
                        <ArrowOutward className="topics-table-component-right-icon" />
                      </CustomText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

// const data = [
//   {
//     topic: "Program makan siang gratis",
//     description:
//       "Negative sentiment towards Prabowo rose by 32% due to a viral X/Twitter tweet criticizing Prabowo's program makan siang gratis.",
//     mentions: 1212,
//     reach: "990K",
//     share: 40,
//     sentiment: { positive: 10, neutral: 20, negative: 70 }, // % values
//   },
//   {
//     topic: "Peluncuran aplikasi edukasi gratis",
//     description:
//       "Positive sentiment towards Prabowo rose by 25% due to the launch of a free education app.",
//     mentions: 561,
//     reach: "474K",
//     share: 30,
//     sentiment: { positive: 50, neutral: 30, negative: 20 },
//   },
// ];

const ShareOfVoice = ({ share }) => {
  return (
    <div className="topic-table-share-container">
      <div className="topic-table-share-chart-container">
        <div
          className="topic-table-share-chart"
          style={{ width: `${share}%` }}
        ></div>
      </div>
      <CustomText>{share}%</CustomText>
    </div>
  );
};

const SentimentShare = ({ sentiment }) => {
  const series = [sentiment.positive, sentiment.neutral, sentiment.negative];
  const options = {
    chart: {
      type: "donut",
      width: 100,
      foreColor: "#000",
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
    legend: {
      show: false,
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
      <ReactApexChart options={options} series={series} type="donut" />
    </>
  );
};

export default TopicsTable;
