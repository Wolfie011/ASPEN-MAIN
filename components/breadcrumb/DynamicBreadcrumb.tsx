"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type DynamicBreadcrumbProps = {
  homeElement: ReactNode;
  homeHref?: string;
  transformLabel?: (label: string) => string;
};

const defaultTransform = (label: string) =>
  label
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

const DynamicBreadcrumb = ({
  homeElement,
  homeHref = "/",
  transformLabel = defaultTransform,
}: DynamicBreadcrumbProps) => {
  const pathname = usePathname();
  const pathNames = pathname.split("/").filter((path) => path);

  return (
    <nav role="navigation" aria-label="Breadcrumb">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem key="home">
            <BreadcrumbLink asChild>
              <Link href={homeHref}>{homeElement}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathNames.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}

          {pathNames.map((segment, index) => {
            const href = `/${pathNames.slice(0, index + 1).join("/")}`;
            const label = transformLabel(segment);

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
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
};

export default DynamicBreadcrumb;
