import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-ink/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm">
          repr.explorer
        </Link>
        <ul className="flex gap-6 text-sm">
          <li>
            <Link href="/explore" className="hover:text-accent">
              Explore
            </Link>
          </li>
          <li>
            <Link href="/attention" className="hover:text-accent">
              Attention
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/AditiAdhikari05/representation-explorer"
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
