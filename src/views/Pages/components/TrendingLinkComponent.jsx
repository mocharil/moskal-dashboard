import CustomText from "../../../components/CustomText";
import { ArrowOutward } from "@mui/icons-material";
import { HelpOutline } from "@mui/icons-material";
import Tooltip from "@mui/joy/Tooltip";
import Pagination from "@mui/material/Pagination";
import "./styles/TrendingHashtagComponent.css"; // Note: CSS file name might need an update if it's specific to hashtags
import { formatNumber } from "../../../helpers/utils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const TrendingLinkComponent = (props) => {
  const data = props.data;
  const navigate = useNavigate();
  const activeKeywords = useSelector((state) => state.keywords.activeKeyword);

  const handleMentionClick = (linkPost) => {
    if (activeKeywords && activeKeywords.name) {
      try {
        const url = new URL(linkPost);
        const domain = url.hostname;
        navigate(`/${activeKeywords.name}/mentions?domain=${domain}`);
      } catch (error) {
        console.error("Invalid URL for trending link:", linkPost, error);
        // Optionally, navigate without domain or show an error
      }
    } else {
      console.error("Active keyword name not found, cannot navigate to mentions.");
    }
  };

  return (
    <>
      <table className="trending-hashtag-component-table"> 
        <thead>
          <tr className="trending-hashtag-component-table-header">
            <th style={{ textAlign: "left" }}>
              <CustomText color="b500" size="sss" bold="normal">
                Link
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
              key={`${value.link_post}-${index}`}
            >
              <td className="trending-hashtag-component-profile-name">
                <CustomText color="b700" bold="medium" size="2xls" inline>
                  {value.link_post}
                </CustomText>
              </td>
              <td>
                <div
                  className="trending-hashtag-component-mentions"
                  onClick={() => handleMentionClick(value.link_post)}
                  style={{ cursor: "pointer" }}
                >
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

export default TrendingLinkComponent;
