# tina-graphql

## 0.60.3

### Patch Changes

- 79d112d79: Update cli to accept tinaCloudMediaStore flag and add to metadata during schema compilation
- 3f46c6706: Fixed issue where generated SDK would not work with templates
- db9168578: Adds support for an `assetsHost` when resolving `image` fields with `useRelativeMedia`
- 91d6e6758: Fix issues with experimentalData on windows related to path separator inconsistency and interference with the .tina/**generated** folder

## 0.60.2

### Patch Changes

- 08cdb672a: Adds `useRelativeMedia` support to local graphql client
- fdbfe9a16: Fixes issue where on windows documents could not be deleted localy
- 6e2ed31a2: Added `isTitle` property to the schema that allows the title to be displayed in the CMS

## 0.60.1

### Patch Changes

- 3b11ff6ad: Add optional indexing status callback to Database

## 0.60.0

### Minor Changes

- 6a6f137ae: # Simplify GraphQL API

  ## `schema` must be supplied to the `<TinaCMS>` component

  Previously the `.tina/schema.ts` was only used by the Tina CLI to generate the GraphQL API. However it's now required as a prop to `<TinaCMS>`. This allows you to provide runtime logic in the `ui` property of field definitions. See the documentation on "Extending Tina" for examples.

  ## The GraphQL API has been simplified

  ### `get<collection name>` is now just the collection name

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) { ... }
  }

  # new
  {
    post(relativePath: $relativePath) { ... }
  }
  ```

  ### `get<collection name>List` is now `<collection name>Connection`

  The use of the term `connection` is due to our adherence the the [relay cursor spec](https://relay.dev/graphql/connections.htm). We may offer a simplified list field in a future release

  ```graphql
  # old
  {
    getPostList { ... }
  }

  # new
  {
    postConnection { ... }
  }
  ```

  ### `getCollection` and `getCollections` are now `collection` and `collections`

  ```graphql
  # old
  {
    getCollection(collection: "post") {...}
  }
  {
    getCollections {...}
  }

  # new
  {
    collection(collection: "post") {...}
  }
  {
    collections {...}
  }
  ```

  ### No more `data` property

  The `data` property was previously where all field definitions could be found. This has been moved on level up:

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) {
      data {
        title
      }
    }
  }

  # new
  {
    post(relativePath: $relativePath) {
      title
    }
  }
  ```

  #### The type for documents no longer includes "Document" at the end

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) {
      data {
        author {
          ... on AuthorDocument {
            data {
              name
            }
          }
        }
      }
    }
  }

  # new
  {
    post(relativePath: $relativePath) {
      author {
        ... on Author {
          name
        }
      }
    }
  }
  ```

  ### Meta fields are now underscored

  Aside from `id`, other metadata is now underscored:

  ```graphql
  # old
  {
    getPostDocument(relativePath: $relativePath) {
      sys {
        relativePath
      }
      values
    }
  }

  # new
  {
    post(relativePath: $relativePath) {
      _sys {
        relativePath
      }
      _values
    }
  }
  ```

  ### `dataJSON` is gone

  This is identical to `_values`

  ### `form` is gone

  `form` was used internally to generate forms for the given document, however that's now handled by providing your `schema` to `<TinaCMS>`.

  ### `getDocumentList` is gone

  It's no longer possible to query all documents at once, you can query for collection documents via the `collection` query:

  ```graphql
  {
    collection {
      documents {
        edges {
          node {...}
        }
      }
    }
  }
  ```

## 0.59.11

### Patch Changes

- 4da32454b: Modify database to write config json files without whitespace to reduce file sizes
- 921709a7e: Adds validation to the schema instead of only using typescript types
- 558cc4368: Make schema init platform-aware and refactor database put requests
- 06666d39f: Link to MDX documentation when unregistered component error occurs
- 3e2d9e43a: Adds new GraphQL `deleteDocument` mutation and logic
- Updated dependencies [a2906d6fe]
- Updated dependencies [3e2d9e43a]
  - @tinacms/datalayer@0.1.1

## 0.59.10

### Patch Changes

- cf33bcec1: Fix issue where store.clear() was not being awaited causing an invalid state after reindex

## 0.59.9

### Patch Changes

- 82174ff50: Modify Database.indexContentByPaths to not require collection parameter
- a87e1e6fa: Enable query filtering, pagination, sorting
- abf25c673: The schema can now to used on the frontend (optional for now but will be the main path moving forward).

  ### How to migrate.

  If you gone though the `tinacms init` process there should be a file called `.tina/components/TinaProvider`. In that file you can import the schema from `schema.ts` and add it to the TinaCMS wrapper component.

  ```tsx
  import TinaCMS from 'tinacms'
  import schema, { tinaConfig } from '../schema.ts'

  // Importing the TinaProvider directly into your page will cause Tina to be added to the production bundle.
  // Instead, import the tina/provider/index default export to have it dynamially imported in edit-moode
  /**
   *
   * @private Do not import this directly, please import the dynamic provider instead
   */
  const TinaProvider = ({ children }) => {
    return (
      <TinaCMS {...tinaConfig} schema={schema}>
        {children}
      </TinaCMS>
    )
  }

  export default TinaProvider
  ```

- 591640db0: Fixes a bug with `breadcrumbs` to account for subfolders (instead of just the `filename`) and allows Documents to be created and updated within subfolders.

  Before this fix, `breadcrumbs` was only the `basename` of the file minus the `extension`. So `my-folder-a/my-folder-b/my-file.md` would have `breadcrumbs` of `['my-file']`. With this change, `breadcrumbs` will be `['my-folder-a','my-folder-b','my-file']` (leaving out the `content/<collection>`).

- e8b0de1f7: Add `parentTypename` to fields to allow us to disambiguate between fields which have the same field names but different types. Example, an event from field name of `blocks.0.title` could belong to a `Cta` block or a `Hero` block, both of which have a `title` field.
- Updated dependencies [8b3be903f]
- Updated dependencies [a87e1e6fa]
- Updated dependencies [b01f2e382]
  - @tinacms/datalayer@0.1.0

## 0.59.8

### Patch Changes

- e7b27ba3b: Fix issue where un-normalized rich-text fields which send `null` values to the server on save would cause a parsing error
- 11d55f441: Add experimental useGraphQLForms hook

## 0.59.7

### Patch Changes

- c730fa1dd: fix: #1452: update indexDocument to handle adding new docs
- cd0f6f022: Do not resolve all documents in `getCollection` if it is not needed

## 0.59.6

### Patch Changes

- b399c734c: Fixes support for collection.templates in graphql

## 0.59.5

### Patch Changes

- 8ad8f03fd: Select field now validates when required is true.
- 04b7988d5: Some updates to the data layer POC work
  - Don't attempt to put config files on to bridge if it's not supported
  - Split logic for indexing all content vs a subset of files
- e3c41f69d: Fixed type for `required: true` on `type: "object"`
- f5390e841: Don't attempt to put config files on to bridge if it's not supported
- 32082e0b3: GraphQL number type is changed from "Int" to "Float"

## 0.59.4

### Patch Changes

- b66aefde1: Fixed issue where one could not add a title and then a bold text
- 35884152b: Adds and audit command that checks files for errors.
- 4948beec6: Fix issues with mdx code blocks and inline code nodes

## 0.59.3

### Patch Changes

- 34cd3a44a: Fix issue where frontmatter parser would return a Date object which would be cast to epoch format
- b006a5ab9: Added delete button to image field
- a324b9c37: Export utilities for working with the data layer
- 80732bd97: Create a @tinacms/datalayer package which houses the logic for data management for the GraphQL API. This simplifies the @tinacms/graphql package and allows for a clearer separation.
- 0bec208e2: validate the schema for `path` and `matches`
- 5c070a83f: feat: Add UI banner for when in localMode

## 0.59.2

### Patch Changes

- 212685fc3: Allow indexDB to skip building the query and fragment generation files

## 0.59.1

### Patch Changes

- f46c6f987: Fix type definitions for schema metadata so they're optional

## 0.59.0

### Minor Changes

- 62bea7019: #2323: fix saving bold and italic text in rich-text editor

### Patch Changes

- bd4e1f802: Pin version number from @tinacms/graphql during schema compilation. This can be used to ensure the proper version is provided when working with Tina Cloud

## 0.58.2

### Patch Changes

- fffce3af8: Don't cache graphql schema during resolution, this was causing the schema to go stale, while updating the schema.gql, so GraphQL tooling thought the value was updated, but the server was still holding on to the cached version

## 0.58.1

### Patch Changes

- 4700d7ae4: Patch fix to ensure builds include latest dependencies

## 0.58.0

### Minor Changes

- fa7a0419f: Adds experimental support for a data layer between file-based content and the GraphQL API. This allows documents to be indexed so the CMS can behave more like a traditional CMS, with the ability enforce foreign reference constraints and filtering/pagination capabilities.

### Patch Changes

- eb5fbfac7: Ensure GraphQL resolve doesn't access "bridge" documents
- 47d126029: Fix support of objects in a list for MDX templates

## 0.57.2

### Patch Changes

- edb2f4011: Trim path property on collections during compilation

## 0.57.1

### Patch Changes

- 60729f60c: Adds a `reference` field

## 0.57.0

### Minor Changes

- ed277e3bd: Remove aws dependency and cache logic from GithubBridge
- d1ed404ba: Add support for auto-generated SDK for type-safe data fetching

### Patch Changes

- 138ceb8c4: Clean up dependencies
- 577d6a5ad: Adds collection arg back for generic queries as optional

## 0.56.1

### Patch Changes

- 4b7795612: Adds support for collection.templates to TinaAdmin

## 0.56.0

### Minor Changes

- b99baebf1: Add rich-text editor based on mdx, bump React dependency requirement to 16.14

### Patch Changes

- 891623c7c: Adds support for List and Update to TinaAdmin

## 0.55.2

### Patch Changes

- 9ecb392ca: Fix bug which would set markdown body to undefined when the payload was emptry"

## 0.55.1

### Patch Changes

- ff4446c8e: Adds `getDocumentFields()` query for use with Tina Admin
- 667c33e2a: Add support for rich-text field, update build script to work with unified packages, which are ESM-only

## 0.55.0

### Minor Changes

- f3bddeb4a: Added new warning messages for list UI that we do not support by default

### Patch Changes

- 2908f8176: Fixes an issue where nested reference fields weren't updated properly when their values changed.
- 5d83643b2: Adds create document mutations

## 0.54.3

### Patch Changes

- 9b27192fe: Build packages with new scripting, which includes preliminary support for ES modules.

## 0.54.2

### Patch Changes

- d94fec611: Improve exported types for defineSchema

## 0.54.1

### Patch Changes

- 4de977f63: Makes `DateFieldPlugin` timezone-friendly

## 0.54.0

### Minor Changes

- 7663e0f7f: Fixed windows issue where you could not save a file

## 0.53.0

### Minor Changes

- b4f5e973f: Update datetime field to expect and receive ISO string

## 0.52.2

### Patch Changes

- b4bbdda86: Better error messaging when no tina schema files are found

## 0.52.1

### Patch Changes

- b05c91c6: Remove console.log

## 0.52.0

### Minor Changes

- aa4507697: When working with a new document that queries for a reference, we were not properly building the path information required to update that reference, resulting in an error until the page was refreshed.

## 0.51.1

### Patch Changes

- 589c7806: Fix issue where the `isBody` field wasn't properly removing that value from frontmatter. Ensure that the field is not treating any differently for JSON format

## 0.51.0

### Minor Changes

- 5a934f6b: Fixed windows path issues

### Patch Changes

- 271a72d7: Use collection label (defined in schema.ts) as form label

## 0.50.2

### Patch Changes

- 0970961f: addPendingDocument was expecting params, which are not supported for new doc creation at this time

## 0.50.1

### Patch Changes

- 65b3e3a3: Uses checkbox-group field

## 0.50.0

### Minor Changes

- 7f3c8c1a: # 🔧 Changes coming to TinaCMS ⚙️

  👋 You may have noticed we've been hard at-work lately building out a more opinionated approach to TinaCMS. To that end, we've settled around a few key points we'd like to announce. To see the work in progress, check out the [main](https://github.com/tinacms/tinacms/tree/main) branch, which will become the primary branch soon.

  ## Consolidating @tinacms packages in to @tinacms/toolkit

  By nature, Tina relies heavily on React context, and the dependency mismatches from over-modularizing our toolkit has led to many bugs related to missing context. To fix this, we'll be consolidating nearly every package in the @tinacms scope to a single package called `@tinacms/toolkit`

  We'll also be rolling out esm support as it's now much easier to address build improvements

  ## A more focused tinacms package

  The `tinacms` package now comes baked-in with APIs for working with the TinaCMS GraphQL API. Because `@tinacms/toolkit` now encompasses everything you'd need to build your own CMS integration, we're repurposing the `tinacms` package to more accurately reflect the "batteries-included" approach.

  If you haven't been introduced, the GraphQL API is a Git-backed CMS which we'll be leaning into more in the future. With a generous free tier and direct syncing with Github its something we're really excited to push forward. Sign up for free here
  Note: tinacms still exports the same APIs, but we'll gradually start moving the backend-agnostic tools to @tinacms/toolkit.

  ## Consolidating the tina-graphql-gateway repo

  The tina-graphql-gateway repo will be absorbed into this one. If you've been working with our GraphQL APIs you'll need to follow our migration guide.

  ## Moving from Lerna to Yarn PNP

  We've had success with Yarn 2 and PNP in other monorepos, if you're a contributor you'll notice some updates to the DX, which should hopefully result in a smoother experience.

  ## FAQ

  ### What about other backends?

  The `@tinacms/toolkit` isn't going anywhere. And if you're using packages like `react-tinacms-strapi` or r`eact-tinacms-github` with success, that won't change much, they'll just be powered by `@tinacms/toolkit` under the hood.

  ### Do I need to do anything?

  We'll be bumping all packages to `0.50.0` to reflect the changes. If you're using @tincams scoped packages those won't receive the upgrade. Unscoped packages like `react-tinacms-editor` will be upgraded, and should be bumped to 0.50.0 as well.
  When we move to `1.0.0` we'll be pushing internal APIs to `@tinacms/toolkit`, so that's the long-term location of

  ### Will you continue to patch older versions?

  We'll continue to make security patches, however major bug fixes will likely not see any updates. Keep in mind that `@tinacms/toolkit` will continue to be developed.

## 0.2.0

### Minor Changes

- 7351d92f: # Define schema changes

  We're going to be leaning on a more _primitive_ concept of how types are defined with Tina, and in doing so will be introducing some breaking changes to the way schemas are defined. Read the detailed [RFC discussion](https://github.com/tinacms/rfcs/pull/18) for more on this topic, specifically the [latter portions](https://github.com/tinacms/rfcs/pull/18#issuecomment-805400313) of the discussion.

  ## Collections now accept a `fields` _or_ `templates` property

  You can now provide `fields` instead of `templates` for your collection, doing so will result in a more straightforward schema definition:

  ```js
  {
    collections: [
      {
        name: 'post',
        label: 'Post',
        path: 'content/posts',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'string', // read on below to learn more about _type_ changes
          },
        ],
        // defining `fields` and `templates` would result in a compilation error
      },
    ]
  }
  ```

  **Why?**

  Previously, a collection could define multiple templates, the ambiguity introduced with this feature meant that your documents needed a `_template` field on them so we'd know which one they belonged to. It also mean having to disambiguate your queries in graphql:

  ```graphql
  getPostDocument(relativePage: $relativePath) {
    data {
      ...on Article_Doc_Data {
        title
      }
    }
  }
  ```

  Going forward, if you use `fields` on a collection, you can omit the `_template` key and simplify your query:

  ```graphql
  getPostDocument(relativePage: $relativePath) {
    data {
      title
    }
  }
  ```

  ## `type` changes

  Types will look a little bit different, and are meant to reflect the lowest form of the shape they can represent. Moving forward, the `ui` field will represent the UI portion of what you might expect. For a blog post "description" field, you'd define it like this:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
  }
  ```

  By default `string` will use the `text` field, but you can change that by specifying the `component`:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
    ui: {
      component: "textarea"
    }
  }
  ```

  For the most part, the UI properties are added to the field and adhere to the existing capabilities of Tina's core [field plugins](https://tina.io/docs/fields/). But there's nothing stopping you from providing your own components -- just be sure to register those with the CMS object on the frontend:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
    ui: {
      component: "myMapField"
      someAdditionalMapConfig: 'some-value'
    }
  }
  ```

  [Register](https://tina.io/docs/fields/custom-fields/#registering-the-plugin) your `myMapField` with Tina:

  ```js
  cms.fields.add({
    name: 'myMapField',
    Component: MapPicker,
  })
  ```

  ### One important gotcha

  Every property in the `defineSchema` API must be serlializable. Meaning functions will not work. For example, there's no way to define a `validate` or `parse` function at this level. However, you can either use the [formify](https://tina.io/docs/tina-cloud/client/#formify) API to get access to the Tina form, or provide your own logic by specifying a plugin of your choice:

  ```js
  {
    type: "string",
    label: "Description",
    name: "description",
    ui: {
      component: "myText"
    }
  }
  ```

  And then when you register the plugin, provide your custom logic here:

  ```js
  import { TextFieldPlugin } from 'tinacms'

  // ...

  cms.fields.add({
    ...TextFieldPlugin, // spread existing text plugin
    name: 'myText',
    validate: value => {
      someValidationLogic(value)
    },
  })
  ```

  **Why?**

  The reality is that under the hood this has made no difference to the backend, so we're removing it as a point of friction. Instead, `type` is the true definition of the field's _shape_, while `ui` can be used for customizing the look and behavior of the field's UI.

  ## Defensive coding in Tina

  When working with GraphQL, there are 2 reasons a property may not be present.

  1. The data is not a required property. That is to say, if I have a blog post document, and "category" is an optional field, we'll need to make sure we factor that into how we render our page:

  ```tsx
  const MyPage = props => {
    return (
      <>
        <h2>{props.getPostDocument.data.title}</h2>
        <MyCategoryComponent>
          {props.getPostDocument.data?.category}
        </MyCategoryComponent>
      </>
    )
  }
  ```

  2. The query did not ask for that field:

  ```graphql
  {
    getPostDocument {
      data {
        title
      }
    }
  }
  ```

  But with Tina, there's a 3rd scenario: the document may be in an invalid state. Meaning, we could mark the field as `required` _and_ query for the appropriate field, and _still_ not have the expected shape of data. Due to the contextual nature of Tina, it's very common to be in an intermediate state, where your data is incomplete simply because you're still working on it. Most APIs would throw an error when a document is in an invalid state. Or, more likely, you couldn't even request it.

  ## Undefined list fields will return `null`

  Previously an listable field which wasn't defined in the document was treated as an emptry array. So for example:

  ```md
  ---
  title: 'Hello, World'
  categories:
    - sports
    - movies
  ---
  ```

  The responsee would be `categories: ['sports', 'movies']`. If you omit the items, but kept the empty array:

  ```md
  ---
  title: 'Hello, World'
  categories: []
  ---
  ```

  The responsee would be `categories: []`. If you omit the field entirely:

  ```md
  ---
  title: 'Hello, World'
  ---
  ```

  The response will be `categories: null`. Previously this would have been `[]`, which was incorrect.

  ## For a listable item which is `required: true` you _must_ provide a `ui.defaultItem` property

  ### Why?

  It's possible for Tina's editing capabilities to introduce an invalid state during edits to list items. Imagine the scenario where you are iterating through an array of objects, and each object has a categories array on it we'd like to render:

  ```tsx
  const MyPage = props => {
    return props.blocks.map(block => {
      return (
        <>
          <h2>{block.categories.split(',')}</h2>
        </>
      )
    })
  }
  ```

  For a new item, `categories` will be null, so we'll get an error. This only happens when you're editing your page with Tina, so it's not a production-facing issue.

  ## Every `type` can be a list

  Previously, we had a `list` field, which allowed you to supply a `field` property. Instead, _every_ primitive type can be represented as a list:

  ```js
  {
    type: "string",
    label: "Categories",
    name: "categories",
    list: true
  }
  ```

  Additionally, enumerable lists and selects are inferred from the `options` property. The following example is represented by a `select` field:

  ```js
  {
    type: "string",
    label: "Categories",
    name: "categories",
    options: ["fitness", "movies", "music"]
  }
  ```

  While this, is a `checkbox` field

  ```js
  {
    type: "string",
    label: "Categories",
    name: "categories"
    list: true,
    options: ["fitness", "movies", "music"]
  }
  ```

  > Note we may introduce an `enum` type, but haven't discussed it thoroughly

  ## Introducing the `object` type

  Tina currently represents the concept of an _object_ in two ways: a `group` (and `group-list`), which is a uniform collection of fields; and `blocks`, which is a polymporphic collection. Moving forward, we'll be introducing a more comporehensive type, which envelopes the behavior of both `group` and `blocks`, and since _every_ field can be a `list`, this also makes `group-list` redundant.

  > Note: we've previously assumed that `blocks` usage would _always_ be as an array. We'll be keeping that assumption with the `blocks` type for compatibility, but `object` will allow for non-array polymorphic objects.

  ### Defining an `object` type

  An `object` type takes either a `fields` _or_ `templates` property (just like the `collections` definition). If you supply `fields`, you'll end up with what is essentially a `group` item. And if you say `list: true`, you'll have what used to be a `group-list` definition.

  Likewise, if you supply a `templates` field and `list: true`, you'll get the same API as `blocks`. However you can also say `list: false` (or omit it entirely), and you'll have a polymorphic object which is _not_ an array.

  This is identical to the current `blocks` definition:

  ```js
  {
    type: "object",
    label: "Page Sections",
    name: "pageSections",
    list: true,
    templates: [{
      label: "Hero",
      name: "hero",
      fields: [{
        label: "Title",
        name: "title",
        type: "string"
      }]
    }]
  }
  ```

  And here is one for `group`:

  ```js
  {
    type: "object",
    label: "Hero",
    name: "hero",
    fields: [{
      label: "Title",
      name: "title",
      type: "string"
    }]
  }
  ```

  ## `dataJSON` field

  You can now request `dataJSON` for the entire data object as a single query key. This is great for more tedius queries like theme files where including each item in the result is cumbersome.

  > Note there is no typescript help for this feature for now

  ```graphql
  getThemeDocument(relativePath: $relativePath) {
    dataJSON
  }
  ```

  ```json
  {
    "getThemeDocument": {
      "dataJSON": {
        "every": "field",
        "in": {
          "the": "document"
        },
        "is": "returned"
      }
    }
  }
  ```

  ## Lists queries will now adhere to the GraphQL connection spec

  [Read the spec](https://relay.dev/graphql/connections.htm)

  Previously, lists would return a simple array of items:

  ```graphql
  {
    getPostsList {
      id
    }
  }
  ```

  Which would result in:

  ```json
  {
    "data": {
      "getPostsList": [
        {
          "id": "content/posts/voteForPedro.md"
        }
      ]
    }
  }
  ```

  In the new API, you'll need to step through `edges` & `nodes`:

  ```graphql
  {
    getPostsList {
      edges {
        node {
          id
        }
      }
    }
  }
  ```

  ```json
  {
    "data": {
      "getPostsList": {
        "edges": [
          {
            "node": {
              "id": "content/posts/voteForPedro.md"
            }
          }
        ]
      }
    }
  }
  ```

  **Why?**

  The GraphQL connection spec opens up a more future-proof structure, allowing us to put more information in to the _connection_ itself like how many results have been returned, and how to request the next page of data.

  Read [a detailed explanation](https://graphql.org/learn/pagination/) of how the connection spec provides a richer set of capabilities.

  > Note: sorting and filtering is still not supported for list queries.

  ## `_body` is no longer included by default

  There is instead an `isBody` boolean which can be added to any `string` field

  **Why?**

  Since markdown files sort of have an implicit "body" to them, we were automatically populating a field which represented the body of your markdown file. This wasn't that useful, and kind of annoying. Instead, just attach `isBody` to the field which you want to represent your markdown "body":

  ```js
  {
    collections: [{
      name: "post",
      label: "Post",
      path: "content/posts",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string"
        }
        {
          name: "myBody",
          label: "My Body",
          type: "string",
          component: 'textarea',
          isBody: true
        }
      ]
    }]
  }
  ```

  This would result in a form field called `My Body` getting saved to the body of your markdown file (if you're using markdown):

  ```md
  ---
  title: Hello, World!
  ---

  This is the body of the file, it's edited through the "My Body" field in your form.
  ```

  ## References now point to more than one collection.

  Instead of a `collection` property, you must now define a `collections` field, which is an array:

  ```js
  {
    type: "reference",
    label: "Author",
    name: "author",
    collections: ["author"]
  }
  ```

  ```graphql
  {
    getPostDocument(relativePath: "hello.md") {
      data {
        title
        author {
          ...on Author_Document {
            name
          }
          ...on Post_Document {
            title
          }
        }
      }
    }
  ```

  ## Other breaking changes

  ### The `template` field on polymorphic objects (formerly _blocks_) is now `_template`

  **Old API:**

  ```md
  ---
  ---
  myBlocks:
    - template: hero
      title: Hello
  ---
  ```

  **New API:**

  ```md
  ---
  ---
  myBlocks:
    - \_template: hero
      title: Hello
  ---
  ```

  ### `data` `__typename` values have changed

  They now include the proper namespace to prevent naming collisions and no longer require `_Doc_Data` suffix. All generated `__typename` properties are going to be slightly different. We weren't fully namespacing fields so it wasn't possible to guarantee that no collisions would occur. The pain felt here will likely be most seen when querying and filtering through blocks. This ensures the stability of this type in the future

  ```graphql
  {
    getPageDocument(relativePath: "home.md") {
      data {
        title
        myBlocks {
          ...on Page_Hero_Data {  # previously this would have been Hero_Data
            # ...
          }
        }
      }
    }
  ```

### Patch Changes

- fdb7724b: Fix stringify for json extensions
- d42e2bcf: Adds number, datetime, and boolean fields back into primitive field generators
- 5cd5ce76: - Improve types for ui field
  - Marks system fields as required so the user has a guarantee that they'll be there
  - Return null for listable fields which are null or undefined
  - Handle null values for reference fields better
- 8c425440: Remmove accidental additional of dataJSON in schema
- Updated dependencies [7351d92f]
  - tina-graphql-helpers@0.1.2

## 0.1.25

### Patch Changes

- 348ef1e5: Testing version bumps go into a PR

## 0.1.24

### Patch Changes

- b36de960: lruClearCache should just be clearCache for now

## 0.1.23

### Patch Changes

- Bump packages to reflect new changest capabilities
- Updated dependencies [undefined]
  - tina-graphql-helpers@0.1.1

## 0.1.22

### Patch Changes

- Updated dependencies [undefined]
  - tina-graphql-helpers@0.1.0

## 0.1.21

### Patch Changes

- Testin

## 0.1.20

### Patch Changes

- Testing

## 0.1.13

### Patch Changes

- Testing out changesets