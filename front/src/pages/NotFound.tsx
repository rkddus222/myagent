import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className='bg-background-primary h-full flex items-center pb-40'>
      <div className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6'>
        <div className='mx-auto max-w-screen-sm text-center'>
          <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500'>
            404
          </h1>
          <p className='mb-4 text-3xl tracking-tight font-bold md:text-4xl text-primary'>
            Something's missing.
          </p>
          <p className='mb-4 text-lg font-light text-secondary'>
            Sorry, we can't find that page. You'll find lots to explore on the
            home page.
          </p>
          <Link
            to='/'
            className='inline-flex text-background-primary bg-aicfo-purple focus:ring-4 focus:outline-none focus:ring-primary font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary my-4'
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  )
}
