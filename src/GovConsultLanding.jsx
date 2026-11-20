import { useState, useEffect, useRef } from "react";

/* ─── Motion preference hook ─────────────────────────────────────── */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ─── Intersection fade hook ──────────────────────────────────────── */
function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeSection({ children, delay = 0, className = "", as: Tag = "div", ...props }) {
  const [ref, visible] = useFadeIn();
  const reduced = usePrefersReducedMotion();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: reduced || visible ? 1 : 0,
        transform: reduced || visible ? "translateY(0)" : "translateY(28px)",
        transition: reduced ? "none" : `opacity 0.65s cubic-bezier(.4,0,.2,1) ${delay}ms, transform 0.65s cubic-bezier(.4,0,.2,1) ${delay}ms`,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/* ─── Data ────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "About",    href: "#about"    },
  { label: "Process",  href: "#process"  },
  { label: "Contact",  href: "#contact"  },
];

const SERVICES = [
  {
    id: "compliance", label: "01",
    title: "Section 508 Compliance",
    description: "Full audits, remediation plans, and VPAT documentation ensuring your digital assets clear federal procurement review — the first time.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
        <circle cx="16" cy="7" r="3.5" fill="currentColor"/>
        <path d="M8 14h16M16 14v11M11 25l5-11 5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "ux", label: "02",
    title: "Civic UX Design",
    description: "Interfaces built for every public user — plain language, multilingual support, and research-backed architecture that earns trust at first click.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
        <rect x="4" y="6" width="24" height="17" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 28h8M16 23v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 13l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M17 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "strategy", label: "03",
    title: "Digital Strategy",
    description: "Technology roadmaps aligned with GSA schedules, IT modernization initiatives, and OMB policy directives — executable by your existing team.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
        <path d="M4 26L12 16l6 5 6-10 4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="26" cy="7" r="3" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "training", label: "04",
    title: "Team Training",
    description: "Hands-on WCAG 2.2 workshops for developers, designers, and content editors — delivered at your NYC or DC office, or remote.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
        <path d="M16 5L4 11l12 6 12-6-12-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 11v9M28 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 18v5l7 3 7-3v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const STEPS = [
  { num: "01", title: "Discovery",      body: "We audit your systems, contracts, and compliance gaps in a structured kickoff session." },
  { num: "02", title: "Audit & Plan",   body: "A detailed accessibility and UX audit produces a clear, prioritized remediation roadmap." },
  { num: "03", title: "Build & Fix",    body: "We work alongside your team or deliver independently — always with clean documentation." },
  { num: "04", title: "Certify & Ship", body: "Final VPAT, test reports, and sign-off ready for your contracting officer's procurement file." },
];

const STATS = [
  { value: "14+",  label: "Years serving NYC and federal agencies" },
  { value: "100%", label: "VPAT acceptance rate on first submission" },
  { value: "60+",  label: "Government contracts delivered" },
];

const CERTS = ["CPACC Certified", "WCAG 2.2 AAA", "GSA Schedule Eligible", "NYC MWBE", "SOC 2 Ready"];

/* ─── Component ───────────────────────────────────────────────────── */
/* ─── Contact form submission (Web3Forms) ─────────────────────────── */
// Free access key from https://web3forms.com, tied to contact@ckaccessibility.com.
// Set REACT_APP_WEB3FORMS_KEY in Vercel → Project → Settings → Environment Variables.
const WEB3FORMS_KEY = process.env.REACT_APP_WEB3FORMS_KEY;

function useContactForm() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | invalid
  const [message, setMessage] = useState("");
  const statusRef = useRef(null);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(":invalid");
      setStatus("invalid");
      setMessage("Please fill in your name, a valid email address, and a message.");
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    if (!WEB3FORMS_KEY) {
      setStatus("error");
      setMessage("The contact form isn't configured yet. Please email contact@ckaccessibility.com directly.");
      return;
    }

    setStatus("sending");
    setMessage("Sending your message…");
    const data = new FormData(form);
    data.append("access_key", WEB3FORMS_KEY);
    data.append("subject", `New inquiry from ${data.get("name")} — ckaccessibility.com`);
    data.append("from_name", "CK Accessibility website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Send failed");
      form.reset();
      setStatus("sent");
      setMessage("Thank you — your message was sent. We'll be in touch within one business day.");
    } catch {
      setStatus("error");
      setMessage("Sorry, your message couldn't be sent. Please try again or email contact@ckaccessibility.com.");
    }
    if (statusRef.current) statusRef.current.focus();
  }

  return { status, message, statusRef, onSubmit };
}

export default function App() {
  const contact = useContactForm();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef      = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen && firstFocusRef.current) firstFocusRef.current.focus();
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && menuOpen) setMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:        #0E0C0A;
          --deep:       #0F1923;
          --navy:       #152641;
          --electric:   #1A5CFF;
          --electric-lt:#4D80FF;
          --copper:     #C8692A;
          --copper-lt:  #E8844A;
          --parchment:  #F5F0E8;
          --stone:      #E2DBD0;
          --mist:       #9A9390;
          --ghost:      #5C5752;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans:  'DM Sans', system-ui, sans-serif;
        }

        html { scroll-behavior: smooth; font-size: 16px; }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        body {
          font-family: var(--sans);
          background: var(--parchment);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
        }

        /* ── Skip link ── */
        .skip-link {
          position: absolute; top: -120px; left: 1.5rem; z-index: 9999;
          background: var(--electric); color: #fff;
          font-family: var(--sans); font-weight: 600; font-size: .875rem;
          letter-spacing: .06em; text-transform: uppercase;
          padding: .75rem 1.5rem; border-radius: 2px; text-decoration: none;
          transition: top .2s;
        }
        .skip-link:focus { top: 1.25rem; outline: 3px solid #fff; outline-offset: 2px; }

        /* ── Global focus ── */
        :focus-visible {
          outline: 3px solid var(--electric);
          outline-offset: 3px;
          border-radius: 2px;
        }
        :focus:not(:focus-visible) { outline: none; }

        @media (forced-colors: active) {
          .btn-primary, .btn-ghost { border: 2px solid ButtonText; }
          :focus-visible { outline: 3px solid Highlight; }
        }

        /* ══ NAV ══ */
        .nav {
          position: fixed; top: 0; width: 100%; z-index: 100;
          transition: background .35s, box-shadow .35s;
        }
        .nav.scrolled {
          background: rgba(15,25,35,.97);
          box-shadow: 0 1px 0 rgba(255,255,255,.06), 0 4px 28px rgba(0,0,0,.4);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.4rem 2.5rem;
        }
        .nav-logo {
          font-family: var(--serif); font-size: 1.35rem; font-weight: 400;
          color: #fff; text-decoration: none; letter-spacing: .01em;
          display: flex; align-items: center; gap: .45rem;
        }
        .logo-ck { color: var(--electric-lt); font-style: italic; }
        .logo-div {
          display: inline-block; width: 1px; height: 17px;
          background: rgba(255,255,255,.28); margin: 0 .05rem;
          vertical-align: middle;
        }
        .nav-links { display: flex; gap: 2.5rem; list-style: none; align-items: center; }
        .nav-links a {
          color: rgba(255,255,255,.72); text-decoration: none;
          font-size: .78rem; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          position: relative; padding-bottom: 2px;
          transition: color .2s;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 1px; background: var(--electric-lt);
          transition: width .25s ease;
        }
        .nav-links a:hover { color: #fff; }
        .nav-links a:hover::after { width: 100%; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: .5rem;
          background: var(--electric); color: #fff;
          font-family: var(--sans); font-weight: 600; font-size: .78rem;
          letter-spacing: .1em; text-transform: uppercase;
          padding: .75rem 1.75rem; border-radius: 2px;
          border: 2px solid var(--electric);
          cursor: pointer; text-decoration: none; white-space: nowrap;
          transition: background .2s, border-color .2s, transform .15s, box-shadow .2s;
        }
        .btn-primary:hover {
          background: #0044D6; border-color: #0044D6;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,92,255,.4);
        }
        .btn-primary:active { transform: translateY(0); box-shadow: none; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: .5rem;
          background: transparent; color: rgba(255,255,255,.88);
          font-family: var(--sans); font-weight: 500; font-size: .78rem;
          letter-spacing: .1em; text-transform: uppercase;
          padding: .75rem 1.75rem; border-radius: 2px;
          border: 1px solid rgba(255,255,255,.32);
          cursor: pointer; text-decoration: none; white-space: nowrap;
          transition: border-color .2s, background .2s, transform .15s;
        }
        .btn-ghost:hover {
          border-color: rgba(255,255,255,.75);
          background: rgba(255,255,255,.07);
          transform: translateY(-2px);
        }

        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          gap: 5px; width: 44px; height: 44px;
          background: none; border: none; cursor: pointer;
          padding: .5rem; border-radius: 2px;
        }
        .hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #fff; border-radius: 2px;
          transition: transform .3s, opacity .3s;
          transform-origin: center;
        }
        .hamburger[aria-expanded="true"] span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger[aria-expanded="true"] span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .mobile-overlay {
          position: fixed; inset: 0; background: rgba(10,12,15,.72);
          z-index: 198; opacity: 0; pointer-events: none;
          transition: opacity .3s; backdrop-filter: blur(3px);
        }
        .mobile-overlay.open { opacity: 1; pointer-events: auto; }

        .mobile-drawer {
          position: fixed; top: 0; right: -100%; bottom: 0;
          width: min(340px, 92vw);
          background: var(--deep); z-index: 200;
          display: flex; flex-direction: column;
          border-left: 1px solid rgba(255,255,255,.06);
          transition: right .35s cubic-bezier(.4,0,.2,1);
        }
        .mobile-drawer.open { right: 0; }
        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .drawer-close {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.07); border: none; border-radius: 2px;
          color: #fff; font-size: 1.1rem; cursor: pointer;
          transition: background .2s;
        }
        .drawer-close:hover { background: rgba(255,255,255,.14); }
        .drawer-nav {
          display: flex; flex-direction: column;
          padding: 1.25rem 1.75rem; gap: 0; flex: 1;
        }
        .drawer-nav a {
          color: rgba(255,255,255,.78); text-decoration: none;
          font-size: .92rem; font-weight: 400;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,.07);
          transition: color .2s, padding-left .2s; display: block;
        }
        .drawer-nav a:hover { color: #fff; padding-left: .75rem; }
        .drawer-footer {
          padding: 1.5rem 1.75rem;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        /* ══ HERO ══ */
        .hero {
          min-height: 100vh; background: var(--deep);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 2.5rem 6rem;
          position: relative; overflow: hidden;
        }
        .hero-bg-letter {
          position: absolute; top: 50%; right: -4vw;
          transform: translateY(-52%);
          font-family: var(--serif);
          font-size: min(58vw, 700px);
          font-weight: 300; line-height: 1;
          color: rgba(255,255,255,.025);
          pointer-events: none; user-select: none;
          letter-spacing: -.06em;
        }
        .hero-line {
          position: absolute; top: 0; right: 22%;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(26,92,255,.45) 40%,
            rgba(200,105,42,.3) 72%,
            transparent 100%);
          pointer-events: none;
        }
        .hero-noise {
          position: absolute; inset: 0; opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none;
        }
        .hero-inner {
          max-width: 1200px; margin: 0 auto; width: 100%;
          position: relative; z-index: 1; padding-top: 9rem;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: .75rem;
          font-size: .7rem; font-weight: 600; color: var(--electric-lt);
          letter-spacing: .18em; text-transform: uppercase; margin-bottom: 2rem;
        }
        .eyebrow-line { display: block; width: 32px; height: 1px; background: currentColor; }
        .hero-h1 {
          font-family: var(--serif);
          font-size: clamp(3.2rem, 7.5vw, 7rem);
          font-weight: 300; color: #fff;
          line-height: 1.04; letter-spacing: -.025em;
          max-width: 16ch; margin-bottom: 2.5rem;
        }
        .hero-h1 em { font-style: italic; color: var(--electric-lt); }
        .hero-underline {
          position: relative; display: inline;
        }
        .hero-underline::after {
          content: ''; position: absolute;
          bottom: 4px; left: 0; width: 100%; height: 2px;
          background: var(--copper);
        }
        .hero-sub {
          font-size: clamp(.95rem, 1.6vw, 1.15rem);
          color: rgba(255,255,255,.62);
          max-width: 54ch; line-height: 1.85;
          font-weight: 300; margin-bottom: 3rem;
        }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
        .hero-scroll-cue {
          position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: .5rem;
          color: rgba(255,255,255,.3);
          font-size: .65rem; letter-spacing: .14em; text-transform: uppercase;
        }
        .hero-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,.35), transparent);
          animation: scrollPulse 2.2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { opacity: .35; transform: scaleY(1); transform-origin: top; }
          50%      { opacity: .75; transform: scaleY(1.25); transform-origin: top; }
        }

        /* ══ STATS ══ */
        .statsbar { background: var(--electric); padding: 0 2.5rem; }
        .statsbar-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3,1fr);
          text-align: center;
        }
        .stat-item {
          padding: 3.5rem 1rem;
          border-right: 1px solid rgba(255,255,255,.2);
        }
        .stat-item:last-child { border-right: none; }
        .stat-value {
          display: block;
          font-family: var(--serif);
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 300; color: #fff;
          line-height: 1; letter-spacing: -.03em;
          margin-bottom: .65rem;
        }
        .stat-label {
          font-size: .76rem; font-weight: 500;
          color: rgba(255,255,255,.78);
          letter-spacing: .07em; text-transform: uppercase;
          line-height: 1.5; max-width: 18ch; margin: 0 auto;
        }

        /* ══ SHARED SECTION ══ */
        .section { padding: 9rem 2.5rem; }
        .section-inner { max-width: 1200px; margin: 0 auto; }

        .label-tag {
          display: inline-flex; align-items: center; gap: .6rem;
          font-size: .7rem; font-weight: 600;
          letter-spacing: .16em; text-transform: uppercase;
          color: var(--electric); margin-bottom: 1rem;
        }
        .label-tag::before {
          content: ''; display: block; width: 20px; height: 1px; background: currentColor;
        }
        .section-h2 {
          font-family: var(--serif);
          font-size: clamp(2.4rem, 4.5vw, 4rem);
          font-weight: 300; color: var(--navy);
          line-height: 1.1; letter-spacing: -.025em;
          margin-bottom: 1.5rem;
        }
        .section-lead {
          font-size: 1.05rem; color: var(--ghost);
          max-width: 58ch; line-height: 1.85; font-weight: 300;
        }

        /* ══ SERVICES ══ */
        .services-bg { background: var(--parchment); }
        .services-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 3rem; align-items: end;
          margin-bottom: 4.5rem; padding-bottom: 4rem;
          border-bottom: 1px solid var(--stone);
        }
        .service-row {
          display: grid; grid-template-columns: 3rem 1fr 3rem;
          gap: 2rem; align-items: start;
          padding: 2.5rem 0;
          border-bottom: 1px solid var(--stone);
          position: relative; overflow: hidden;
          transition: padding-left .3s;
        }
        .service-row::before {
          content: ''; position: absolute;
          left: 0; top: 0; bottom: 0; width: 2px;
          background: var(--electric);
          transform: scaleY(0); transform-origin: top;
          transition: transform .35s ease;
        }
        .service-row:hover { padding-left: .75rem; }
        .service-row:hover::before { transform: scaleY(1); }
        .service-num {
          font-family: var(--serif); font-size: .8rem; font-weight: 400;
          color: var(--mist); padding-top: .25rem; letter-spacing: .06em;
        }
        .service-title {
          font-family: var(--serif); font-size: 1.6rem; font-weight: 400;
          color: var(--navy); margin-bottom: .6rem;
          display: inline-block;
          transition: color .25s;
        }
        .service-row:hover .service-title { color: var(--electric); }
        .service-desc {
          font-size: .9rem; color: var(--ghost);
          line-height: 1.78; font-weight: 300; max-width: 54ch;
        }
        .service-icon {
          color: var(--electric); opacity: .45;
          transition: opacity .25s; padding-top: .25rem;
          display: flex; justify-content: flex-end;
        }
        .service-row:hover .service-icon { opacity: 1; }

        /* ══ ABOUT ══ */
        .about-bg { background: var(--navy); position: relative; overflow: hidden; }
        .about-noise {
          position: absolute; inset: 0; opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px; pointer-events: none;
        }
        .about-swatch {
          position: absolute; top: 0; right: 0;
          width: 40%; height: 100%;
          background: linear-gradient(135deg, transparent 45%, rgba(200,105,42,.1) 100%);
          pointer-events: none;
        }
        .about-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 7rem; align-items: center; position: relative; z-index: 1;
        }
        .about-quote-mark {
          font-family: var(--serif); font-size: 8rem; line-height: .7;
          color: var(--electric-lt); opacity: .22;
          display: block; margin-bottom: -.5rem;
        }
        .about-quote {
          font-family: var(--serif);
          font-size: clamp(1.45rem, 2.4vw, 2.1rem);
          font-weight: 300; color: #fff;
          line-height: 1.42; font-style: italic;
          border-left: 2px solid var(--copper);
          padding-left: 1.75rem;
        }
        .about-quote-attr {
          margin-top: 1.5rem; padding-left: 1.75rem;
          font-size: .72rem; color: rgba(255,255,255,.4);
          letter-spacing: .1em; text-transform: uppercase;
        }
        .about-label { color: var(--copper-lt) !important; }
        .about-label::before { background: var(--copper-lt) !important; }
        .about-h2 {
          font-family: var(--serif);
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 300; color: #fff;
          line-height: 1.15; letter-spacing: -.02em; margin-bottom: 1.5rem;
        }
        .about-text {
          font-size: .93rem; color: rgba(255,255,255,.62);
          line-height: 1.88; font-weight: 300; margin-bottom: 1rem;
        }
        .cert-list { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 2rem; list-style: none; }
        .cert-badge {
          display: inline-flex; align-items: center; gap: .45rem;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 2px; padding: .4rem 1rem;
          font-size: .7rem; font-weight: 600;
          color: rgba(255,255,255,.72);
          letter-spacing: .08em; text-transform: uppercase;
          transition: background .2s, border-color .2s;
        }
        .cert-badge:hover { background: rgba(255,255,255,.09); border-color: rgba(255,255,255,.25); }
        .cert-check { color: var(--copper-lt); }

        /* ══ PROCESS ══ */
        .process-bg { background: var(--stone); }
        .process-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 3rem; margin-bottom: 5rem;
        }
        .steps-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          border: 1px solid rgba(21,38,65,.14);
          border-radius: 2px; overflow: hidden;
        }
        .step {
          padding: 3rem 2.5rem;
          border-right: 1px solid rgba(21,38,65,.12);
          position: relative; transition: background .3s;
        }
        .step:last-child { border-right: none; }
        .step:hover { background: rgba(255,255,255,.55); }
        .step::after {
          content: ''; position: absolute; top: 0; left: 0;
          width: 100%; height: 3px; background: var(--electric);
          transform: scaleX(0); transform-origin: left;
          transition: transform .4s ease;
        }
        .step:hover::after { transform: scaleX(1); }
        .step-num {
          display: block;
          font-family: var(--serif); font-size: 4.5rem; font-weight: 300;
          line-height: 1; letter-spacing: -.04em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(21,38,65,.2);
          margin-bottom: 1.5rem;
          transition: -webkit-text-stroke .3s;
        }
        .step:hover .step-num { -webkit-text-stroke: 1px var(--electric); }
        .step-title {
          font-family: var(--serif); font-size: 1.3rem; font-weight: 400;
          color: var(--navy); margin-bottom: .65rem;
        }
        .step-body { font-size: .87rem; color: var(--ghost); line-height: 1.72; font-weight: 300; }

        /* ══ CONTACT ══ */
        .contact-bg { background: var(--parchment); }
        .contact-grid {
          display: grid; grid-template-columns: 5fr 7fr;
          gap: 7rem; align-items: start;
        }
        .contact-h2 {
          font-family: var(--serif);
          font-size: clamp(2rem, 3.5vw, 3.2rem);
          font-weight: 300; color: var(--navy);
          line-height: 1.15; letter-spacing: -.02em; margin-bottom: 1.5rem;
        }
        .contact-body {
          font-size: .93rem; color: var(--ghost);
          line-height: 1.85; font-weight: 300; margin-bottom: 2.5rem;
        }
        .contact-details { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
        .contact-item {
          display: flex; align-items: center; gap: 1rem;
          font-size: .9rem; color: var(--navy);
        }
        .contact-icon-wrap {
          width: 40px; height: 40px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(26,92,255,.08); border-radius: 2px;
          color: var(--electric); font-size: .95rem;
          transition: background .2s;
        }
        .contact-item:hover .contact-icon-wrap { background: rgba(26,92,255,.14); }
        .contact-item a {
          color: var(--navy); text-decoration: none;
          border-bottom: 1px solid var(--stone);
          transition: color .2s, border-color .2s;
        }
        .contact-item a:hover { color: var(--electric); border-color: var(--electric); }

        /* ── Form ── */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: .45rem; }
        .form-group.full { grid-column: 1 / -1; }
        .form-label {
          font-size: .7rem; font-weight: 600; color: var(--navy);
          letter-spacing: .1em; text-transform: uppercase;
        }
        .form-req { color: var(--electric); margin-left: .15rem; }
        .form-input, .form-textarea, .form-select {
          font-family: var(--sans); font-size: .93rem; color: var(--ink);
          background: #fff; border: 1.5px solid var(--stone);
          border-radius: 2px; padding: .85rem 1rem;
          transition: border-color .2s, box-shadow .2s;
          width: 100%; appearance: none; -webkit-appearance: none;
        }
        .form-input::placeholder,
        .form-textarea::placeholder { color: var(--mist); }
        .form-input:hover, .form-textarea:hover, .form-select:hover { border-color: #b8b2a8; }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: 3px solid var(--electric);
          outline-offset: 2px;
          border-color: var(--electric);
          box-shadow: 0 0 0 5px rgba(26,92,255,.1);
        }
        .form-textarea { resize: vertical; min-height: 130px; }
        .select-wrap { position: relative; }
        .select-wrap::after {
          content: '▾'; position: absolute; right: 1rem; top: 50%;
          transform: translateY(-50%); color: var(--ghost);
          pointer-events: none; font-size: .8rem;
        }
        .btn-submit {
          width: 100%; padding: 1.1rem; margin-top: .5rem;
          justify-content: center; font-size: .82rem;
        }
        .btn-submit[disabled] { opacity: .7; cursor: wait; }
        .hp-field { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
        .form-status { margin-top: 1rem; font-size: .95rem; line-height: 1.5; min-height: 1.5em; }
        .form-status:focus { outline: 2px solid currentColor; outline-offset: 4px; }
        .form-status--sent { color: #1f7a3f; font-weight: 600; }
        .form-status--error, .form-status--invalid { color: #b3261e; font-weight: 600; }

        /* ══ FOOTER ══ */
        footer { background: var(--ink); padding: 3rem 2.5rem; }
        .footer-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1.5rem;
        }
        .footer-brand {
          font-family: var(--serif); font-size: 1.1rem;
          color: rgba(255,255,255,.45); text-decoration: none;
        }
        .footer-brand em { color: var(--electric-lt); font-style: italic; }
        .footer-meta { font-size: .76rem; color: rgba(255,255,255,.32); line-height: 1.75; text-align: right; }
        .footer-meta a { color: var(--electric-lt); text-decoration: none; }
        .footer-meta a:hover { text-decoration: underline; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          .services-header { grid-template-columns: 1fr; gap: 1.5rem; }
          .service-row { grid-template-columns: 2.5rem 1fr; }
          .service-icon { display: none; }
          .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 3.5rem; }
          .process-header { grid-template-columns: 1fr; gap: 1.5rem; }
          .steps-grid { grid-template-columns: 1fr 1fr; }
          .step { border-bottom: 1px solid rgba(21,38,65,.12); }
          .step:nth-child(2n) { border-right: none; }
          .statsbar-inner { grid-template-columns: 1fr; }
          .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,.18); }
          .stat-item:last-child { border-bottom: none; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
          .footer-meta { text-align: left; }
          .form-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .hero { padding: 0 1.5rem 5rem; }
          .section { padding: 6rem 1.5rem; }
          .steps-grid { grid-template-columns: 1fr; }
          .step { border-right: none; }
          .hero-scroll-cue { display: none; }
          .nav-inner { padding: 1.2rem 1.5rem; }
        }
      `}</style>

      {/* Skip link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Mobile overlay */}
      <div className={`mobile-overlay${menuOpen ? " open" : ""}`} onClick={closeMenu} aria-hidden="true" />

      {/* Mobile drawer */}
      <div
        ref={menuRef} id="mobile-nav"
        className={`mobile-drawer${menuOpen ? " open" : ""}`}
        role="dialog" aria-modal="true" aria-label="Site navigation"
      >
        <div className="drawer-header">
          <span className="nav-logo" style={{ fontSize: "1.1rem" }}>
            <span className="logo-ck">CK</span>
            <span className="logo-div" aria-hidden="true" />
            Accessibility
          </span>
          <button ref={firstFocusRef} className="drawer-close" onClick={closeMenu} aria-label="Close navigation menu">✕</button>
        </div>
        <nav className="drawer-nav" aria-label="Mobile navigation">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={closeMenu}>{l.label}</a>
          ))}
        </nav>
        <div className="drawer-footer">
          <a href="#contact" className="btn-primary btn-submit" onClick={closeMenu} style={{ display: "flex" }}>
            Get in Touch
          </a>
        </div>
      </div>

      {/* Header */}
      <header role="banner">
        <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Main navigation">
          <div className="nav-inner">
            <a href="#main-content" className="nav-logo" aria-label="CK Accessibility — home">
              <span className="logo-ck">CK</span>
              <span className="logo-div" aria-hidden="true" />
              Accessibility
            </a>
            {/* role="list" restores list semantics in Safari/VoiceOver when list-style is none */}
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ul className="nav-links" role="list">
              {NAV_LINKS.map((l) => (
                <li key={l.href}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
            <a href="#contact" className="btn-primary nav-cta" style={{ fontSize: ".74rem", padding: ".65rem 1.4rem" }}>
              Work with us
            </a>
            <button
              className="hamburger"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex="-1">

        {/* ── HERO ── */}
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-noise" aria-hidden="true" />
          <div className="hero-line"  aria-hidden="true" />
          <div className="hero-bg-letter" aria-hidden="true">A</div>

          <div className="hero-inner">
            <FadeSection>
              <p className="hero-eyebrow">
                <span className="eyebrow-line" aria-hidden="true" />
                NYC · Federal · Accessible by Default
              </p>
              <h1 className="hero-h1" id="hero-heading">
                Government tech that includes{" "}
                <em><span className="hero-underline">everyone.</span></em>
              </h1>
              <p className="hero-sub">
                CK Accessibility is a New York–based consultancy specializing in Section 508
                compliance, civic UX, and digital strategy for public-sector agencies.
                We build trustworthy systems that serve every constituent — without exception.
              </p>
              <div className="hero-actions">
                <a href="#contact" className="btn-primary">Work with us</a>
                <a href="#services" className="btn-ghost">Our services</a>
              </div>
            </FadeSection>
          </div>

          <div className="hero-scroll-cue" aria-hidden="true">
            <span>Scroll</span>
            <span className="hero-scroll-line" />
          </div>
        </section>

        {/* ── STATS ── */}
        <section aria-label="Key statistics" className="statsbar">
          <dl className="statsbar-inner">
            {STATS.map((s, i) => (
              <FadeSection key={s.label} delay={i * 80} as="div" className="stat-item">
                <dt className="stat-label">{s.label}</dt>
                <dd className="stat-value">{s.value}</dd>
              </FadeSection>
            ))}
          </dl>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="section services-bg" aria-labelledby="services-heading">
          <div className="section-inner">
            <div className="services-header">
              <FadeSection>
                <p className="label-tag">What we do</p>
                <h2 className="section-h2" id="services-heading">
                  Compliance-first.<br />Human-centered.
                </h2>
              </FadeSection>
              <FadeSection delay={100}>
                <p className="section-lead">
                  Every engagement is scoped to pass procurement review and serve real people —
                  those two goals are never in tension when accessibility is foundational, not an afterthought.
                </p>
              </FadeSection>
            </div>
            <div role="list" aria-label="Services offered">
              {SERVICES.map((s, i) => (
                <FadeSection key={s.id} delay={i * 60}>
                  <article className="service-row" role="listitem">
                    <span className="service-num" aria-hidden="true">{s.label}</span>
                    <div>
                      <h3 className="service-title">{s.title}</h3>
                      <p className="service-desc">{s.description}</p>
                    </div>
                    <div className="service-icon" aria-hidden="true">{s.icon}</div>
                  </article>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="section about-bg" aria-labelledby="about-heading">
          <div className="about-noise" aria-hidden="true" />
          <div className="about-swatch" aria-hidden="true" />
          <div className="section-inner">
            <div className="about-grid">
              <FadeSection>
                <span className="about-quote-mark" aria-hidden="true">"</span>
                <blockquote className="about-quote">
                  Accessibility isn't a feature you add at the end — it's the foundation
                  every durable government system is built on.
                </blockquote>
                <p className="about-quote-attr" aria-label="Quote attribution">
                  — CK Accessibility, founding principle
                </p>
              </FadeSection>

              <FadeSection delay={140}>
                <p className="label-tag about-label">About us</p>
                <h2 className="about-h2" id="about-heading">Built for the public sector</h2>
                <p className="about-text">
                  Founded in New York City, CK Accessibility has spent over a decade embedded
                  in city agencies, federal bureaus, and nonprofit partners. We know how
                  procurement works, how IT modernization stalls, and how to move projects
                  through approval chains without losing design integrity.
                </p>
                <p className="about-text">
                  Our principal holds certifications in accessibility (CPACC) and has served as
                  a technical advisor on OMB equity initiatives. We are a certified small business
                  eligible for set-aside contracts.
                </p>
                <ul className="cert-list" aria-label="Certifications and qualifications">
                  {CERTS.map((c) => (
                    <li key={c} className="cert-badge">
                      <span className="cert-check" aria-hidden="true">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </FadeSection>
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="process" className="section process-bg" aria-labelledby="process-heading">
          <div className="section-inner">
            <div className="process-header">
              <FadeSection>
                <p className="label-tag">How we work</p>
                <h2 className="section-h2" id="process-heading">
                  A clear path to compliant delivery
                </h2>
              </FadeSection>
              <FadeSection delay={100}>
                <p className="section-lead" style={{ paddingTop: "3.5rem" }}>
                  Four structured phases. No ambiguity. Your contracting officer will thank you.
                </p>
              </FadeSection>
            </div>
            <div className="steps-grid" role="list" aria-label="Our four-step process">
              {STEPS.map((step, i) => (
                <FadeSection key={step.num} delay={i * 80}>
                  <div className="step" role="listitem">
                    <span className="step-num" aria-hidden="true">{step.num}</span>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-body">{step.body}</p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="section contact-bg" aria-labelledby="contact-heading">
          <div className="section-inner">
            <div className="contact-grid">
              <FadeSection>
                <p className="label-tag">Let's talk</p>
                <h2 className="contact-h2" id="contact-heading">
                  Ready to build accessible civic technology?
                </h2>
                <p className="contact-body">
                  Tell us about your agency's needs and we'll respond within one business day
                  with a proposed engagement structure — no obligation.
                </p>
                <address style={{ fontStyle: "normal" }}>
                  <ul className="contact-details" aria-label="Contact information">
                    <li className="contact-item">
                      <span className="contact-icon-wrap" aria-hidden="true">✉</span>
                      <a href="mailto:contact@ckaccessibility.com">contact@ckaccessibility.com</a>
                    </li>
                    <li className="contact-item">
                      <span className="contact-icon-wrap" aria-hidden="true">⌖</span>
                      <span>New York, NY 11101</span>
                    </li>
                  </ul>
                </address>
              </FadeSection>

              <FadeSection delay={100}>
                <form
                  noValidate
                  aria-label="Contact form — fields marked with an asterisk are required"
                  onSubmit={contact.onSubmit}
                  aria-describedby="form-status"
                >
                  {/* Honeypot: hidden from people and assistive tech, catches spam bots */}
                  <input type="checkbox" name="botcheck" className="hp-field"
                    tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="f-name" className="form-label">
                        Full Name <span className="form-req" aria-label="required">*</span>
                      </label>
                      <input type="text" id="f-name" name="name" className="form-input"
                        autoComplete="name" required aria-required="true" placeholder="Jane Smith" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="f-email" className="form-label">
                        Email <span className="form-req" aria-label="required">*</span>
                      </label>
                      <input type="email" id="f-email" name="email" className="form-input"
                        autoComplete="email" required aria-required="true" placeholder="jane@agency.gov" />
                    </div>

                    <div className="form-group full">
                      <label htmlFor="f-agency" className="form-label">Agency / Organization</label>
                      <input type="text" id="f-agency" name="agency" className="form-input"
                        autoComplete="organization" placeholder="NYC Department of…" />
                    </div>

                    <div className="form-group full">
                      <label htmlFor="f-service" className="form-label">Primary Interest</label>
                      <div className="select-wrap">
                        <select id="f-service" name="service" className="form-select">
                          <option value="">Select a service…</option>
                          <option value="508">Section 508 Compliance</option>
                          <option value="ux">Civic UX Design</option>
                          <option value="strategy">Digital Strategy</option>
                          <option value="training">Team Training</option>
                          <option value="other">Other / Not sure yet</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group full">
                      <label htmlFor="f-message" className="form-label">
                        Message <span className="form-req" aria-label="required">*</span>
                      </label>
                      <textarea id="f-message" name="message" className="form-textarea"
                        required aria-required="true"
                        placeholder="Briefly describe your project or question…" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary btn-submit"
                    disabled={contact.status === "sending"}
                    aria-disabled={contact.status === "sending"}>
                    {contact.status === "sending" ? "Sending…" : "Send Message"}
                  </button>
                  <p id="form-status" ref={contact.statusRef} tabIndex={-1}
                    role={contact.status === "error" || contact.status === "invalid" ? "alert" : "status"}
                    className={`form-status form-status--${contact.status}`}>
                    {contact.message}
                  </p>
                </form>
              </FadeSection>
            </div>
          </div>
        </section>

      </main>

      <footer role="contentinfo">
        <div className="footer-inner">
          <a href="#main-content" className="footer-brand" aria-label="CK Accessibility — back to top">
            <em>CK</em> Accessibility
          </a>
          <div className="footer-meta">
            <p>© {new Date().getFullYear()} CK Accessibility LLC · New York, NY</p>
            <p>
              Built to{" "}
              <a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank" rel="noopener noreferrer">
                WCAG 2.2 AA
              </a>
              {" "}standards · Section 508 compliant ·{" "}
              <a href="#main-content">Back to top</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
