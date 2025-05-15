import "./styles/EmptyState.css";
import CustomText from "../../../components/CustomText";

const EmptyState = (props) => {
  return (
    <>
      <div className="empty-state-container">
        <div className="empty-state-box">
          <img
            className="empty-state-image"
            src={window.location.origin + "/error.svg"}
          />
          <CustomText color="b600" size="2xls" inline>
            No data was fond. Change your filter or reset them.
          </CustomText>
          <div onClick={props.resetFilter} className="empty-state-button">
            Reset filters
          </div>
        </div>
      </div>
    </>
  );
};

export default EmptyState;
