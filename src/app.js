import React from 'react'
import Navbar from './gui/MainNavbar'
import Info from './gui/Info'
import Alert from './gui/Alert'
import Selector from './gui/Selector'

export default function App () {
  return (
    <>
      <Navbar />
      <Alert />
      <Info />
      <Selector />
    </>
  )
}
