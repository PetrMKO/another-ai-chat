import {FC, ReactNode} from "react";
import styled from "./styles.module.scss"
import {classes} from "@/utils/classes.util";
type Props = {
  icon: ReactNode
  title: string
  active: boolean
  onClick: ()=>void
}

export const RouteButton: FC<Props> = ({icon, title, active, onClick}) => {
  return <button className={classes(styled.routeButton, active && styled.active)} onClick={onClick}>
    {icon}
    {title}
  </button>
}
