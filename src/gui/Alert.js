import React, { useState, useEffect } from 'react'
import Alert from 'react-bootstrap/Alert'

export default function Selector () {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState(null)
  const State = window.State

  useEffect(() => {
    function selectorHandleMessageChange (message) {
      if (State.alert) {
        setMessage(State.alert)
        setShow(true)
      }
    }

    State.subscribeAlert(selectorHandleMessageChange)

    selectorHandleMessageChange()

    return function cleanup () {
      State.unsubscribeAlert(selectorHandleMessageChange)
    }
  })

  let alertMessage
  if (show) {
    alertMessage =
      <Alert variant="primary">
        <Alert.Heading>Server Message</Alert.Heading>
        <p>{message}</p>
      </Alert>
  }

  return (<div>{alertMessage}</div>)
}
