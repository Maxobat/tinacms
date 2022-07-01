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

import { getBlockAbove, KeyboardHandler, queryNode } from '@udecode/plate-core'
import isHotkey from 'is-hotkey'
import { exitBreak } from './transforms/exitBreak'
import { ExitBreakPlugin } from './types'

export const onKeyDownExitBreak: KeyboardHandler<{}, ExitBreakPlugin> =
  (editor, { options: { rules = [] } }) =>
  (event) => {
    const entry = getBlockAbove(editor)
    if (!entry) return

    rules.forEach(({ hotkey, ...rule }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, rule.query)) {
        if (exitBreak(editor, rule)) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    })
  }