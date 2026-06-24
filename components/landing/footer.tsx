import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/logo/woles_horizontal_logo_uniform.png"
                alt="Woles"
                width={100}
                height={30}
              />
            </Link>
            <p className="mt-2 text-label-md text-on-surface-variant">
              Semua urusan hidupmu, satu chat aja.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-label-md font-medium text-on-surface">Produk</h4>
            <ul className="space-y-2">
              {[
                ["/dashboard", "Dashboard"],
                ["/#features", "Fitur"],
                ["/#pricing", "Harga"],
                ["/register", "Daftar Gratis"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-label-md text-on-surface-variant hover:text-on-surface"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="mb-3 text-label-md font-medium text-on-surface">Reminder</h4>
            <ul className="space-y-2">
              {[
                ["/reminder-pajak-mobil", "Pajak Mobil"],
                ["/reminder-stnk", "STNK"],
                ["/reminder-sim", "SIM"],
                ["/reminder-servis-mobil", "Servis Mobil"],
                ["/reminder-passport", "Passport"],
                ["/reminder-subscription", "Langganan"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-label-md text-on-surface-variant hover:text-on-surface"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-label-md font-medium text-on-surface">Legal</h4>
            <ul className="space-y-2">
              {[
                ["/privacy", "Privacy Policy"],
                ["/terms", "Terms of Service"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-label-md text-on-surface-variant hover:text-on-surface"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3">
              {/* Social */}
              {["Instagram", "Twitter", "TikTok"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="text-label-sm text-on-surface-variant hover:text-on-surface"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-outline-variant pt-6 text-center">
          <p className="text-label-sm text-on-surface-variant">
            © {new Date().getFullYear()} Woles. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
