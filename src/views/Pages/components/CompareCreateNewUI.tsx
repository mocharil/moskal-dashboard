import React from "react";
import CustomText from "../../../components/CustomText";
import CustomButton from "../../../components/CustomButton";

const CompareCreateNewUI = () => {
    return (
        <>
            <div style={{ width: "100%", height: "100%", display: "flex", gap: '24px', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div>
                    <img
                        className="comparison-compare-projects-create-new-icon"
                        src={window.location.origin + "/project.svg"}
                    />
                </div>
                <CustomText color="b600" size="2xls">
                    Create a new project keywords to compare with.
                </CustomText>
                <CustomButton sx={{ padding: "8px 16px" }}>
                    <CustomText bold="semibold" size="xls" inline>
                        Create a new project
                    </CustomText>
                </CustomButton>
            </div>

        </>
    )
}

export default CompareCreateNewUI;