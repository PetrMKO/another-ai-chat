import styled from './settings.module.scss'
import {Controller, useForm} from "react-hook-form";
import {Select} from "@/components/select";
import {useEffect, useState} from "react";
import {api, ConfigTypeNames} from "@/api/api";
import {Input} from "@/components/input";
import {Button} from "@/components/button";
import {requiredRule} from "@/pages/settings/constants";
import {useUserStore} from "@/store/user_store";
import {useConfigStore} from "@/store/configs";
import {useUpdatePreset} from "@/hooks/useUpdatePreset";

const configName = ConfigTypeNames.VSEGPT;

type VseGptFormValues = {
  apiKey: string;
  model: string;
}

export const VseGptSettings = () => {
  const {userId} = useUserStore()
  const {getConfigByName} = useConfigStore();

  const [models, setModels] = useState<{value: string, label: string}[]>([])

  const updateConfig = useUpdatePreset()

  const config = getConfigByName(configName)
  const apiKey = config?.api_key
  const model = config?.llm_name

  const form = useForm<VseGptFormValues>({
    defaultValues: {
      apiKey,
      model
    }
  })

  const onSubmit = (values: VseGptFormValues) => {

    const model = models.find(({value}) => value === values.model)

    if (values.apiKey && model && userId) {
      const data = {api_key: values.apiKey, llm_name: model.value}

      updateConfig(configName, data)
    }
  }

  useEffect(()=>{
    api.fetchModels().then((res) => {
      setModels(res.data.data.map(({id, name})=>({value: id, label: name})))
    })
  }, [models.length])



  return <form className={styled.formWrapper} onSubmit={form.handleSubmit(onSubmit)}>
    <div className={styled.content}>
      <Controller rules={requiredRule} name={'apiKey'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>API ключ</span>
          <Input error={fieldState.error?.message} placeholder={'Ключик'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
        </label>
      } />

      <Controller rules={requiredRule} name={'model'} control={form.control} render={({field, fieldState})=>
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
