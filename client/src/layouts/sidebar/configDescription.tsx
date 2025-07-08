import {FC} from "react";
import styles from "@/layouts/sidebar/styles.module.scss";
import {useConfigStore} from "@/store/configs";
import {ConfigTypeNames} from "@/api/api";
import {useRagStore} from "@/store/fileStore";

const Label: FC<{text: string, isTitle?: boolean}> = ({text, isTitle}) => <span className={isTitle ? styles.configTitle : styles.configText}>{text}</span>

const Setting: FC<{name: string, value: string}> = ({name, value}) => {
  return <div className={styles.setting}>
    <Label text={name} isTitle/>
    <Label text={value}/>
  </div>
}

export const ConfigDescription = () => {
  const {selectedConfig, configNames} = useConfigStore()
  const {rag} = useRagStore()

  const configName = selectedConfig ? configNames[selectedConfig.type_id] : undefined

  const getDescription = () => {
    const config = {
      ...selectedConfig,
      configName
    }

    if(config.configName == ConfigTypeNames.OWN_CONFIG){
      return 'Своя конфигурация'
    }
    else return config?.llm_name ?? 'Не настроено'
  }

  const description = getDescription()

    return (<div className={styles.configDescription}>
      <span className={styles.title}>Настройки</span>
      <Setting name={'Конфигурация:'} value={description}/>
      <Setting name={'RAG:'} value={rag?.file_name ?? 'Отключен'}/>
    </div>)
}
