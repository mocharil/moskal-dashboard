import { Button, Dialog } from "@mui/material";
import "./styles/DialogDateFilter.css";
import { DateRangePicker } from "react-date-range";
import { useState } from "react";
import "react-date-range/dist/styles.css"; // Main style file
import "react-date-range/dist/theme/default.css"; // Theme css file

const DialogDateFilter = (props) => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const transformData = () => {
    const data = {
      date_filter: "custom",
      custom_start_date: state[0].startDate.toISOString().slice(0, 10),
      custom_end_date: state[0].endDate.toISOString().slice(0, 10),
    };

    return data;
  };
  const handleClickApply = () => {
    props.handleChangeFilter(transformData());
    props.onClose();
  };
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      scroll="body"
      maxWidth="xl"
      // setFullWidth={true}
    >
      <div className="dialog-date-filter-container">
        <div>
          <DateRangePicker
            onChange={(item) => setState([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={state}
          />
          <div className="dialog-date-filter-button-container">
            <Button variant="outlined" color="grey" onClick={props.onClose}>
              Cancel
            </Button>
            <Button variant="outlined" color="grey" onClick={handleClickApply}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DialogDateFilter;
