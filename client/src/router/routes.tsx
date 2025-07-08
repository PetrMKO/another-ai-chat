import {ReactNode} from "react";
import {Settings} from "@/pages/settings/settings";
import {Chat} from "@/pages/chat";

export type Routes = {
  notFound: ReactNode
  [key: string]: ReactNode
}

export const routes: Routes = {
  notFound: <div>Not found</div>,
  chat: <Chat/>,
  settings: <Settings/>
}
