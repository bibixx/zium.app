import cn from "classnames";
import styles from "./Input.module.scss";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  icon?: (props: React.SVGProps<SVGSVGElement>) => JSX.Element | null;
}
export const Input = ({ className, icon: Icon, ...props }: InputProps) => {
  return (
    <label className={styles.wrapper}>
      {Icon && (
        <div className={styles.iconWrapper}>
          <Icon width={20} height={20} fill="currentColor" />
        </div>
      )}
      <input className={cn(styles.input, className)} {...props} />
    </label>
  );
};
