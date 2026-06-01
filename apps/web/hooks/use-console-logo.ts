let logged = false

export const useConsoleLogo = () => {
  if (logged || typeof window === 'undefined') {
    return
  }

  logged = true
  console.log(`
██████╗ ██╗   ██╗███╗   ██╗
██╔══██╗██║   ██║████╗  ██║
██████╔╝██║   ██║██╔██╗ ██║
██╔═══╝ ██║   ██║██║╚██╗██║
██║     ╚██████╔╝██║ ╚████║
╚═╝      ╚═════╝ ╚═╝  ╚═══╝
Developing and building that shit.`)
}
