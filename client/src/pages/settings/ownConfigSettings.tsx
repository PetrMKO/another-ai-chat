import {Controller, useForm} from "react-hook-form";
import styled from "@/pages/settings/settings.module.scss";
import {requiredRule} from "@/pages/settings/constants";
import {Input} from "@/components/input";
import {Button} from "@/components/button";
import {ConfigTypeNames} from "@/api/api";
import {useUpdatePreset} from "@/hooks/useUpdatePreset";
import {useConfigStore} from "@/store/configs";

type OwnPresetParams = {
  url: string
  apiKey: string
  llm_name: string
}

const configName = ConfigTypeNames.OWN_CONFIG

export const OwnConfigSettings = () => {
  const updateConfig = useUpdatePreset()
  const {getConfigByName} = useConfigStore();

  const config = getConfigByName(configName)

  const apiKey = config?.api_key

  const url = config?.url

  const llm_name = config?.llm_name

  const form = useForm<OwnPresetParams>({
    defaultValues: {
      url,
      apiKey,
      llm_name
    }
  })

  const onSubmit = (values: OwnPresetParams) => {

    if (values.apiKey) {
      const data = {api_key: values.apiKey, url: values.url, llm_name: values.llm_name}
      updateConfig(configName, data)
    }
  }

  return <form className={styled.formWrapper} onSubmit={form.handleSubmit(onSubmit)}>
    <div className={styled.content}>
      <Controller rules={requiredRule} name={'url'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>URL</span>
          <Input error={fieldState.error?.message} placeholder={'https://'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
        </label>
      } />
      <Controller rules={requiredRule} name={'apiKey'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>API ключ</span>
          <Input error={fieldState.error?.message} placeholder={'Ключик'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
        </label>
      } />

      <Controller rules={requiredRule} name={'llm_name'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>Название модели</span>
          <Input error={fieldState.error?.message} placeholder={'LLama'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
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
