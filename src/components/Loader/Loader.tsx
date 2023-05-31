import Lottie from "lottie-react";
import animation from "./animation.json";

interface LoaderProps {
  width?: string | number;
  height?: string | number;
}
export const Loader = ({ height, width }: LoaderProps) => {
  return (
    <div style={{ width: getSize(width), height: getSize(height) }}>
      <Lottie animationData={animation} loop={true} />
    </div>
  );
};

const getSize = (size: string | number | undefined) => (typeof size === "number" ? `${size}px` : size);
