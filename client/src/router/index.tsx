import {createContext} from "react";

export type RouteParams = Record<string, string>

type RouterContext = {
  route: string
  params: RouteParams
  setParam: (key: string, value: string) => void
  navigate: (route: string, params?: RouteParams) => void
  getRoute: () => string
}

export const RouterContext = createContext<RouterContext>({
  route: "",
  navigate: () => null,
  getRoute: () => "",
  params: {},
  setParam: () => null,
})
