import styles from "./loader.module.scss";
import {FC} from "react";

interface LoaderProps {
  size?: number; // диаметр в px
  color?: string;
}

export const Loader: FC<LoaderProps> = ({ size = 40, color = '#A7A0F8' }) => {
  return (
    <span
      className={styles.loader}
      style={{
        width: size,
        height: size,
        borderTopColor: color,
      }}
      aria-label="Загрузка..."
      role="status"
    />
  );
};
