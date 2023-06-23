import { ReactComponent as ArrowLeft30Svg } from "../../assets/custom-icons/arrow-left-30.svg";
import { ReactComponent as ArrowRight30Svg } from "../../assets/custom-icons/arrow-right-30.svg";
import { ReactComponent as DoubleEllipsisSvg } from "../../assets/custom-icons/double-ellipsis.svg";
import { ReactComponent as Practice1Svg } from "../../assets/custom-icons/practice-1.svg";
import { ReactComponent as Practice2Svg } from "../../assets/custom-icons/practice-2.svg";
import { ReactComponent as Practice3Svg } from "../../assets/custom-icons/practice-3.svg";
import { ReactComponent as QualificationsSvg } from "../../assets/custom-icons/qualifications.svg";
import { ReactComponent as RaceSvg } from "../../assets/custom-icons/race.svg";
import { ReactComponent as SprintShootoutSvg } from "../../assets/custom-icons/sprint-shootout.svg";
import { ReactComponent as SprintSvg } from "../../assets/custom-icons/sprint.svg";
import { ReactComponent as FigmaSvg } from "../../assets/custom-icons/figma.svg";
import { ReactComponent as GitHubSvg } from "../../assets/custom-icons/github.svg";
import { ReactComponent as TwitterSvg } from "../../assets/custom-icons/twitter.svg";
import styles from "./CustomIcons.module.scss";

export const ArrowLeft30Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <ArrowLeft30Svg className={styles.wrapper} {...props} />;
};

export const ArrowRight30Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <ArrowRight30Svg className={styles.wrapper} {...props} />;
};

export const DoubleEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <DoubleEllipsisSvg className={styles.wrapper} {...props} />;
};

export const Practice1Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <Practice1Svg className={styles.wrapper} {...props} />;
};

export const Practice2Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <Practice2Svg className={styles.wrapper} {...props} />;
};

export const Practice3Icon = (props: React.SVGProps<SVGSVGElement>) => {
  return <Practice3Svg className={styles.wrapper} {...props} />;
};

export const QualificationsIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <QualificationsSvg className={styles.wrapper} {...props} />;
};

export const RaceIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <RaceSvg className={styles.wrapper} {...props} />;
};

export const SprintShootoutIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <SprintShootoutSvg className={styles.wrapper} {...props} />;
};

export const SprintIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <SprintSvg className={styles.wrapper} {...props} />;
};

export const FigmaIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <FigmaSvg className={styles.wrapper} {...props} />;
};

export const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <GitHubSvg className={styles.wrapper} {...props} />;
};

export const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return <TwitterSvg className={styles.wrapper} {...props} />;
};
