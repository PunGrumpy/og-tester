import { useEffect } from 'react'

export const useConsoleLogo = () => {
  useEffect(() => {
    console.log(`
██████╗ ██╗   ██╗███╗   ██╗
██╔══██╗██║   ██║████╗  ██║
██████╔╝██║   ██║██╔██╗ ██║
██╔═══╝ ██║   ██║██║╚██╗██║
██║     ╚██████╔╝██║ ╚████║
╚═╝      ╚═════╝ ╚═╝  ╚═══╝
Developing and building that shit.`)
  }, [])
}
