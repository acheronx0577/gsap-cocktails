"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { navLinks } from "@/constants";

const Navbar = () => {
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 1023 });

  useGSAP(
    () => {
      const navEl = navRef.current;
      if (!navEl) return;

      gsap.from(".nav-brand, .nav-link-item, .nav-cta", {
        y: -18,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: navEl,
          start: "bottom top",
        },
      }).fromTo(
        navEl,
        {
          backgroundColor: "transparent",
          borderColor: "rgba(255,255,255,0)",
        },
        {
          backgroundColor: "rgba(0,0,0,0.62)",
          backdropFilter: "blur(14px)",
          borderColor: "rgba(231,211,147,0.18)",
          duration: 0.85,
          ease: "power2.inOut",
        },
      );
    },
    { scope: navRef },
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav ref={navRef} className={menuOpen ? "nav-open" : undefined}>
      <div className="nav-shell">
        <a href="#hero" className="nav-brand" onClick={closeMenu}>
          <img src="/images/logo.png" alt="" aria-hidden="true" />
          <span className="nav-brand-copy">
            <span className="nav-brand-name">Velvet Pour</span>
            <span className="nav-brand-tag">Est. 2024 · LA</span>
          </span>
        </a>

        {!isMobile && (
          <>
            <ul className="nav-links" aria-label="Primary">
              {navLinks.map((link, index) => (
                <li key={link.id} className="nav-link-item">
                  <a href={`#${link.id}`}>
                    <span className="nav-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="nav-label">{link.title}</span>
                  </a>
                </li>
              ))}
            </ul>

            <a href="#contact" className="nav-cta nav-link-item">
              Book a Table
            </a>
          </>
        )}

        {isMobile && (
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </div>

      {isMobile && (
        <div
          id="nav-mobile-menu"
          className="nav-mobile-panel"
          hidden={!menuOpen}
        >
          <ul className="nav-mobile-links">
            {navLinks.map((link, index) => (
              <li key={link.id}>
                <a href={`#${link.id}`} onClick={closeMenu}>
                  <span className="nav-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="nav-label">{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="nav-mobile-cta" onClick={closeMenu}>
            Book a Table
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
