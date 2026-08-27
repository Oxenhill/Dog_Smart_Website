'use client';

import { useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export type MobileNavLink = { href: string; label: string };

type DrawerElement = HTMLDivElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

/**
 * Mobile navigation drawer, implemented per the `navigation-drawer`
 * modern-web-guidance pattern: a `popover="manual"` panel promoted to
 * the top layer, opened/closed by scrolling a snap-point surface so the
 * browser handles the swipe gesture natively, with an IntersectionObserver
 * as the single source of truth for open/closed state (rather than
 * tracking state manually in JS). Falls back to a plain fixed-position
 * toggle in browsers without Popover API support — see the `.is-open`
 * branches below and in globals.css.
 */
export default function MobileNav({
  links,
  bookHref,
}: {
  links: MobileNavLink[];
  bookHref: string;
}) {
  const drawerId = useId();
  const drawerRef = useRef<DrawerElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const drawer = drawerRef.current;
    const scroller = scrollerRef.current;
    const sheet = sheetRef.current;
    const openBtn = openBtnRef.current;
    if (!drawer || !scroller || !sheet || !openBtn) return;

    const hasPopover = typeof drawer.showPopover === 'function';
    const supportsScrollDrivenAnimation =
      typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');
    const supportsScrollInitialTarget =
      typeof CSS !== 'undefined' && CSS.supports('scroll-initial-target', 'nearest');

    function setMainInert(value: boolean) {
      document.querySelectorAll('main').forEach((el) => {
        (el as HTMLElement).inert = value;
      });
    }

    function onDrawerOpened() {
      setMainInert(true);
      openBtn?.setAttribute('aria-expanded', 'true');
      sheet?.focus();
    }

    function onDrawerClosed() {
      if (hasPopover) drawer?.hidePopover?.();
      else drawer?.classList.remove('is-open');
      setMainInert(false);
      openBtn?.setAttribute('aria-expanded', 'false');
    }

    async function openDrawer() {
      if (!drawer || !scroller) return;
      if (hasPopover) drawer.showPopover?.();
      else drawer.classList.add('is-open');

      if (!supportsScrollInitialTarget) {
        scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
      }
      scroller.scrollTo({ left: 0, behavior: 'auto' });
    }

    function closeDrawer() {
      if (!scroller) return;
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
    }

    function onScrollFallback() {
      if (!scroller || !sheet || !drawer) return;
      const ratio = 1 - scroller.scrollLeft / Math.max(sheet.offsetWidth, 1);
      drawer.style.setProperty('--drawer-backdrop', String(Math.max(0, Math.min(1, ratio))));
    }
    if (!supportsScrollDrivenAnimation) {
      scroller.addEventListener('scroll', onScrollFallback);
    }

    const visibleThreshold = 1 / Math.max(window.innerWidth, 1);
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio < visibleThreshold) onDrawerClosed();
        else if (entry.intersectionRatio >= 0.999) onDrawerOpened();
      },
      { root: null, threshold: [visibleThreshold, 1] }
    );
    observer.observe(sheet);

    function onBackdropClick(event: MouseEvent) {
      if (sheet && !sheet.contains(event.target as Node)) closeDrawer();
    }
    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer();
    }

    const linkEls = Array.from(sheet.querySelectorAll('a'));
    const closeBtn = drawer.querySelector<HTMLButtonElement>('[data-drawer-close]');
    openBtn.addEventListener('click', openDrawer);
    drawer.addEventListener('click', onBackdropClick);
    document.addEventListener('keydown', onKeydown);
    linkEls.forEach((el) => el.addEventListener('click', closeDrawer));
    closeBtn?.addEventListener('click', closeDrawer);

    return () => {
      openBtn.removeEventListener('click', openDrawer);
      drawer.removeEventListener('click', onBackdropClick);
      document.removeEventListener('keydown', onKeydown);
      scroller.removeEventListener('scroll', onScrollFallback);
      linkEls.forEach((el) => el.removeEventListener('click', closeDrawer));
      closeBtn?.removeEventListener('click', closeDrawer);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <button
        ref={openBtnRef}
        type="button"
        className="nav-burger"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls={drawerId}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div ref={drawerRef} id={drawerId} className="Drawer" popover="manual">
        <div ref={scrollerRef} className="Drawer-scroller">
          <div ref={sheetRef} className="Drawer-sheet" tabIndex={-1}>
            <div className="Drawer-head">
              <span className="Drawer-brand">
                <Image
                  src="/brand/dog-smart-logo.svg"
                  alt="Dog Smart Training & Behaviour"
                  width={150}
                  height={50}
                />
              </span>
              <button type="button" className="Drawer-close" aria-label="Close menu" data-drawer-close>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav aria-label="Primary">
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
            <a href={bookHref} className="pill solid Drawer-cta">
              Book Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
