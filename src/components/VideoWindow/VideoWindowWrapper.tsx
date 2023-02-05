import { ReactNode } from "react";

interface VideoWindowWrapperProps {
  children: ReactNode;
}

export const VideoWindowWrapper = ({ children }: VideoWindowWrapperProps) => {
  return <div className="video-window">{children}</div>;
};
