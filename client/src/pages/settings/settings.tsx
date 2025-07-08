import {ReactNode, useState} from "react";
import styles from './settings.module.scss'
import {classes} from "@/utils/classes.util";
import {VseGptSettings} from "@/pages/settings/vseGptSettings";
import {X5CoPilotSettings} from "@/pages/settings/x5CoPilotSettings";
import {OwnConfigSettings} from "@/pages/settings/ownConfigSettings";
import {ChatSettings} from "@/pages/settings/chatSettings";
import { ConfigTypeNames } from "@/api/api";

enum TabsValues {
  CHAT_SETTINGS = 'chat_settings',
}

type Tab = {
  title: string,
  value: TabsValues | ConfigTypeNames
}


const tabs: Tab[] = [
  {
    title: 'Настройки чата',
    value: TabsValues.CHAT_SETTINGS
  },
  {
    title: 'VseGPT',
    value: ConfigTypeNames.VSEGPT
  },
  {
    title: 'X5 CoPilot',
    value: ConfigTypeNames.X5_COPILOT
  },
  {
    title: 'Своя конфигурация',
    value: ConfigTypeNames.OWN_CONFIG
  },
]


const components: Record<TabsValues | ConfigTypeNames, ReactNode> = {
  [TabsValues.CHAT_SETTINGS]: <ChatSettings/>,
  [ConfigTypeNames.VSEGPT]: <VseGptSettings/>,
  [ConfigTypeNames.X5_COPILOT]: <X5CoPilotSettings/>,
  [ConfigTypeNames.OWN_CONFIG]: <OwnConfigSettings/>,
}

export const Settings = () => {
  const [selectedPreset, setSelectedPreset] = useState<TabsValues | ConfigTypeNames>(TabsValues.CHAT_SETTINGS)

  return <div className={styles.container}>
    <div className={styles.tabsContainer}>
      {tabs.map(({title, value}) =>
        <button onClick={() => setSelectedPreset(value)}
                className={classes(styles.tab, value == selectedPreset && styles.selected)}><span>{title}</span>
        </button>
      )}
    </div>
    <div className={styles.settingContainer}>
      {components[selectedPreset]}
    </div>
  </div>

}
