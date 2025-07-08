import React, {FC} from 'react';
import styles from './select.module.scss';
import {classes} from "@/utils/classes.util";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;

type Props = {
  options: { value: string; label: string }[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string | null;
  error?: string;
};

export const Select: FC<Props> = ({ options, onChange, error, value }) => (
  <div className={styles.selectWrapper}>
    <select className={classes(styles.select, error && styles.error)} onChange={onChange} value={value ?? undefined}>
      <option value={''}>
        Выберите
      </option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className={styles.errorText}>{error}</p>}
  </div>
);
