import CustomText from "./CustomText";
import { ExpandMore } from "@mui/icons-material";
import "./styles/CustomChip.css";
const CustomChip = (props) => {
  const getClass = () => {
    const classArr = ["custom-chip-container"];
    if (props.neutral) {
      classArr.push("custom-chip-neutral");
    }

    if (props.error) {
      classArr.push("custom-chip-error");
    }

    return `${classArr.join(" ")} ${props.class}`;
  };
  return (
    <>
      <div className={getClass()}>
        <CustomText inline>{props.children}</CustomText>
        {props.isDownIcon && (
          <ExpandMore sx={{ width: 12, height: 12, color: "#717680" }} />
        )}
      </div>
    </>
  );
};

export default CustomChip;
