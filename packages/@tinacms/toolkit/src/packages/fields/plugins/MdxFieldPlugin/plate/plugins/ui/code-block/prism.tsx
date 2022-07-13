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
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/nightOwl'

export const Prism = (props) => {
  console.log(props)
  return (
    <span contentEditable="false">
      <style>
        {`
        pre[class*="language-" ],
        code[class*="language-"] {
            white-space: normal;
            overflow: auto;
            word-break: break-word;
        }
        `}
      </style>
      <Highlight
        {...defaultProps}
        {...props.attributes}
        theme={theme}
        code={props.element.value.trim() || ''}
        language={'html'}
      >
        {/* {props.children} */}
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </span>
  )
}