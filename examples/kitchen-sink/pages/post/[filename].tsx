import { InferGetStaticPropsType } from 'next'
import { Json, Markdown } from '../../components/json'
import { getField, useTina } from 'tinacms/dist/react'
import client from '../../.tina/__generated__/client'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  return (
    <>
      <h1 data-tinafield={getField(data.post, 'title')}>{data.post.title}</h1>
      <div data-tinafield={getField(data.post.seo, 'metaDescription')}>
        {data.post.seo?.metaDescription}
      </div>
      <Markdown content={data.post.body} />
      <Json src={data} />
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.mdx` }
  const props = await client.queries.post(variables)
  return {
    props: { ...props, variables },
  }
}

export const getStaticPaths = async () => {
  const connection = await client.queries.postConnection()
  return {
    paths: connection.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}
