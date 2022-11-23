import React from 'react'

type RenderValue = (args: { value: string | number | boolean }) => JSX.Element
type RenderRichText = (args: { value: { type: 'root' } }) => JSX.Element

export const Explorer2 = (props: {
  value: object
  renderValue: RenderValue
  renderRichText: RenderRichText
}) => {
  return (
    <div className="font-mono">
      <ObjectValueRenderer {...props} />
    </div>
  )
}
const ObjectValueRenderer = (props: {
  value: object
  renderValue: RenderValue
  renderRichText: RenderRichText
  showMetaFields?: boolean
}) => {
  const subEntries = Object.entries(props.value).map(([keyName, value]) => {
    return (
      <div key={keyName} className="gap-2">
        <UnknownRenderer
          keyName={keyName}
          value={value}
          renderValue={props.renderValue}
          renderRichText={props.renderRichText}
          showMetaFields={props.showMetaFields}
        />
      </div>
    )
  })
  return <div>{subEntries}</div>
}

const UnknownRenderer = ({
  keyName,
  value,
  renderValue,
  renderRichText,
  showMetaFields,
}: {
  keyName: string
  value: unknown
  renderValue: RenderValue
  renderRichText: RenderRichText
  showMetaFields?: boolean
}) => {
  const typeOfValue = typeof value
  const [expanded, setExpanded] = React.useState(true)

  if (!showMetaFields) {
    if (
      [
        'id',
        '_sys',
        '__typename',
        '__meta__',
        '_internalValues',
        '_internalSys',
      ].includes(keyName)
    ) {
      return
    }
  }
  if (Array.isArray(value)) {
    return (
      <div>
        <button
          onClick={() => setExpanded((exp) => !exp)}
          className="min-w-[48px] flex justify-start gap-2"
        >
          {keyName}: {'['}
          {!expanded && `...]`}
        </button>
        {expanded && (
          <div className="pl-4">
            {value.map((item, index) => (
              <UnknownRenderer
                key={String(index)}
                keyName={String(index)}
                value={item}
                renderValue={renderValue}
                renderRichText={renderRichText}
              />
            ))}
          </div>
        )}
        {expanded && <div>{']'}</div>}
      </div>
    )
  }
  if (typeOfValue === 'object') {
    if (value?.type === 'root') {
      return (
        <Value keyName={keyName} value={value} renderValue={renderRichText} />
      )
    }
    return (
      <ObjectRenderer
        keyName={keyName}
        value={value}
        renderValue={renderValue}
        renderRichText={renderRichText}
      />
    )
  }
  return <Value keyName={keyName} value={value} renderValue={renderValue} />
}

const Value = ({
  keyName,
  value,
  renderValue,
}: {
  keyName: string
  value: string | number | boolean
  renderValue: RenderValue
}) => {
  const keyDisplay = isNaN(Number(keyName)) ? `${keyName}: ` : ``
  return (
    <div className="flex gap-2">
      <div>{keyDisplay}</div>
      <div>{renderValue({ value })}</div>
    </div>
  )
}

const ObjectRenderer = ({ keyName, value, renderValue, renderRichText }) => {
  const [showMetaFields, setShowMetaFields] = React.useState(false)
  const [expanded, setExpanded] = React.useState(true)
  const v = value as object
  const keyDisplay = isNaN(Number(keyName)) ? `${keyName}: ` : ``
  if (value === null) {
    return (
      <div>
        <div className="flex gap-2">
          <div className="">{keyDisplay}</div>
          <div className="text-gray-400">null</div>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <div className="flex justify-between">
          <button
            onClick={() => setExpanded((exp) => !exp)}
            className="min-w-[48px] flex justify-start gap-2"
          >
            {keyDisplay}
            {'{'}
            {!expanded && `...}`}
          </button>
          {expanded && (
            <button
              onClick={() => {
                setShowMetaFields((show) => !show)
              }}
              className="min-w-[48px] text-sm text-gray-400"
            >
              {showMetaFields ? 'Hide meta fields' : 'Show meta fields'}
            </button>
          )}
        </div>
        {expanded && (
          <div className="pl-4">
            <ObjectValueRenderer
              value={v}
              renderValue={renderValue}
              renderRichText={renderRichText}
              showMetaFields={showMetaFields}
            />
          </div>
        )}
        {expanded && <div>{'}'}</div>}
      </div>
    )
  }
}
