import styles from "./Header.module.scss";
import logoSrc from "../../../assets/logo.svg";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div className={styles.wrapper}>
      <Link to="/">
        <img src={logoSrc} alt="zium.app" />
      </Link>
    </div>
  );
};
