export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          Built by{" "}
          <a className="hover:text-accent" href="https://github.com/AditiAdhikari05">
            Aditi Adhikari
          </a>.
        </p>
        <p className="font-mono text-xs">SimCLR · ViT · transformers.js</p>
      </div>
    </footer>
  );
}
