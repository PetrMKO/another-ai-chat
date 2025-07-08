import styles from './mainInput.module.scss'
import {ChangeEventHandler, FC, KeyboardEventHandler, useEffect, useRef, useState} from "react";
import SendIcon from '@/assets/send_icon.svg?component'

type Props = {
  onSend: (value: string) => void
}

const MAX_ROWS = 4;

function getLineCount(str: string) {
  return (str.match(/\n/g) || []).length + 1;
}

export const MainInput: FC<Props> = ({onSend}) => {
  const [value, setValue] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      onSend?.(value.trim());
      setValue('');
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto'; // reset to shrink if needed
    const lines = getLineCount(value);
    const maxRows = Math.min(lines, MAX_ROWS);

    if (lines <= MAX_ROWS) {
      textarea.style.overflowY = 'hidden';
      textarea.rows = maxRows;
      textarea.style.height = textarea.scrollHeight + 'px';
    } else {
      textarea.rows = MAX_ROWS;
      textarea.style.overflowY = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Make sure textarea height is set on mount and when value changes
  useEffect(() => {
    autoResize();
    // eslint-disable-next-line
  }, [value]);

  return (<div className={styles.textContainer}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        rows={1}
      />
    <button
      className={styles.sendButton}
      type="button"
      onClick={handleSend}
      disabled={!value.trim()}
    >
      <SendIcon/>
    </button>
  </div>)
}
