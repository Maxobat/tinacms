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

import * as React from 'react'
import { FC } from 'react'
import { Form } from '../forms'
import { Form as FinalForm } from 'react-final-form'
import { Transition } from '@headlessui/react'

import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Button } from '../styles'
import { ModalProvider } from '../react-modals'
import { LoadingDots } from './LoadingDots'
import { FormPortalProvider } from './FormPortal'
import { FieldsBuilder } from './fields-builder'
import { ResetForm } from './ResetForm'
import { FormActionMenu } from './FormActions'
import { getIn, FormApi } from 'final-form'
import { useCMS } from '../react-core'
import { PanelHeader } from '../fields'

export interface FormBuilderProps {
  form: Form
  hideFooter?: boolean
  label?: string
  setActiveFormId?: (value: string) => void
  onPristineChange?: (_pristine: boolean) => unknown
}

const NoFieldsPlaceholder = () => (
  <div
    className="relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto"
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <Emoji className="block pb-5">🤔</Emoji>
    <h3 className="font-sans font-normal text-lg block pb-5">
      Hey, you don't have any fields added to this form.
    </h3>
    <p className="block pb-5">
      <a
        className="text-center rounded-3xl border border-solid border-gray-100 shadow-[0_2px_3px_rgba(0,0,0,0.12)] font-normal cursor-pointer text-[12px] transition-all duration-100 ease-out bg-white text-gray-700 py-3 pr-5 pl-14 relative no-underline inline-block hover:text-blue-500"
        href="https://tinacms.org/docs/fields"
        target="_blank"
      >
        <Emoji
          className="absolute left-5 top-1/2 origin-center -translate-y-1/2 transition-all duration-100 ease-out"
          style={{ fontSize: 24 }}
        >
          📖
        </Emoji>{' '}
        Field Setup Guide
      </a>
    </p>
  </div>
)

export const FormBuilder: FC<FormBuilderProps> = ({
  form: tinaForm,
  onPristineChange,
  setActiveFormId,
  ...rest
}) => {
  const cms = useCMS()
  const [activeFieldName, setActiveFieldName] = React.useState(null)
  const [activeFormShape, setActiveFormShape] = React.useState(tinaForm)
  const hideFooter = !!rest.hideFooter
  /**
   * > Why is a `key` being set when this isn't an array?
   *
   * `FinalForm` does not update when given a new `form` prop.
   *
   * We can force `FinalForm` to update by setting the `key` to
   * the name of the form. When the name changes React will
   * treat it as a new instance of `FinalForm`, destroying the
   * old `FinalForm` componentt and create a new one.
   *
   * See: https://github.com/final-form/react-final-form/blob/master/src/ReactFinalForm.js#L68-L72
   */
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    setI((i) => i + 1)
  }, [tinaForm])

  const finalForm = tinaForm.finalForm

  React.useEffect(() => {
    setActiveFormShape(tinaForm)
  }, [tinaForm.id])

  cms.events.subscribe('forms:select', (event) => {
    setActiveFormId(event.value)
  })
  React.useMemo(
    () =>
      cms.events.subscribe('forms:fields:select', (event) => {
        const [formId, fieldName] = event.value.split('#')
        if (!fieldName) {
          return
        }
        console.log(event.value)
        const values = tinaForm.finalForm.getState().values
        const { formShape } = getFormShape({
          form: tinaForm,
          values,
          namePath: fieldName.split('.'),
          depth: [],
        })
        console.log(formShape)
        setActiveFormShape(formShape)
        setActiveFieldName(event.value)
      }),
    [cms]
  )

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !finalForm) return
      const name = result.type
      finalForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      )
    },
    [tinaForm]
  )

  /**
   * Prevent navigation away from the window when the form is dirty
   */
  React.useEffect(() => {
    const unsubscribe = finalForm.subscribe(
      ({ pristine }) => {
        if (onPristineChange) {
          onPristineChange(pristine)
        }
      },
      { pristine: true }
    )
    return () => {
      unsubscribe()
    }
  }, [finalForm])

  useOnChangeEventDispatch({ finalForm, tinaForm })

  return (
    <FinalForm
      form={finalForm}
      key={`${i}: ${tinaForm.id}`}
      onSubmit={tinaForm.onSubmit}
    >
      {({
        handleSubmit,
        pristine,
        invalid,
        submitting,
        dirtySinceLastSubmit,
        hasValidationErrors,
      }) => {
        return (
          <>
            <DragDropContext onDragEnd={moveArrayItem}>
              <FormPortalProvider>
                {/* <ul>
                  {nameParts.map((part, index) => {
                    if (!isNaN(Number(part))) {
                      // don't render the indexes
                      return null
                    }
                    return (
                      <li key={`${part}-${index}`}>
                        <PanelHeader
                          onClick={() => {
                            setActiveFieldName(
                              nameParts.slice(0, index).join('.')
                            )
                          }}
                        >
                          {part}
                        </PanelHeader>
                      </li>
                    )
                  })}
                </ul> */}
                <FormWrapper id={tinaForm.id}>
                  {tinaForm && activeFormShape.fields?.length ? (
                    <div className="relative">
                      <FieldsBuilder
                        form={tinaForm}
                        // activeField={activeFieldName.split('#')[1]}
                        fields={activeFormShape.fields}
                      />
                    </div>
                  ) : (
                    <NoFieldsPlaceholder />
                  )}
                </FormWrapper>
              </FormPortalProvider>
              {!hideFooter && (
                <div className="relative flex-none w-full h-16 px-6 bg-white border-t border-gray-100	flex items-center justify-center">
                  <div className="flex-1 w-full flex justify-between gap-4 items-center max-w-form">
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset()
                          await tinaForm.reset!()
                        }}
                        style={{ flexGrow: 1 }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={
                        pristine ||
                        submitting ||
                        hasValidationErrors ||
                        (invalid && !dirtySinceLastSubmit)
                      }
                      busy={submitting}
                      variant="primary"
                      style={{ flexGrow: 3 }}
                    >
                      {submitting && <LoadingDots />}
                      {!submitting && tinaForm.buttons.save}
                    </Button>
                    {tinaForm.actions.length > 0 && (
                      <FormActionMenu
                        form={tinaForm as any}
                        actions={tinaForm.actions}
                      />
                    )}
                  </div>
                </div>
              )}
            </DragDropContext>
          </>
        )
      }}
    </FinalForm>
  )
}

export const FullscreenFormBuilder: FC<FormBuilderProps> = ({
  form: tinaForm,
  label,
}) => {
  /**
   * > Why is a `key` being set when this isn't an array?
   *
   * `FinalForm` does not update when given a new `form` prop.
   *
   * We can force `FinalForm` to update by setting the `key` to
   * the name of the form. When the name changes React will
   * treat it as a new instance of `FinalForm`, destroying the
   * old `FinalForm` componentt and create a new one.
   *
   * See: https://github.com/final-form/react-final-form/blob/master/src/ReactFinalForm.js#L68-L72
   */
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    setI((i) => i + 1)
  }, [tinaForm])

  const finalForm = tinaForm.finalForm

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !finalForm) return
      const name = result.type
      finalForm.mutators.move(
        name,
        result.source.index,
        result.destination.index
      )
    },
    [tinaForm]
  )

  return (
    <ModalProvider>
      <FinalForm
        form={finalForm}
        key={`${i}: ${tinaForm.id}`}
        onSubmit={tinaForm.onSubmit}
      >
        {({ handleSubmit, pristine, invalid, submitting }) => {
          return (
            <DragDropContext onDragEnd={moveArrayItem}>
              <div className="w-full h-screen flex flex-col items-center">
                <div className="px-6 py-4 w-full bg-white border-b border-gray-150 shadow-sm sticky flex flex-wrap gap-x-6 gap-y-3 justify-between items-center">
                  {label && (
                    <h4 className="font-bold font-sans text-lg opacity-80">
                      {label}
                    </h4>
                  )}
                  <div className="flex flex-1 gap-4 items-center justify-end">
                    <FormStatus pristine={pristine} />
                    {tinaForm.reset && (
                      <ResetForm
                        pristine={pristine}
                        reset={async () => {
                          finalForm.reset()
                          await tinaForm.reset!()
                        }}
                        style={{ flexBasis: '7rem' }}
                      >
                        {tinaForm.buttons.reset}
                      </ResetForm>
                    )}
                    <Button
                      onClick={() => handleSubmit()}
                      disabled={pristine || submitting || invalid}
                      busy={submitting}
                      variant="primary"
                      style={{ flexBasis: '10rem' }}
                    >
                      {submitting && <LoadingDots />}
                      {!submitting && tinaForm.buttons.save}
                    </Button>
                    {tinaForm.actions.length > 0 && (
                      <FormActionMenu
                        form={tinaForm as any}
                        actions={tinaForm.actions}
                      />
                    )}
                  </div>
                </div>
                <FormPortalProvider>
                  <FormWrapper id={tinaForm.id}>
                    {tinaForm && tinaForm.fields.length ? (
                      <FieldsBuilder form={tinaForm} fields={tinaForm.fields} />
                    ) : (
                      <NoFieldsPlaceholder />
                    )}
                  </FormWrapper>
                </FormPortalProvider>
              </div>
            </DragDropContext>
          )
        }}
      </FinalForm>
    </ModalProvider>
  )
}

export const FormStatus = ({ pristine }) => {
  return (
    <div className="flex flex-0 items-center">
      {!pristine && (
        <>
          <span className="w-3 h-3 flex-0 rounded-full bg-yellow-400 border border-yellow-500 mr-2"></span>{' '}
          <p className="text-gray-700 text-sm leading-tight whitespace-nowrap">
            Unsaved Changes
          </p>
        </>
      )}
      {pristine && (
        <>
          <span className="w-3 h-3 flex-0 rounded-full bg-green-300 border border-green-400 mr-2"></span>{' '}
          <p className="text-gray-500 text-sm leading-tight whitespace-nowrap">
            No Changes
          </p>
        </>
      )}
    </div>
  )
}

export const FormWrapper = ({ children, id }) => {
  return (
    <div
      data-test={`form:${id?.replace(/\\/g, '/')}`}
      className="h-full overflow-y-auto max-h-full bg-gray-50 pt-6 px-6 pb-2"
    >
      <div className="w-full flex justify-center">
        <div className="w-full max-w-form">{children}</div>
      </div>
    </div>
  )
}

/**
 *
 * Subscribes to final form value changes and dispatches an event
 * with information specific to which field changed.
 */
const useOnChangeEventDispatch = ({
  finalForm,
  tinaForm,
}: {
  finalForm: FormApi<any, Partial<any>>
  tinaForm: Form
}) => {
  const [formValues, setFormValues] = React.useState({})
  const [newUpdate, setNewUpdate] = React.useState(null)

  const { subscribe } = finalForm

  React.useEffect(() => {
    subscribe(
      ({ values }) => {
        setFormValues(values)
      },
      { values: true }
    )
  }, [subscribe, setFormValues])
  const cms = useCMS()

  React.useEffect(() => {
    if (newUpdate?.name === 'reset') {
      cms.events.dispatch({
        type: `forms:reset`,
        value: null,
        mutationType: newUpdate.mutationType,
        formId: tinaForm.id,
      })
      setNewUpdate(null)
    } else if (newUpdate?.name) {
      // it seems that on the first update newUpdate?field was undefined (only mattered if calling `onChange` on your own)
      const previousValue = newUpdate?.field?.value
      const newValue = getIn(formValues, newUpdate?.name)
      cms.events.dispatch({
        type: `forms:fields:onChange`,
        value: newValue,
        previousValue,
        mutationType: newUpdate.mutationType,
        formId: tinaForm.id,
        field: newUpdate.field,
      })
      setNewUpdate(null)
    }
  }, [JSON.stringify(formValues), cms])

  const { change, reset } = finalForm
  const { insert, move, remove, ...moreMutators } = finalForm.mutators

  const prepareNewUpdate = (
    name: string,
    mutationType:
      | { type: 'change' }
      | { type: 'insert'; at: string }
      | { type: 'move'; from: string; to: string }
      | { type: 'remove'; at: string }
      | { type: 'reset' }
  ) => {
    setNewUpdate({
      name,
      field: finalForm.getFieldState(name),
      mutationType,
    })
  }

  React.useMemo(() => {
    finalForm.reset = (initialValues) => {
      prepareNewUpdate('reset', { type: 'reset' })
      return reset(initialValues)
    }
    finalForm.change = (name, value) => {
      prepareNewUpdate(name.toString(), { type: 'change' })
      return change(name, value)
    }

    finalForm.mutators = {
      insert: (...args) => {
        prepareNewUpdate(args[0], { type: 'insert', at: args[1] })
        insert(...args)
      },
      move: (...args) => {
        prepareNewUpdate(args[0], {
          type: 'move',
          from: args[1],
          to: args[2],
        })
        move(...args)
      },
      remove: (...args) => {
        prepareNewUpdate(args[0], { type: 'remove', at: args[1] })
        remove(...args)
      },
      ...moreMutators,
    }
  }, [JSON.stringify(formValues)])
}

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[40px] leading-none inline-block ${className}`}
    {...props}
  />
)

const getFormShape = ({
  form,
  values,
  namePath,
  depth,
}: {
  form: Form<any>
  values: object
  namePath: string[]
  depth: string[]
}) => {
  const [first, ...rest] = namePath
  const field = form.fields.find((field) => field.name === first)
  if (field.type === 'object') {
    if (field.fields) {
      if (field.list) {
        const [index, ...rest2] = rest
        if (isNaN(Number(index))) {
          throw new Error(`Expected field's name path to include a number`)
        } else {
          const templateValue = getIn(values, `${first}.${index}`)
          const template = field
          if (rest2.length) {
            if (rest2.length === 1) {
              return {
                formShape: {
                  fields: template.fields.map((field) => {
                    console.log('go', field, depth)
                    return {
                      ...field,
                      name: `${depth.join('.')}.${first}.${index}.${
                        field.name
                      }`,
                    }
                  }),
                },
              }
            } else {
              return getFormShape({
                form: template,
                values: templateValue,
                namePath: rest2,
                depth: [...depth, first, index],
              })
            }
          } else {
            return { formShape: template }
          }
        }
      }
    } else if (field.templates) {
      if (field.list) {
        const [index, ...rest2] = rest
        if (isNaN(Number(index))) {
          throw new Error(`Expected field's name path to include a number`)
        } else {
          const templateValue = getIn(values, `${first}.${index}`)
          const template = field.templates[templateValue._template]
          if (rest2.length) {
            if (rest2.length === 1) {
              return {
                formShape: {
                  fields: template.fields.map((field) => {
                    return {
                      ...field,
                      name: `${depth.join('.')}.${first}.${index}.${
                        field.name
                      }`,
                    }
                  }),
                },
              }
            } else {
              return getFormShape({
                form: template,
                values: templateValue,
                namePath: rest2,
                depth: [...depth, first, index],
              })
            }
          } else {
            return { formShape: template }
          }
        }
      }
    } else {
      throw new Error(`Expected field to have sub fields or templates`)
    }
  } else {
    throw new Error(`Unexpected non-object field selected for form shape`)
  }
}

const getFields2 = ({
  fields,
  values,
  nameParts,
  prefix = '',
  parentNameParts,
}) => {
  if (nameParts.length === 0) {
    return { fields, nameParts }
  }
  const field = fields.find((field) => field.name === nameParts[0])
  if (!field) {
    throw new Error(`Unable to find field for ${nameParts.join('.')}`)
  }
  if (field?.type === 'reference') {
    return { fields: [], nameParts }
  }
  if (field?.type === 'object') {
    if (field.fields) {
      if (field.list) {
        if (nameParts.length === 2) {
          const fields: any[] = field.fields.map((subField: any) => ({
            ...subField,
            name: `${prefix ? `${prefix}.` : ''}${field.name}.${nameParts[1]}.${
              subField.name
            }`,
          }))
          return { fields, nameParts }
        } else {
          const value = getIn(values, `${nameParts[0]}.${nameParts[1]}`)
          return getFields2({
            fields: field.fields,
            values: value,
            nameParts: nameParts.slice(2),
            parentNameParts: nameParts.filter((part) => isNaN(Number(part))),
            prefix: `${field.name}.${nameParts[1]}`,
          })
        }
      } else {
        if (nameParts.length === 1) {
          const fields: any[] = field.fields.map((subField: any) => ({
            ...subField,
            name: `${prefix ? `${prefix}.` : ''}${field.name}.${subField.name}`,
          }))
          return { fields, nameParts }
        } else {
          const value = getIn(values, `${nameParts[0]}`)
          return getFields2({
            fields: field.fields,
            values: value,
            nameParts: nameParts.slice(1),
            parentNameParts: nameParts,
            prefix: `${field.name}`,
          })
        }
      }
    } else if (field.templates) {
      if (field.list) {
        if (nameParts.length === 2) {
          const value = getIn(values, nameParts.join('.'))
          const template = field.templates[value._template]
          // console.log('gotit', template)
          const fields: any[] = template.fields.map((subField: any) => ({
            ...subField,
            name: `${prefix ? `${prefix}.` : ''}${field.name}.${nameParts[1]}.${
              subField.name
            }`,
          }))
          return { fields, nameParts }
        } else {
          const value = getIn(values, `${nameParts[0]}.${nameParts[1]}`)
          const template = field.templates[value._template]
          return getFields2({
            fields: template.fields,
            values: value,
            nameParts: nameParts.slice(2),
            parentNameParts: nameParts.filter((part) => isNaN(Number(part))),
            prefix: `${field.name}.${nameParts[1]}`,
          })
        }
      } else {
        // not supported
        console.log('templates with out list is not supported')
      }
    }
  } else {
    // Return the parent list of fields
    // FIXME: this is just a workaround to stay unblocked but
    // this should instead traverse upwards to find the nearest
    // object-like parent and return their fields, it should
    // also have a way of programmatically focusing the field
    // in the form that was selected.
    return {
      fields: fields.map((subField: any) => ({
        ...subField,
        name: `${prefix ? `${prefix}.` : ''}${subField.name}`,
      })),
      nameParts: parentNameParts.slice(0, parentNameParts.length - 1),
    }
  }
}
