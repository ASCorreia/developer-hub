import Link from 'next/link'

import { Icon } from '@/components/icons'

export function QuickLinks({ children }) {
  return (
    <div className="not-prose my-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {children}
    </div>
  )
}

export function QuickLink({ title, description, href, target, icon }) {
  return (
    <div className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800">
      <div className="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.sky.50)),var(--quick-links-hover-bg,theme(colors.sky.50)))_padding-box,linear-gradient(to_bottom,var(--quick-links-hover-border))_border-box] group-hover:opacity-100 dark:[--quick-links-hover-bg:theme(colors.slate.800)]" />
      <div className="relative overflow-hidden rounded-xl p-6">
        {icon && (
          <Icon
            icon={icon}
            className="h-8 w-8 group-hover:text-accent-600 dark:group-hover:text-accent-500"
          />
        )}
        <h2 className="mt-4 font-display text-base text-slate-900 dark:text-white">
          <Link href={href} target={target}>
            <span className="absolute -inset-px rounded-xl" />
            {title}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  )
}
