import styles from "./Modal.module.scss";
import {Button} from "@/components/button";
import {useContext} from "react";
import {RouterContext} from "@/router";

export const EmptyConfigOverlay = () => {
  const {navigate} = useContext(RouterContext)

  const onNavigate = () => {
    navigate('settings')
  }

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // предотвращает закрытие при клике по модалке
      >
        <h2 className={styles.title}>Старт</h2>
        <div className={styles.content}>Для начала работы перейдите в настройки и выберите</div>
        <Button onClick={onNavigate} variant={"primary"}>Перейти в настройки</Button>
      </div>
    </div>
  );
}
