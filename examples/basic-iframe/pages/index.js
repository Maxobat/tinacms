import { staticRequest } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../components/Layout'
import { useTina } from 'tinacms/dist/react'

const query = `query PageQuery {
  page(relativePath: "home.mdx"){
    Title
    body
  }
}`

const components = {
  button: (props) => {
    return (
      <>
        <button className="mt-12 px-8 py-4 border-[1.5px] text-[1.125rem] font-medium uppercase tracking-[0.035rem] border-indigo-500 rounded-[14px] shadow-[inset_0_0_8px_2px_rgba(71,66,206,0.7)] drop-shadow-[0_0_20px_rgba(71,66,206,0.3)] backdrop-blur bg-slate-900/50 hover:bg-indigo-900/50 text-white hover:text-indigo-200">
          <span className="inline-block drop-shadow-[0_0_6px_rgba(30,32,87,0.5)]">
            {props.text}
          </span>
        </button>
      </>
    )
  },
}

export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

  console.log(data)

  const content = data.page.body
  const title = data.page.Title

  return (
    <Layout>
      <div className="max-w-prose mx-auto px-6 pb-8 pt-10 flex flex-col gap-12 justify-center h-full ">
        {title && (
          <h2 className="text-[5rem] leading-[1] font-[500] bg-gradient-to-t from-indigo-200 via-indigo-50 to-white text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(71,66,206,1)]">
            {title}
          </h2>
        )}
        {/* <span className="w-[1.5px] h-8 bg-white"></span> */}
        <div className="text-indigo-200 drop-shadow-[0_0_10px_rgba(71,66,206,1)]">
          <TinaMarkdown content={content} components={components} />
        </div>
      </div>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const variables = {}
  let data = {}
  try {
    data = await staticRequest({
      query,
      variables,
    })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
