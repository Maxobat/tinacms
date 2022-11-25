import Link from 'next/link'
import Head from 'next/head'

export const Layout = (props) => {
  return (
    <div className="w-screen h-screen absolute text-white">
      <Head>
        <title>Tina App</title>
        <meta name="description" content="A TinaCMS Application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="absolute top-0 w-full left-0 border-b-[1.5px] text-base font-medium uppercase tracking-wide border-indigo-700/50 shadow-[inset_0_-4px_12px_rgba(71,66,206,0.3)] drop-shadow-[0_5px_15px_rgba(71,66,206,0.4)] backdrop-blur bg-black/50 text-white">
        <div className="w-full flex justify-between items-center max-w-6xl mx-auto">
          <div className="px-8 py-5">
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              ariaHidden="true"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 mr-8 h-auto text-indigo-500 drop-shadow-[0_0_10px_rgba(71,66,206,0.7)]"
            >
              <path
                fillRule="evenodd"
                d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 11-9 0V4.125zm4.5 14.25a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
                clipRule="evenodd"
              ></path>
              <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.175-.274.257zM12.738 17.625l6.474-6.474a1.875 1.875 0 000-2.651L15.5 4.787a1.875 1.875 0 00-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375z"></path>
            </svg>
          </div>
          <ul className="flex px-4 gap-4 drop-shadow-[0_0_10px_rgba(71,66,206,0.7)]">
            <li className="relative px-4 py-5 z-40 text-base font-normal uppercase tracking-[0.035rem]">
              HOME
              <svg
                preserveAspectRatio="none"
                viewBox="0 0 230 230"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-[200%] h-full opacity-70"
              >
                <rect
                  x="230"
                  y="230"
                  width="230"
                  height="230"
                  transform="rotate(-180 230 230)"
                  fill="url(#paint0_radial_1_33)"
                />
                <defs>
                  <radialGradient
                    id="paint0_radial_1_33"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(345 230) rotate(90) scale(230 115)"
                  >
                    <stop stop-color="#1E2057" />
                    <stop offset="1" stop-color="#1E2057" stop-opacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </li>
            <li className="text-base px-4 py-5 text-indigo-400/70 font-normal uppercase tracking-[0.035rem]">
              ABOUT
            </li>
            <li className="text-base px-4 py-5 text-indigo-400/70 font-normal uppercase tracking-[0.035rem]">
              CONTACT
            </li>
          </ul>
          <div className="px-8 py-5 flex gap-6 items-center">
            {/* <a
              href="#"
              className="text-sm text-indigo-300 hover:text-white tracking-[0.035rem]"
            >
              SIGN IN
            </a> */}
            <button className="px-6 py-2 border-[1.5px] text-sm font-normal uppercase tracking-[0.035rem] border-indigo-700 rounded-[10px] shadow-[inset_0_0_8px_2px_rgba(71,66,206,0.4)] drop-shadow-[0_0_20px_rgba(71,66,206,0.3)] backdrop-blur bg-slate-900/50 hover:bg-indigo-900/50 text-indigo-200 hover:text-white">
              <span className="inline-block drop-shadow-[0_0_6px_rgba(30,32,87,0.5)]">
                SIGN UP
              </span>
            </button>
          </div>
        </div>
      </nav>
      {/* <header>
        <Link href="/">
          <a>Home</a>
        </Link>
        {' | '}
        <Link href="/posts">
          <a>Posts</a>
        </Link>
      </header> */}
      {props.children}
      <img
        src="/bg.png"
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      />
    </div>
  )
}
