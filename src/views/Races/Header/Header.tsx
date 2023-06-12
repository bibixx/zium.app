import { ArrowRightOnRectangleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { Logo } from "../../../components/Logo/Logo";
import { logOut } from "../../../utils/extensionApi";
import styles from "./Header.module.scss";

export const HEADER_HEIGHT = 92;

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (newValue: string) => void;
}
export const Header = ({ searchQuery, setSearchQuery }: HeaderProps) => {
  return (
    <>
      <div className={styles.wrapper}>
        <Logo height={32} width={88} color={"var(--color-text-strong)"} />
        <div className={styles.rightContent}>
          <div className={styles.inputWrapper}>
            <Input
              isRounded
              placeholder="Search"
              icon={MagnifyingGlassIcon}
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              canClear
            />
          </div>
          <Button variant="Tertiary" iconRight={ArrowRightOnRectangleIcon} onClick={logOut}>
            Log out
          </Button>
        </div>
      </div>
      <div className={styles.shadow}>
        <div />
        <div />
      </div>
    </>
  );
};
