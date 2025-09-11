import React from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-lg mb-2">{t("footer.hesaa")}</h4>
          <ul className="space-y-1 text-sm text-white/90">
            <li><a className="hover:underline" href="#">{t("footer.careers")}</a></li>
            <li><a className="hover:underline" href="#">{t("footer.privacy")}</a></li>
            <li><a className="hover:underline" href="#">{t("footer.terms")}</a></li>
            <li><a className="hover:underline" href="#">{t("footer.sitemap")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">{t("footer.grants")}</h4>
          <ul className="space-y-1 text-sm text-white/90">
            <li><a className="hover:underline" href="#">NJFAMS Account</a></li>
            <li><a className="hover:underline" href="#">{t("footer.deadlines")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">{t("footer.njclass")}</h4>
          <ul className="space-y-1 text-sm text-white/90">
            <li><a className="hover:underline" href="#">{t("footer.applyNow")}</a></li>
            <li><a className="hover:underline" href="#">{t("footer.login")}</a></li>
            <li><a className="hover:underline" href="#">{t("footer.payment")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">{t("footer.contact")}</h4>
          <div className="flex items-center gap-4 text-2xl">
            <a aria-label="Facebook" href="#" className="hover:text-blue-400"><i className="fab fa-facebook"></i></a>
            <a aria-label="YouTube" href="#" className="hover:text-red-400"><i className="fab fa-youtube"></i></a>
            <a aria-label="X" href="#" className="hover:text-slate-300"><i className="fab fa-x-twitter"></i></a>
            <a aria-label="LinkedIn" href="#" className="hover:text-sky-300"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <img src="/assets/OPRA.jpg" alt="OPRA" className="h-8 w-auto" />
          <p className="text-sm text-white/80">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
