import { format } from 'prettier'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import type * as Plate from '../parse/plate'
import type * as Md from 'mdast'
import { blockElement, rootElement, stringifyMDX } from '.'

export const stringifyPropsInline = (
  element: Plate.MdxInlineElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): { attributes: MdxJsxAttribute[]; children: Md.PhrasingContent[] } => {
  return stringifyProps(element, field, true, imageCallback)
}
export const stringifyProps = (
  element: Plate.MdxBlockElement,
  parentField: RichTypeInner,
  flatten: boolean,
  imageCallback: (url: string) => string
): { attributes: MdxJsxAttribute[]; children: Md.BlockContent[] } => {
  const attributes: MdxJsxAttribute[] = []
  const children: Md.BlockContent[] = []
  const template = parentField.templates?.find((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    return template.name === element.name
  })
  if (!template || typeof template === 'string') {
    throw new Error(`Unable to find template for JSX element ${element.name}`)
  }
  Object.entries(element.props).forEach(([name, value]) => {
    const field = template.fields.find((field) => field.name === name)
    if (!field) {
      if (name === 'children') {
        return
      }
      throw new Error(`No field definition found for property ${name}`)
    }
    switch (field.type) {
      case 'reference':
        if (field.list) {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
            },
          })
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: value,
          })
        }
        break
      case 'datetime':
      case 'string':
        if (field.list) {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
            },
          })
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: value,
          })
        }
        break
      case 'image':
        if (field.list) {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: `[${value
                .map((item) => `"${imageCallback(item)}"`)
                .join(', ')}]`,
            },
          })
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: imageCallback(value),
          })
        }
        break
      case 'number':
      case 'boolean':
        if (field.list) {
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: value,
            },
          })
        }
        break
      case 'object':
        attributes.push({
          type: 'mdxJsxAttribute',
          name,
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: stringifyObj(value, flatten),
          },
        })
        break
      case 'rich-text':
        if (typeof value === 'string') {
          throw new Error(
            `Unexpected string for rich-text, ensure the value has been properly parsed`
          )
        }
        if (field.list) {
          throw new Error(`Rich-text list is not supported`)
        } else {
          const joiner = flatten ? ' ' : '\n'
          let val = ''
          if (field.name === 'children') {
            const root = rootElement(value, field)
            children.push(root.children[0])
            return
          } else {
            const stringValue = stringifyMDX(value, field)
            val = stringValue
              .trim()
              .split('\n')
              .map((str) => `  ${str.trim()}`)
              .join(joiner)
          }
          if (flatten) {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                // value: `<>${JSON.stringify(value)}</>`,
                value: `<>${val.trim()}</>`,
              },
            })
          } else {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>\n${val}\n</>`,
              },
            })
          }
        }
        break
      default:
        throw new Error(`Stringify props: ${field.type} not yet supported`)
    }
  })
  return { attributes, children }
}

/**
 * Use prettier to determine how to format potentially large objects as strings
 */
function stringifyObj(obj, flatten) {
  const dummyFunc = `const dummyFunc = `
  const res = format(`${dummyFunc}${JSON.stringify(obj)}`, {
    parser: 'acorn',
    trailingComma: 'none',
    semi: false,
  })
    .trim()
    .replace(dummyFunc, '')
  return flatten ? res.replaceAll('\n', '').replaceAll('  ', ' ') : res
}