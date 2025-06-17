"use client"

import React, { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type TBreadCrumbProps = {
  homeElement: ReactNode
}

const NextBreadcrumb = ({ homeElement }: TBreadCrumbProps) => {
  const paths = usePathname()
  const pathNames = paths.split("/").filter((path) => path)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home Link */}
        <BreadcrumbItem key="home">
          <BreadcrumbLink asChild>
            <Link href="/">{homeElement}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {/* Separator (optional) */}
        {pathNames.length > 0 && (
          <BreadcrumbSeparator className="hidden md:block" />
        )}

        {/* Other Paths */}
        {pathNames.map((segment, index) => {
          const href = `/${pathNames.slice(0, index + 1).join("/")}`
          const label = segment[0].toUpperCase() + segment.slice(1)

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={href}>{label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < pathNames.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default NextBreadcrumb
