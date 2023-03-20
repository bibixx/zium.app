import { Logo } from "../../../components/Logo/Logo";
import styles from "./Header.module.scss";

export const Header = () => {
  return (
    <div className={styles.wrapper}>
      <Logo height={32} width={88} color={"var(--color-text-strong)"} />
    </div>
  );
};
