import React from "react";

const Footer = () => {
  const appVersion = import.meta.env.VITE_APP_VERSION || "v1.0.0";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <section>
          <p className="text-lg font-semibold text-slate-900">ResumAI</p>
          <p className="mt-2 text-sm text-slate-600">
            AI-powered resume feedback platform to improve ATS compatibility and job-fit score.
          </p>
        </section>

        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <a href="/" className="hover:text-slate-900">
              Home
            </a>
            <a href="/upload" className="hover:text-slate-900">
              Upload Resume
            </a>
            <a href="/auth" className="hover:text-slate-900">
              Login / Signup
            </a>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Connect</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <a
              href="https://github.com/Trixxy98"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-slate-900"
            >
              GitHub
            </a>
            <a href="#" className="hover:text-slate-900">
              Facebook
            </a>
            <a href="#" className="hover:text-slate-900">
              Instagram
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {currentYear} ResumAI. All rights reserved.</p>
          <p>
            System version: <span className="font-semibold text-slate-600">{appVersion}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
