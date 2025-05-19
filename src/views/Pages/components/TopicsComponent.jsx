import { useEffect, useState } from "react";
import CustomText from "../../../components/CustomText";
import { ArrowOutward, NorthEast } from "@mui/icons-material"; // Added NorthEast
import { useNavigate, useParams } from "react-router-dom";

import "./styles/TopicsComponent.css";
import { formatNumber } from "../../../helpers/utils";
import { addTopics } from "../../../helpers/redux/slice/topicSlice";
import { useDispatch } from "react-redux";

const TopicsComponent = (props) => {
  const { keyword } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [positive, setPositive] = useState(0);
  const [negative, setNegative] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [mentions, setMentions] = useState("");
  const data = props.data;

  useEffect(() => {
    const total = data.positive + data.negative + data.neutral;
    setPositive(((data.positive / total) * 100).toFixed(2));
    setNegative(((data.negative / total) * 100).toFixed(2));
    setNeutral(((data.neutral / total) * 100).toFixed(2));
    setMentions(formatNumber(data.total_posts));
  });

  const redirectTopicDetail = () => {
    dispatch(
      addTopics({
        topics: data,
        expiresInDays: 30,
      })
    );
    console.log(data);
    navigate(`/${keyword}/topics-detail`, { replace: true });
  };

  const redirectToMentions = () => {
    navigate(`/${keyword}/mentions?keywords=list_issue`, { replace: true });
  };

  return (
    <>
      <div
        className={`topics-component-container ${
          props.borderBottom && "topics-component-border-bottom"
        }`}
      >
        <div className="topics-component-header">
          <CustomText bold="medium" size="xls" color="b900" inline>
            {data.unified_issue}
          </CustomText>
          <CustomText
            bold="semibold"
            size="2xls"
            color="brand"
            inline
            pointer
            class="topics-component-right-flex-align"
            onClick={redirectTopicDetail}
          >
            Learn more
            <ArrowOutward className="topics-component-right-icon" />
          </CustomText>
        </div>
        <CustomText color="b500" size="2xls">
          {data.description}
        </CustomText>
        <div className="topics-component-stat-container">
          <CustomText
            color="b600"
            size="sss"
            inline
            pointer
            onClick={redirectToMentions}
            class="topics-component-right-flex-align"
          >
            {mentions} Mentions
            <NorthEast
              className="topics-component-right-icon" // Use the same class as the working "Learn more" icon
            />
          </CustomText>
          <div className="topics-component-bullet-grey"></div>
          <div className="topics-component-bullet-gradient topics-gradient-green"></div>
          <CustomText color="g700" size="sss" inline>
            {positive}% positive
          </CustomText>
          <div className="topics-component-bullet-grey"></div>
          <div className="topics-component-bullet-gradient topics-gradient-red"></div>
          <CustomText color="r700" size="sss" inline>
            {negative}% negative
          </CustomText>
          <div className="topics-component-bullet-grey"></div>
          <div className="topics-component-bullet-gradient topics-gradient-gray"></div>
          <CustomText color="b600" size="sss" inline>
            {neutral}% neutral
          </CustomText>
        </div>
      </div>
    </>
  );
};

export default TopicsComponent;
