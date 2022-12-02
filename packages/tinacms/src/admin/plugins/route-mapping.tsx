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

import { Plugin } from '@tinacms/toolkit'
import type { CollectionResponse, DocumentSys } from '../types'
export class RouteMappingPlugin implements Plugin {
  __type: string = 'tina-admin'
  name: string = 'route-mapping'
  mapper: (
    collection: CollectionResponse,
    document: DocumentSys
  ) => string | undefined

  constructor(
    mapper: (
      collection: CollectionResponse,
      document: DocumentSys
    ) => string | undefined
  ) {
    this.mapper = mapper
  }
}
