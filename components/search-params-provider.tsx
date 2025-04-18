"use client"

import type React from "react"

import { createContext, useContext } from "react"

type SearchParamsContextType = {
  searchParams: { [key: string]: string | string[] | undefined }
}

const SearchParamsContext = createContext<SearchParamsContextType>({
  searchParams: {},
})

export function SearchParamsProvider({
  children,
  searchParams,
}: {
  children: React.ReactNode
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return <SearchParamsContext.Provider value={{ searchParams }}>{children}</SearchParamsContext.Provider>
}

export function useSearchParams() {
  return useContext(SearchParamsContext)
}
