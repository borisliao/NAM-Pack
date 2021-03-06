import React, { useState, useEffect } from 'react'
import Media from 'react-bootstrap/Media'
import Carousel from 'react-bootstrap/Carousel'
import { Container } from 'react-bootstrap'
import fs from 'fs-extra'
import path from 'path'

export default function Info () {
  const State = window.State
  const [instance, setInstance] = useState(State.selectedInstance)
  const [media, setMedia] = useState(updateJson())

  useEffect(() => {
    function infoHandleSelectedInstanceChange (index) {
      setInstance(index)
    }

    let fsWait = false
    const diskPath = determinePath()
    const watcher = fs.watch(diskPath, (event, filename) => {
      if (filename) {
        if (fsWait) return
        fsWait = setTimeout(() => {
          fsWait = false
        }, 100)
        setMedia(updateJson())
      }
    })

    State.subscribeSelectedInstance(infoHandleSelectedInstanceChange)

    return function cleanup () {
      State.unsubscribeSelectedInstance(infoHandleSelectedInstanceChange)
      watcher.close()
    }
  })

  function determinePath () {
    return path.join(State.workingPath, 'media.json')
  }

  function updateJson () {
    const mediaTitle = []
    const diskPath = determinePath()
    if (fs.exists(diskPath)) {
      try {
        const a = fs.readFileSync(diskPath)
        const jsonA = JSON.parse(a)
        return jsonA
        // for (const key of Object.keys(jsonA)) {
        //   mediaTitle.push(<h1 key={key}>{key}</h1>)
        // }
      } catch (e) {
        if (e.name !== 'SyntaxError' || e.name !== 'ENOENT') {
          console.error(e)
        }
        try {
          return updateJson()
        } catch (e) {
          if (e.name !== 'RangeError') {
            console.error(e)
          }
          console.error('Syntax error in media.json')
        }
      }
    }
    return mediaTitle
  }

  return (
    <Container fluid>
      <Media>
        <Media.Body>
          <Carousel>
            {!State.loading && media[State.instances[instance].name].img.map((url, index) => (
              <Carousel.Item key={url}>
                <img
                  className="d-block w-100"
                  src={url}
                />
              </Carousel.Item>
            ))}
          </Carousel>
          <h5>{!State.loading && media[State.instances[instance].name].title}</h5>
          <p>{!State.loading && media[State.instances[instance].name].description}</p>
        </Media.Body>
      </Media>
    </Container>
  )
}
