import {api, Config, ConfigTypeNames} from "@/api/api";
import {useUserStore} from "@/store/user_store";
import {useConfigStore} from "@/store/configs";

export const useUpdatePreset = () => {
  const {userId} = useUserStore()
  const {configs, configTypes, updateConfig, selectConfig} = useConfigStore()

  return (configName: ConfigTypeNames, values: Partial<Config>) => {
    const configTypeId = configTypes[configName]

    if(userId && configTypeId){
      console.log(configs, configTypes)
      const config = configs[configTypeId]
      console.log(config, configs, configTypeId, configTypes)

      const promise = config ? api.updateConfig({id: config.id, ...values}) :  api.createConfig({user_id: userId, type_id: configTypeId, ...values})

      promise.then(({data}) =>{
        updateConfig(configTypeId, data)
        selectConfig(data)
      })
    }

  }
}
