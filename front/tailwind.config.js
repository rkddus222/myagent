/** @type {import('tailwindcss').Config} */
const flowbite = require('flowbite-react/tailwind')

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', flowbite.content()],
  theme: {
    extend: {
      boxShadow: {
        'inset-b': 'inset 0 -1px 0 0 var(--border)',
        'inset-bl': 'inset 1px -1px 0 0 var(--border)',
        'inset-br': 'inset -1px -1px 0 0 var(--border)',
        'inset-tl': 'inset 1px 1px 0 0 var(--border)',
        'inset-tr': 'inset -1px 1px 0 0 var(--border)',
        'inset-t': 'inset 0 1px 0 0 var(--border)',
        'inset-r': 'inset -1px 0 0 0 var(--border)',
        'inset-l': 'inset 1px 0 0 0 var(--border)',
        'inset-all': 'inset 0 0 0 1px var(--border)'
      },
      colors: {
        aicfo: {
          purple: {
            DEFAULT: 'var(--aicfo-purple)',
            accent: 'var(--aicfo-purple-accent)'
          }
        },
        background: {
          syntax: {
            DEFAULT: 'var(--background-syntax)'
          },
          gray: {
            DEFAULT: 'var(--background-gray)'
          },
          primary: {
            DEFAULT: 'var(--background-primary)',
            accent: 'var(--background-secondary)'
          },
          card: {
            DEFAULT: 'var(--background-card)',
            accent: 'var(--background-card-accent)'
          },
          secondary: {
            DEFAULT: 'var(--background-secondary)',
            accent: 'var(--background-tertiary)'
          },
          tertiary: {
            DEFAULT: 'var(--background-tertiary)',
            accent: 'var(--background-tertiary/50)'
          },
          sidebar: {
            DEFAULT: 'var(--background-sidebar)',
            accent: 'var(--background-secondary)'
          }
        },
        hover: 'var(--text-hover)',
        primary: {
          DEFAULT: 'var(--text-primary)',
          accent: 'var(--text-primary/50)'
        },
        secondary: {
          DEFAULT: 'var(--text-secondary)',
          accent: 'var(--text-secondary/50)'
        },
        tertiary: {
          DEFAULT: 'var(--text-tertiary)',
          accent: 'var(--text-tertiary/50)'
        },
        border: 'var(--border)',
        placeholder: 'var(--placeholder)'
      },
      height: {
        'topbar-height': 'var(--topbar-height)',
        'searchbar-height': 'var(--searchbar-height)'
      },
      width: {
        'sidebar-width': 'var(--sidebar-width)',
        'right-modal-width': 'var(--right-modal-width)'
      },
      fontFamily: {
        sans: ['var(--font-family)']
      }
    }
  },
  plugins: [require('tailwindcss-inner-border'), flowbite.plugin()]
}
