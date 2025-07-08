import {Controller, useForm} from "react-hook-form";
import styled from "@/pages/settings/settings.module.scss";
import {requiredRule} from "@/pages/settings/constants";
import {Input} from "@/components/input";
import {Button} from "@/components/button";
import { useUserStore } from "@/store/user_store";
import {useUpdatePreset} from "@/hooks/useUpdatePreset";
import {ConfigTypeNames} from "@/api/api";
import {useConfigStore} from "@/store/configs";
import {Select} from "@/components/select";

type X5CoPilotParams = {
  apiKey: string
  modelName: string
}

const models: { value: string, label: string }[] = [
  {
    value: 'x5-airun-small-prod',
    label: 'qwen 2.5 7b instruct'
  },
  {
    value: 'x5-airun-medium-prod',
    label: 'ruadapt qwen 32b instruct'
  },
  {
    value: 'x5-airun-medium-coder-prod',
    label: 'qwen 2.5 coder 32b instruct'
  },
  {
    value: 'x5-airun-small-coder-prod',
    label: 'qwen 2.5 coder 32b instruct'
  },
  {
    value: 'x5-airun-large-prod',
    label: 'qwen 2.5 72b instruct'
  }
]

const configName = ConfigTypeNames.X5_COPILOT;

export const X5CoPilotSettings = () => {
  const {userId} = useUserStore()
  const {getConfigByName} = useConfigStore();

  const apiKey = getConfigByName(configName)?.api_key
  const modelName = getConfigByName(configName)?.llm_name

  const form = useForm<X5CoPilotParams>({
    defaultValues: {
      apiKey,
      modelName
    }
  })

  const updateConfig = useUpdatePreset()

  const onSubmit = (values: X5CoPilotParams) => {

    if (values.apiKey && userId) {
      const data = {api_key: values.apiKey, llm_name: values.modelName}

      console.log(ConfigTypeNames)
      updateConfig(configName, data)
    }
  }


  return <form className={styled.formWrapper} onSubmit={form.handleSubmit(onSubmit)}>
    <div className={styled.content}>
      <Controller rules={requiredRule} name={'apiKey'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>API ключ</span>
          <Input error={fieldState.error?.message} placeholder={'Ключик'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
        </label>
      } />

      <Controller rules={requiredRule} name={'modelName'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>Модель</span>
          <Select options={models} onChange={(event) => field.onChange(event.target.value)} value={field.value} error={fieldState.error?.message}/>
        </label>
      } />

    </div>
    <div className={styled.footer}>
      <Button variant={'primary'} type={'submit'}>
        Обновить
      </Button>
    </div>

  </form>
}
