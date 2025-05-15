import CustomText from "../../../components/CustomText";
import { ArrowOutward } from "@mui/icons-material";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import Pagination from "@mui/material/Pagination";
import "./styles/TrendingHashtagComponent.css";
import { formatNumber } from "../../../helpers/utils";

const TrendingHashtagComponent = (props) => {
  const data = props.data;
  return (
    <>
      <table className="trending-hashtag-component-table">
        <thead>
          <tr className="trending-hashtag-component-table-header">
            <th style={{ textAlign: "left" }}>
              <CustomText color="b500" size="sss" bold="normal">
                Hashtag
              </CustomText>
            </th>
            <th>
              <div className="trending-hashtag-component-table-header-text">
                <CustomText color="b500" size="sss" bold="normal" inline>
                  Mentions
                </CustomText>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((value, index) => (
            <tr
              className="trending-hashtag-component-row"
              key={`${value.hashtag}-${index}`}
            >
              <td className="trending-hashtag-component-profile-name">
                <CustomText color="b700" bold="medium" size="2xls" inline>
                  {value.hashtag}
                </CustomText>
              </td>
              <td>
                <div className="trending-hashtag-component-mentions">
                  <CustomText color="brand" bold="semibold" size="2xls" inline>
                    {formatNumber(value.total_mentions)}
                  </CustomText>
                  <ArrowOutward sx={{ color: "#0047AB", width: "20px" }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default TrendingHashtagComponent;
