import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

interface LogoProps extends SvgProps {
  isDark: boolean;
}

const Logo: React.FC<React.PropsWithChildren<LogoProps>> = ({ isDark, ...props }) => {
  const textColor = isDark ? "#FFFFFF" : "#000000";
  return (
    // <Svg width="150" height="59" iewBox="0 0 1281 199" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Svg width="150" height="40" viewBox="30 0 140 55" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="1.61084" width="9.87919" height="51.2752" rx="4.9396" fill="#3B0699" />
      <rect x="46.98" y="1.61084" width="9.87919" height="51.2752" rx="4.9396" fill="#3B0699" />
      <rect x="112.43" y="26.5771" width="9.87919" height="9.87919" rx="4.9396" fill="#E3317D" />
      <rect x="25.0737" y="43.1677" width="9.87919" height="9.87919" rx="4.9396" fill="#E3317D" />
      <rect x="61.6914" y="23.8389" width="9.87919" height="9.87919" rx="4.9396" fill="#E3317D" />
      <rect
        x="46.98"
        y="11.49"
        width="9.87919"
        height="34.3087"
        rx="4.9396"
        transform="rotate(-90 46.98 11.49)"
        fill="#3B0699"
      />
      <rect
        x="2.3623"
        y="52.886"
        width="9.87919"
        height="18.1476"
        rx="4.9396"
        transform="rotate(-90 2.3623 52.886)"
        fill="#3B0699"
      />
      <rect x="129.235" y="26.6309" width="9.87919" height="23.0872" rx="4.9396" fill="#3B0699" />
      <path
        d="M133.871 32.9666C136.721 32.7418 139.173 35.6752 139.055 38.5314C138.868 43.0658 139.074 47.7232 135.678 49.8097C130.681 52.8798 119.071 55.033 113.317 54.255C107.564 53.477 102.225 50.4681 98.1474 46.1709C94.0698 41.8737 91.4872 36.2818 90.8093 30.2823C90.1314 24.2827 91.3971 18.2193 94.4055 13.0541C97.4139 7.88884 101.993 3.9176 107.416 1.77048C112.838 -0.376637 118.795 -0.576658 124.339 1.20215C128.343 2.48669 131.966 4.75002 134.922 7.7737C136.804 9.6991 136.13 12.7712 133.847 14.1982V14.1982C131.665 15.5617 128.789 14.8484 126.581 13.5274C124.996 12.5789 123.191 11.9487 121.335 11.3532C117.963 10.2713 114.34 10.3929 111.042 11.6989C107.743 13.0049 104.958 15.4204 103.128 18.5621C101.298 21.7039 100.528 25.3919 100.941 29.0411C101.353 32.6903 102.924 36.0916 105.404 38.7053C107.884 41.3191 111.132 42.9956 114.631 43.4688C118.131 43.942 125.551 43.6929 128.591 41.8255C130.909 40.4008 130.576 38.0965 130.863 35.566C131.032 34.0665 132.367 33.0853 133.871 32.9666V32.9666Z"
        fill="#3B0699"
      />
    </Svg>
  );
};

export default React.memo(Logo, (prev, next) => prev.isDark === next.isDark);
