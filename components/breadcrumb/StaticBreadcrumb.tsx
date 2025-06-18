import Link from "next/link";

interface StaticBreadcrumbProps {
  trail: {
    name: string;
    href?: string;
  }[];
}

const StaticBreadcrumb = ({ trail }: StaticBreadcrumbProps) => {
  const lastIndex = trail.length - 1;

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {trail[lastIndex]?.name}
      </h2>

      <nav role="navigation" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          {trail.map((item, index) => (
            <li key={item.name} className="flex items-center gap-1">
              {item.href && index !== lastIndex ? (
                <Link className="font-medium" href={item.href}>
                  {item.name}
                  <span className="mx-1">/</span>
                </Link>
              ) : (
                <span className="font-medium text-primary">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default StaticBreadcrumb;
