import {useContext, useEffect, useState} from "react";
import {MainInput} from "@/pages/chat/components/mainInput/mainInput";
import styles from './styles.module.scss'
import {MessageRole} from "@/types/chat";
import {classes} from "@/utils/classes.util";
import {Loader} from "@/pages/chat/components/loader/loader";
import {EmptyConfigOverlay} from "@/pages/chat/components/emptyConfigOverlay/emptyConfigOverlay";
import Markdown from 'react-markdown'
import {useConfigStore} from "@/store/configs";
import {api, GenerateMessage, MessageDTO} from "@/api/api";
import {RouterContext} from "@/router";
import {v4 as uuidv4} from 'uuid';


type ExtendedMessage = MessageDTO & {
  isLoading?: boolean,
  error?: string,
}

const getMessageContent = ({error, content}: ExtendedMessage) => {

  if (error) {
    return content
  }

  return content
}

export const Chat = () => {
  const {params} = useContext(RouterContext)
  const {selectedConfig} = useConfigStore();
  const [messages, setMessages] = useState<ExtendedMessage[]>([])

  const chatId = params.id

  useEffect(() => {
    if (chatId) {
      api.fetchChatMessages(chatId).then(({data}) => {
        const messages: ExtendedMessage[] = data.map(
          (message) => Object.assign(message, {isLoading: false})
        )
        setMessages(messages)
      })
    }
  }, [chatId])

  const updateLastMessages = (userMessage: Partial<ExtendedMessage>, assistant: Partial<ExtendedMessage>) => {
    setMessages(prev => {
      const lastAssistantMessage = prev.at(-1)
      const lastUserMessage = prev.at(-2)

      if (lastUserMessage && lastAssistantMessage) {
        return [...prev.slice(0, -2), {
          ...lastUserMessage,
          ...userMessage,
        }, {
          ...lastAssistantMessage,
          ...assistant
        }]
      }

      return prev
    })
  }

  const onSend = (value: string) => {

    const userMessage: ExtendedMessage = {
      id: uuidv4(),
      chat_id: chatId,
      created_at: new Date().toISOString(),
      role: MessageRole.USER,
      content: value
    }

    const botMessage: ExtendedMessage = {
      id: uuidv4(),
      chat_id: chatId,
      created_at: new Date().toISOString(),
      role: MessageRole.ASSISTANT,
      content: '',
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, botMessage])

    const generateMessage: GenerateMessage = {
      content: userMessage.content,
      role: userMessage.role,
    }

    api.generateResponse(chatId, generateMessage).then(({data}) => {
      updateLastMessages({...data.userMessage}, {...data.assistantMessage, isLoading: false})
    }).catch(error => {
      updateLastMessages(userMessage, {...botMessage, isLoading: false, error: error.content})
    })
  }

  return <>
    {!selectedConfig && <EmptyConfigOverlay/>}
    <div className={styles.content}>
      <div className={styles.chat}>
        {messages.map((message, index) => (
          <div className={styles.messageWrapper} key={index}>
            <div
              className={classes(styles.message, message.role == MessageRole.USER ? styles.userMessage : styles.botMessage, message.error && styles.error)}>
              {message.isLoading
                ? <div style={{padding: '20px 0'}}><Loader size={25}/></div>
                : <Markdown>
                  {getMessageContent(message)}
                </Markdown>
              }
            </div>
          </div>
        ))}
      </div>
      <MainInput onSend={onSend}/>
    </div>
  </>
}

