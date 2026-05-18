import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const LICENSES = [
  { name: "Next.js", version: "15.x", license: "MIT", url: "https://github.com/vercel/next.js/blob/canary/LICENSE" },
  { name: "React", version: "19.x", license: "MIT", url: "https://github.com/facebook/react/blob/main/LICENSE" },
  { name: "Tailwind CSS", version: "3.x", license: "MIT", url: "https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE" },
  { name: "Framer Motion", version: "11.x", license: "MIT", url: "https://github.com/framer/motion/blob/main/LICENSE.md" },
  { name: "Lucide React", version: "0.x", license: "ISC", url: "https://github.com/lucide-icons/lucide/blob/main/LICENSE" },
  { name: "@supabase/ssr", version: "0.x", license: "MIT", url: "https://github.com/supabase/supabase-js/blob/master/LICENSE" },
  { name: "clsx", version: "2.x", license: "MIT", url: "https://github.com/lukeed/clsx/blob/master/license" },
  { name: "next-themes", version: "0.x", license: "MIT", url: "https://github.com/pacocoursey/next-themes/blob/master/LICENSE" },
];

export default function LicensesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="h-16" aria-hidden />

      <section className="pt-14 pb-6">
        <div className="page-container max-w-3xl mx-auto">
          <p className="text-label mb-3">Legal</p>
          <h1 className="text-h1 mb-2">Open Source Licenses</h1>
          <p className="text-sm text-muted-foreground">
            EVONANCE is built on amazing open-source software. Below are the libraries we depend on and their respective licenses.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container max-w-3xl mx-auto">
          <div className="ev-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-6 py-3 border-b border-border bg-secondary/30">
              <span>Package</span>
              <span className="text-right pr-8">Version</span>
              <span className="text-right pr-8">License</span>
              <span className="text-right">Source</span>
            </div>
            <div className="divide-y divide-border/60">
              {LICENSES.map(lib => (
                <div key={lib.name} className="grid grid-cols-[1fr_auto_auto_auto] items-center px-6 py-4 hover:bg-secondary/20 transition-colors">
                  <p className="text-sm font-semibold">{lib.name}</p>
                  <p className="text-xs text-muted-foreground font-mono pr-8">{lib.version}</p>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary mr-8">{lib.license}</span>
                  <a href={lib.url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline font-medium">
                    View →
                  </a>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6 text-center">
            Full license texts are available in the <code className="bg-secondary px-1.5 py-0.5 rounded text-[11px]">node_modules</code> directory of the application source.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
