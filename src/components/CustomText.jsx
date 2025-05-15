import "./styles/CustomText.css";

const CustomText = (props) => {
  const getClassName = () => {
    const classArr = [];
    if (props.size) {
      classArr.push(`font-${props.size}`);
    }
    if (props.bold) {
      classArr.push(`font-${props.bold}`);
    }
    if (props.color) {
      classArr.push(`font-${props.color}`);
    }
    if (props.pointer) {
      classArr.push("font-pointer");
    }
    return `${classArr.join(" ")} ${props.class}`;
  };
  return (
    <>
      <span className={getClassName()} onClick={props.onClick}>
        {props.children}
      </span>
      {!props.inline && <br />}
    </>
  );
};

export default CustomText;
