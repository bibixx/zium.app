import styles from "./Header.module.scss";
import logoSrc from "../../../assets/logo.svg";

export const Header = () => {
  return (
    <div className={styles.wrapper}>
      <img src={logoSrc} alt="zium.app" className={styles.headerImage} draggable={false} />
    </div>
  );
};
