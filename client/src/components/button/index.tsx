import styles from './button.module.scss';
import {ButtonHTMLAttributes, FC} from "react";
import {classes} from "@/utils/classes.util";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string;
}

export const Button: FC<ButtonProps> = ({
                                         children,
                                         variant = 'primary',
                                         fullWidth = false,
                                         className = '',
                                         ...props
                                       }) =>
  (
    <button
      className={classes(
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        className)
      }
      {...props}
    >
      {children}
    </button>
  );
