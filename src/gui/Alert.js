import React, { useState, useEffect } from 'react'
import Alert from 'react-bootstrap/Alert'

export default function AlertObj () {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState(null)
  const State = window.State

  useEffect(() => {
    function AlertHandleMessageChange (message) {
      if (State.alert) {
        setMessage(State.alert)
        setShow(true)
      }
    }

    State.subscribeAlert(AlertHandleMessageChange)

    AlertHandleMessageChange()

    return function cleanup () {
      State.unsubscribeAlert(AlertHandleMessageChange)
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
