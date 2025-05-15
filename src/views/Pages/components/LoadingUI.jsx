import CustomText from "../../../components/CustomText";

const LoadingUI = () => {
  return (
    <>
      <div className="dashboard-loading-container">
        <div className="dashboard-loading-item">
          <img
            className="dashboard-loading-icon"
            src={window.location.origin + "/loading.svg"}
          />
          <CustomText color="b600" size="2xls" inLine>
            Please wait while we are applying filters and loading the data...
          </CustomText>
        </div>
      </div>
    </>
  );
};

export default LoadingUI;
