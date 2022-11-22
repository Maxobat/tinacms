/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react'
import { useMachine } from '@xstate/react'
import { queryMachine, initialContext } from './lib/machines/query-machine'
import { useCMS, defineConfig } from 'tinacms'

type Config = Parameters<typeof defineConfig>[0]

type PostMessage = {
  type: 'open' | 'close' | 'isEditMode'
  id: string
  data: object
}

export const Preview = (
  props: Config & {
    url: string
    iframeRef: React.MutableRefObject<HTMLIFrameElement>
  }
) => {
  const cms = useCMS()
  const [activeQuery, setActiveQuery] = React.useState<PostMessage | null>(null)

  React.useEffect(() => {
    if (props.iframeRef.current) {
      window.addEventListener('message', (event: MessageEvent<PostMessage>) => {
        if (event.data.type === 'open') {
          setActiveQuery(event.data)
        }
      })
    }
  }, [props.iframeRef.current])

  const hotkey = useKeyPress('Shift', props.iframeRef.current)

  const tinaFields = React.useMemo(() => {
    if (!hotkey) {
      return []
    }
    if (props.iframeRef.current) {
      const tinaFieldNodes =
        props.iframeRef.current.contentWindow?.document.querySelectorAll(
          '[data-tinafield]'
        )
      return Array.from(tinaFieldNodes)
    }
    return []
  }, [hotkey])

  return (
    <div className="tina-tailwind">
      {activeQuery && (
        <QueryMachine
          key={activeQuery.id}
          payload={activeQuery}
          iframeRef={props.iframeRef}
        />
      )}
      <div className="h-full overflow-scroll">
        <div className="">
          <div className="col-span-5 ">
            <div className="h-screen flex flex-col">
              <div className="relative flex-1 bg-gray-300 col-span-2 overflow-scroll flex items-center justify-center">
                <div
                  className={`absolute inset-0 ${
                    hotkey ? '' : 'pointer-events-none'
                  }`}
                >
                  {tinaFields.map((node, index) => {
                    const rect = node.getBoundingClientRect()
                    return (
                      <button
                        key={`${node.getAttribute('data-tinafield')}-${index}`}
                        onClick={() => {
                          cms.events.dispatch({
                            type: 'forms:fields:select',
                            value: node.getAttribute('data-tinafield'),
                          })
                        }}
                        className="absolute border-2 border-red-400 pointer-events-all"
                        style={{
                          top: rect.top,
                          left: rect.left,
                          width: rect.width,
                          height: rect.height,
                        }}
                      />
                    )
                  })}
                </div>
                <iframe
                  ref={props.iframeRef}
                  className="h-full w-full bg-white"
                  src={props.url}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const QueryMachine = (props: {
  payload: PostMessage
  iframeRef: React.MutableRefObject<HTMLIFrameElement>
}) => {
  const cms = useCMS()

  const machine = React.useMemo(
    () =>
      queryMachine.withContext({
        ...initialContext,
        cms,
        // Enable registration of sub forms
        registerSubForms: true,
        // @ts-ignore FIXME: add formifyCallback args to Config type
        formifyCallback: props.formifyCallback,
      }),
    []
  )

  const [state, send] = useMachine(machine)
  React.useEffect(() => {
    if (state.matches('pipeline.ready')) {
      cms.events.dispatch({ type: 'forms:register', value: 'complete' })
    } else if (state.matches('pipeline.initializing')) {
      cms.events.dispatch({ type: 'forms:register', value: 'start' })
    }
  }, [JSON.stringify(state.value)])

  React.useEffect(() => {
    if (props.iframeRef.current) {
      window.addEventListener('message', (event: MessageEvent<PostMessage>) => {
        if (event?.data?.type === 'isEditMode') {
          props.iframeRef?.current?.contentWindow?.postMessage({
            type: 'tina:editMode',
          })
        }
      })
      send({ type: 'IFRAME_MOUNTED', value: props.iframeRef.current })
      if (props.payload.type === 'open') {
        send({ type: 'ADD_QUERY', value: props.payload })
      }
      window.addEventListener('message', (event: MessageEvent<PostMessage>) => {
        // useTinaHook cleans itself up when the component unmounts by sending a close message
        if (event.data.type === 'close') {
          send({ type: 'REMOVE_QUERY' })
        }
      })
    }
  }, [props.iframeRef.current])

  return null
}

function useKeyPress(targetKey: string, iframe?: HTMLIFrameElement) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = React.useState<boolean>(false)
  // If pressed key is our target key then set to true
  function downHandler({ key }: { key: string }) {
    if (key === targetKey) {
      setKeyPressed(true)
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }) => {
    if (key === targetKey) {
      setKeyPressed(false)
    }
  }
  // Add event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    iframe?.contentWindow?.window.addEventListener('keydown', downHandler)
    iframe?.contentWindow?.window.addEventListener('keyup', upHandler)
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
      iframe?.contentWindow?.window.removeEventListener('keydown', downHandler)
      iframe?.contentWindow?.window.removeEventListener('keyup', upHandler)
    }
  }, [iframe?.contentWindow?.window]) // Empty array ensures that effect is only run on mount and unmount
  return keyPressed
}
