import CustomText from "../../../components/CustomText";

const NoDataUI = (props) => {
  const text = props.text;
  return (
    <>
      <div className="dashboard-loading-container">
        <div className="dashboard-loading-item">
          <img
            className="dashboard-loading-icon"
            src={window.location.origin + "/error.svg"}
          />
          <CustomText color="b600" size="2xls" inLine>
            {text
              ? text
              : "No data was found. Change your filter or reset them."}
          </CustomText>
        </div>
      </div>
    </>
  );
};

export default NoDataUI;
