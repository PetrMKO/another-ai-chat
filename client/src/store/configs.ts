import { create } from 'zustand'
import {Config, ConfigTypeNames, ConfigType} from "@/api/api";

type ConfigWithName = Config & {
  name: ConfigTypeNames
}

type ConfigState = {
    configTypes: Partial<Record<ConfigTypeNames, ConfigType['id']>>
    configNames: Partial<Record<string, ConfigTypeNames>>
    configs: Partial<Record<string, Config>>
    selectedConfig: Config | null
}

type ConfigAction = {
    setConfigs: (configs: Config[]) => void
    setConfigTypes: (configTypes: ConfigType[]) => void
    updateConfig: (name: string, config: Config) => void
    selectConfig: (config: Config) => void
    getConfigByName: (configName: ConfigTypeNames) => null | Config
}

type ConfigStore = ConfigState & ConfigAction

export const useConfigStore = create<ConfigStore>(
    (set, get) => ({
      selectedConfig: null,
      configs: {},
      configTypes: {},
      configNames: {},
      selectConfig: (config) => set({selectedConfig: config }),
      setConfigTypes: (configTypes) => {
        const configTypesMap = Object.fromEntries(configTypes.map(({id, name})=>([name, id]))) as ConfigState['configTypes']
        const configNamesMap = Object.fromEntries(configTypes.map(({id, name})=>([id, name]))) as ConfigState['configNames']
        set({configTypes: configTypesMap,  configNames: configNamesMap})
      },
      setConfigs: (configs) => {
        const configsMap = Object.fromEntries(configs.map((config) => ([config.type_id, config]))) as ConfigState['configs']
        set({ configs: configsMap })
        },
      updateConfig: (name,  config) => {
        set({configs: {...get().configs, [name]: config}})
      },
      getConfigByName: (configName) => {
        const {configTypes, configs} = get()
        const configTypeId = configTypes[configName]

        return configTypeId ? configs[configTypeId] ?? null : null
      }
    })
)
