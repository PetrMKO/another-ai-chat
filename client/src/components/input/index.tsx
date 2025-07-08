import styles from './input.module.scss';
import {ChangeEvent, FC} from "react";


type InputProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const Input: FC<InputProps> = ({
                 value,
                 onChange,
                 error,
                 type = 'text',
                 multiline = false,
                 rows = 3,
                 placeholder,
                 ...props
               }) => (
  <div className={`${styles.inputWrapper} ${multiline ? styles.multiline : ''}`}>
    {multiline ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${styles.textarea} ${error ? styles.error : ''}`}
        rows={rows}
        {...props}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
    )}
    {error && <p className={styles.errorText}>{error}</p>}
  </div>
);
