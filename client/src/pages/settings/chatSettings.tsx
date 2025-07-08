import {Controller, useForm} from "react-hook-form";
import styled from "@/pages/settings/settings.module.scss";
import {requiredRule} from "@/pages/settings/constants";
import {Input} from "@/components/input";
import {Button} from "@/components/button";
import {useUserStore} from "@/store/user_store";
import {api} from "@/api/api";
import {useChatSettingsStore} from "@/store/chat_settings";
import {useEffect} from "react";
import {RagSettings} from "@/pages/settings/ragSettings";

type ChatSettingsValues = {
  messagesToSend: string,
  systemMessage: string,
  ragFilename: string | null
}

export const ChatSettings = () => {
  const { userId } = useUserStore()
  const { setSystemMsg, setMsgCount, system_msg, msg_count } = useChatSettingsStore()

  const form = useForm<ChatSettingsValues>({
    defaultValues: {
      messagesToSend: String(msg_count),
      systemMessage: system_msg,
      ragFilename: null
    }
  })

  useEffect(() => {
    form.reset({
      messagesToSend: String(msg_count),
      systemMessage: system_msg,
    })
  }, [system_msg, msg_count])

  const onSubmit = ({systemMessage, messagesToSend}: ChatSettingsValues) => {
    if(userId) {
      api.updateUserSettings({
        id: userId,
        system_msg: systemMessage,
        msg_count: Number(messagesToSend),
      }).then(({data: {system_msg, msg_count}}) => {
        setSystemMsg(system_msg)
        setMsgCount(msg_count)

        form.reset({
          messagesToSend: String(msg_count),
          systemMessage: system_msg,
        })
      })
    }
  }

  return <form className={styled.formWrapper} onSubmit={form.handleSubmit(onSubmit)}>
    <div className={styled.content}>

      <Controller rules={requiredRule} name={'messagesToSend'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>Количество сообщений в контексте</span>
          <Input error={fieldState.error?.message} type="number" placeholder={'10'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
        </label>
      } />
      <Controller rules={requiredRule} name={'systemMessage'} control={form.control} render={({field, fieldState})=>
        <label className={styled.label}>
          <span>Системное сообщение</span>
          <Input multiline rows={5} error={fieldState.error?.message} placeholder={'Сообщение'} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ''}/>
        </label>
      } />

      <RagSettings/>
    </div>
    <div className={styled.footer}>
      <Button variant={'primary'} type={'submit'}>
        Обновить
      </Button>
    </div>

  </form>
}
