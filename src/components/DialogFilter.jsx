import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";

const DialogFilter = (props) => {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={props.open}
      onClose={props.closeDialog}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    ></Modal>
  );
};

export default DialogFilter;
