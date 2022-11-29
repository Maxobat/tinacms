import React from 'react'
import { staticRequest } from 'tinacms'
import { client } from '../../.tina/__generated__/client'
import { Layout } from '../../components/Layout'
import { useTina } from 'tinacms/dist/react'

export default function Home(props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  console.log(data)

  const cleanedObject = React.useMemo(() => {
    const obj = {}
    Object.entries(data.post).forEach(([key, value]) => {
      if (!['_internalValues', '_internalSys'].includes(key)) {
        obj[key] = value
      }
    })
    return obj
  }, [JSON.stringify(data)])

  return (
    <Layout>
      <code>
        <pre
          style={{
            backgroundColor: 'lightgray',
          }}
        >
          {JSON.stringify(cleanedObject, null, 2)}
        </pre>
      </code>
    </Layout>
  )
}

export const getStaticPaths = async () => {
  const tinaProps = await staticRequest({
    query: `{
        postConnection {
          edges {
            node {
              _sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  })
  const paths = tinaProps.postConnection.edges.map((x) => {
    return { params: { slug: x.node._sys.filename } }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}
export const getStaticProps = async (ctx) => {
  const variables = {
    relativePath: ctx.params.slug + '.json',
  }
  const data = await client.queries.getPost({
    relativePath: ctx.params.slug + '.json',
  })

  return {
    props: {
      data: data.data,
      query: data.query,
      variables: data.variables,
    },
  }
}
