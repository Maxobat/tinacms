import React, { Suspense, useEffect, useState } from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { getField, useTina } from 'tinacms/dist/react'
import { Prism } from 'tinacms/dist/rich-text/prism'

import { DefaultRenderer, Explorer } from './explorer'

const Renderer = (props) => {
  if (
    ['__meta__', '_sys', '_internalValues', '_internalSys'].includes(
      props.label
    )
  ) {
    return (
      <Explorer {...props} defaultExpanded={false} renderer={DefaultRenderer} />
    )
  }
  // if (props.type === 'object') {
  //   if (props.value?.type === 'root') {
  //     return (
  //       <Explorer
  //         {...props}
  //         defaultExpanded={{ body: true }}
  //         valueView={(value) => {
  //           console.log(value)
  //           return (
  //             <div className="font-sans">
  //               <Markdown content={value} />
  //             </div>
  //           )
  //         }}
  //       />
  //     )
  //   } else {
  //   }
  // }
  return (
    <Explorer
      {...props}
      defaultExpanded={true}
      handleView={(key, parentValue) => {
        return (
          <span data-tinafield={getField(parentValue, key)}>
            {parentValue[key]}
          </span>
        )
        // return value
      }}
    />
  )
}

export function Json(props: { src: object }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  if (!isClient) {
    return null
  }

  return (
    <div className="px-4">
      <div className="mx-auto my-8 border rounded-lg p-8 shadow-lg max-w-5xl mx-auto shadow-lg">
        <div className="h-full overflow-scroll">
          <Explorer
            label="data"
            value={props.src}
            defaultExpanded={true}
            handleEntry={(props) => {
              return <Explorer {...props} renderer={Renderer} />
            }}
          />
        </div>
      </div>
    </div>
  )
}

export const Markdown = (props) => {
  return (
    <div className={props.wrapper ? 'px-4' : ''}>
      <div
        data-test="rich-text-body"
        className="mx-auto border max-w-5xl rounded-lg p-8 shadow-lg prose"
      >
        <TinaMarkdown
          content={props.content}
          components={{
            code_block: (props) => <Prism {...props} />,
            Hero: (props) => {
              return <Json src={props} />
            },
          }}
        />
      </div>
    </div>
  )
}
