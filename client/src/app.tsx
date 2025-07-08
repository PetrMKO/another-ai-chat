import {useEffect, useState} from "react";

import "./styles/main.scss";
import {Layout} from "@/layouts/layout";
import {routes} from "@/router/routes";
import {RouteParams, RouterContext} from "@/router";
import {useUserStore} from "@/store/user_store";
import {api, UserInfo} from "@/api/api";
import {useChatSettingsStore} from "@/store/chat_settings";
import { useConfigStore } from "./store/configs";
import {useChatStore} from "@/store/chats_store";

function App() {
  const { setUserId } = useUserStore()
  const { setSystemMsg, setMsgCount } = useChatSettingsStore()
  const { setConfigTypes, setConfigs, selectConfig } = useConfigStore()
  const {setChats} = useChatStore()

  const [route, setRoute] = useState<string>("settings")
  const [params, setParams] = useState<RouteParams>({})

  const setUserSettings = (userInfo: UserInfo) => {
    setSystemMsg(userInfo.user.system_msg)
    setMsgCount(userInfo.user.msg_count)
  }

  const save = (userId: string) => {
    parent.postMessage({ pluginMessage: { type: 'save-user-id', userId } }, '*');
  };

  const updateConfigs = (userId?: string) => {
    api.fetchConfigTypes()
    .then(({data}) => {
      setConfigTypes(data)
    })

    if(userId){
      api.fetchUserConfigs(userId)
      .then(({data}) => {
        console.log(data)
        setConfigs(data)
      })
    }
  }

  const registerUser = () =>
    api.registerUser()
              .then(({data}) => {
                console.log('New user registered:', data);
                setUserSettings(data);
                setUserId(data.user.id);
                save(data.user.id);
                setChats(data.chats)
                if(data.config){
                  selectConfig(data.config);
                }
              })
              .catch(error => console.error('Error registering user:', error));


  useEffect(()=> {
    const messageHandler = (event: MessageEvent) => {

      if (event.data.pluginMessage) {
        const msg = event.data.pluginMessage;

        if (msg.type === 'load-user-id') {
          if(msg.userId){
            setUserId(msg.userId);
            api.fetchUser(msg.userId)
              .then(({data}) => {
                console.log('User data fetched:', data);
                setUserSettings(data);
                updateConfigs(msg.userId)
                setChats(data.chats)
                if(data.config){
                  selectConfig(data.config);
                }
              })
              .catch(error => {
                if(error?.response.status === 404){
                  return registerUser();
                }
              }
              );
          } else {
            registerUser()
          }
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);


  const onSetRoute = (route: string, params?: RouteParams) => {
      setRoute(route)
      setParams(params ?? {})
  }

  const onSetParams = (key: string, value: string) => setParams(prev => ({[key]: value, ...prev}))

  return (
    <RouterContext.Provider value={{
      route: route,
      navigate: onSetRoute,
      params,
      setParam: onSetParams,
      getRoute: () => route,
    }}>
        <Layout routes={routes}/>
    </RouterContext.Provider>
  );
}

export default App;
