import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 198 199" {...props}>
      {/* <Svg width="133" height="198" viewBox="0 0 133 198" fill="none" xmlns="http://www.w3.org/2000/svg"> */}
      <rect width="38.1487" height="198" rx="19.0743" fill="#3B0699" />
      <rect x="56.8083" y="85.8345" width="38.1487" height="38.1487" rx="19.0743" fill="#E3317D" />
      <rect
        y="38.1487"
        width="38.1487"
        height="132.484"
        rx="19.0743"
        transform="rotate(-90 0 38.1487)"
        fill="#3B0699"
      />
      {/* </svg> */}
    </Svg>
  );
};

export default Icon;
