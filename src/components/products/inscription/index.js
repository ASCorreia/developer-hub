import {
  documentationSection,
  referencesSection
} from '@/shared/sections'
import { PencilSquareIcon } from '@heroicons/react/24/solid'
import { Hero } from './Hero'

export const inscription = {
  name: 'Inscription',
  headline: 'NFT inscribed on Solana',
  description: 'Inscribe Data to Solana state.',
  path: 'inscription',
  icon: <PencilSquareIcon />,
  navigationMenuCatergory: 'MPL',
  github: 'https://github.com/metaplex-foundation/mpl-inscription',
  className: 'accent-green',
  heroes: [{ path: '/inscription', component: Hero }],
  sections: [
    {
      ...documentationSection('inscription'),
      navigation: [
        {
          title: 'Introduction',
          links: [
            { title: 'Overview', href: '/inscription' },
            {
              title: 'Getting Started',
              href: '/inscription/getting-started',
              // Subpages: /js /rust, etc.
            },
            { title: 'FAQ', href: '/inscription/faq' },
          ],
        },
        {
          title: 'Features',
          links: [
            {
              title: 'Initialize',
              href: '/inscription/initialize',
            },
            { title: 'Write Data', href: '/inscription/write' },
            { title: 'Fetch', href: '/inscription/fetch' },
            { title: 'Clear Data', href: '/inscription/clear' },
            { title: 'Close', href: '/inscription/close' },
            { title: 'Authority', href: '/inscription/authority' },
          ],
        },
        {
          title: 'Advanced',
          links: [
            {
              title: 'Inscription Sharding',
              href: '/inscription/sharding',
            },
            // {
            //   title: 'Parallel Writes',
            //   href: '/inscription/parallel-writes',
            // },
          ],
        },
      ],
    },
    {
      ...referencesSection('inscription'),
      href: `https://mpl-inscription.typedoc.metaplex.com/`,
      target: '_blank',
    },
  ],
}
