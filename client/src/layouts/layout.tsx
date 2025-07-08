import './layout.scss'
import {FC, useContext} from "react";
import {Routes} from "@/router/routes";
import {RouterContext} from "@/router";
import {Sidebar} from "@/layouts/sidebar/sidebar";

type Props = {
  routes: Routes
}

const getComponent = (route: string, routes: Routes) => {
    if(!route) {
      return routes.default
    }

    if(!routes[route]) {
      return routes.notFound
    }

    return routes[route]
}


export const Layout: FC<Props> = ({routes}) => {
  const {route} = useContext(RouterContext)
  const component = getComponent(route, routes)

  return (
    <div className="layout">
      <Sidebar/>
      <div className="contentLayout">

        <div className="content">
          {component}
        </div>
      </div>
    </div>
  )
}
