"use client";

import Link from "next/link";
import { useState } from "react";

type LandingLink = {
  href: string;
  label: string;
};

type Props = {
  links: LandingLink[];
  showAnchors?: boolean;
  isAuthenticated?: boolean;
};

export function LandingNav({ links, showAnchors = true, isAuthenticated = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          SOR
        </Link>
        <nav className="hidden gap-4 text-sm font-medium text-slate-600 md:flex">
          {showAnchors &&
            links.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-slate-900">
                {link.label}
              </a>
            ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 md:inline-flex"
            >
              Ir al dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 md:inline-flex"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 md:inline-flex"
              >
                Crear cuenta
              </Link>
            </>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-700 md:hidden"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Abrir menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div
        className={`md:hidden transition-all ${menuOpen ? "max-h-96 border-t border-slate-200" : "max-h-0 overflow-hidden border-transparent"}`}
      >
        <div className="space-y-3 px-4 py-4">
          {showAnchors &&
            links.map((link) => (
              <a key={link.href} href={link.href} className="block text-sm font-medium text-slate-700" onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/dashboard"
                className="w-full rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
                onClick={closeMenu}
              >
                Ir al dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={closeMenu}
              >
                Iniciar sesion
              </Link>
              <Link
                href="/register"
                className="w-full rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
                onClick={closeMenu}
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
