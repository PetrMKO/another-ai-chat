import {useContext} from "react";
import {RouterContext} from "@/router";
import styles from './styles.module.scss'
import {RouteButton} from "@/layouts/sidebar/routeButton";
import Chat from "@/assets/chat_bubble.svg?component"
import Settings from "@/assets/settings_icon.svg?component"
import NewChat from "@/assets/new_chat_icon.svg?component"
import {ConfigDescription} from "@/layouts/sidebar/configDescription";
import {useChatStore} from "@/store/chats_store";
import {format} from "@formkit/tempo";
import {api} from "@/api/api";
import {useUserStore} from "@/store/user_store";

export const Sidebar = () => {
  const {userId} = useUserStore()
  const {route, params, navigate} = useContext(RouterContext);

  const {chats, addChat} = useChatStore()

  const onOpenChat = (chatId: string) => {
    navigate('chat', {id: chatId})
  }

  const onCreateChat = () => {
    if(userId){
      api.createChat(userId).then(({data})=>{
        addChat(data)
        onOpenChat(data.id)
      })
    }
  }

  const onOpenSettings = () => {
    navigate('settings')
  }


  return <div className={styles.sidebar}>
    <div className={styles.mainContent}>
      <RouteButton title="Новый чат" active={false} onClick={onCreateChat} icon={<NewChat/>}/>

      <div className={styles.chats}>
        {chats.map(({id, created_at})=>
          <RouteButton title={format(created_at, 'D.M.YY H:m')} active={route == 'chat' && params.id === id} onClick={() => onOpenChat(id)} icon={<Chat fill="currentColor"/>}/>
        )}
      </div>
    </div>
    <div className={styles.footer}>
      <RouteButton title="Настройки" active={route == 'settings'} onClick={onOpenSettings} icon={<Settings/>}/>
    </div>

    <ConfigDescription/>
  </div>
}

