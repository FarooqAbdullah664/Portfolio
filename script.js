// ============================================================
// PRELOADER — counts from 01 to 100, then reveals hero
// ============================================================
(function preloaderSequence(){
  const countEl = document.getElementById('preloaderCount');
  const lineFill = document.getElementById('preloaderLineFill');
  const preloader = document.getElementById('preloader');
  const preloaderInner = document.querySelector('.preloader-inner');
  const duration = 2200;
  const start = performance.now();
  let done = false;

  function frame(now){
    if (done) return;
    const elapsed = now - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.max(1, Math.round(eased * 100));

    countEl.innerHTML = String(value).padStart(2, '0') + '<span class="pct">%</span>';
    lineFill.style.width = (eased * 100) + '%';

    if (t < 1){
      requestAnimationFrame(frame);
    } else {
      finishPreloader();
    }
  }

  requestAnimationFrame(frame);

  function finishPreloader(){
    if (done) return;
    done = true;

    // brief hold + pop, then fade the whole preloader away
    preloaderInner.classList.add('preloader-pop');

    setTimeout(() => {
      preloader.classList.add('preloader-exit');
      setTimeout(() => {
        preloader.style.display = 'none';
        revealHero();
      }, 650);
    }, 380);
  }

  // Safety net: never let the preloader trap the page.
  setTimeout(() => { if (!done) finishPreloader(); }, duration + 1500);
})();

// ============================================================
// HERO REVEAL — staged entrance via a single class toggle;
// CSS transition-delay on each element choreographs the sequence.
// ============================================================
function revealHero(){
  document.getElementById('navbar').classList.add('is-in');
  document.getElementById('hero').classList.add('is-revealed');
}

// ============================================================
// NAVBAR — solid background on scroll + mobile menu toggle
// ============================================================
const navbarEl = document.getElementById('navbar');
function updateNavbarScrollState(){
  if (window.scrollY > 40) navbarEl.classList.add('solid');
  else navbarEl.classList.remove('solid');
}
window.addEventListener('scroll', updateNavbarScrollState, { passive: true });
updateNavbarScrollState();

const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

function closeMobileNav(){
  navMobile.classList.remove('open');
  navBurger.classList.remove('open');
  navBurger.setAttribute('aria-expanded', 'false');
  navBurger.setAttribute('aria-label', 'Open menu');
}

navBurger.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navBurger.classList.toggle('open', isOpen);
  navBurger.setAttribute('aria-expanded', String(isOpen));
  navBurger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMobileNav);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 980) closeMobileNav();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileNav();
});

const trackedSections = ['hero', 'about', 'work', 'skills', 'education', 'certificates', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const trackedNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-mobile a[href^="#"]');

const setActiveNavLink = (sectionId) => {
  trackedNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
  });
};

if (trackedSections.length) {
  const navSectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) setActiveNavLink(visible.target.id);
  }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.1, 0.25] });

  trackedSections.forEach(section => navSectionObserver.observe(section));
}

// ============================================================
// MOUSE INTERACTION — cursor glow, DEVELOPER parallax, portrait tilt
// ============================================================
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const bgType = document.getElementById('heroBgType');
const portraitImg = document.getElementById('portraitImg');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX, glowY = mouseY;
let dotX = mouseX, dotY = mouseY;
let ringX = mouseX, ringY = mouseY;

let targetBgX = 0, targetBgY = 0, curBgX = 0, curBgY = 0;
let targetPX = 0, targetPY = 0, curPX = 0, curPY = 0;
let scrollBgY = 0;

const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

if (!isCoarsePointer){
  document.body.classList.add('has-custom-cursor');
  cursorDot.style.opacity = '1';
  cursorRing.style.opacity = '1';

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const relX = (e.clientX / window.innerWidth) - 0.5;
    const relY = (e.clientY / window.innerHeight) - 0.5;

    targetBgX = relX * 36;
    targetBgY = relY * 22;
    targetPX = relX * -14;
    targetPY = relY * -8;
  }, { passive: true });

  // grow the ring + hide the dot over anything clickable
  const hoverables = document.querySelectorAll('a, button, .btn, .cv-link, .nav-cta, .orbit-item');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('is-hover');
      cursorDot.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('is-hover');
      cursorDot.classList.remove('is-hover');
    });
  });

  window.addEventListener('mousedown', () => cursorRing.style.transform = 'translate(-50%, -50%) scale(0.85)');
  window.addEventListener('mouseup', () => cursorRing.style.transform = 'translate(-50%, -50%) scale(1)');
} else {
  cursorGlow.style.display = 'none';
  cursorDot.style.display = 'none';
  cursorRing.style.display = 'none';
}

window.addEventListener('scroll', () => {
  scrollBgY = window.scrollY * 0.12;
}, { passive: true });

function raf(){
  // glow — slow, wide follow
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;
  cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;

  // dot — near-instant follow
  dotX += (mouseX - dotX) * 0.9;
  dotY += (mouseY - dotY) * 0.9;
  cursorDot.style.left = dotX + 'px';
  cursorDot.style.top = dotY + 'px';

  // ring — slight trailing lag for a premium feel
  ringX += (mouseX - ringX) * 0.16;
  ringY += (mouseY - ringY) * 0.16;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';

  // smooth-follow parallax for bg type (anchored left, only vertical centering + drift)
  curBgX += (targetBgX - curBgX) * 0.06;
  curBgY += (targetBgY - curBgY) * 0.06;
  if (bgType) bgType.style.transform = `translateY(calc(-50% + ${curBgY + scrollBgY}px)) translateX(${curBgX}px)`;

  // smooth-follow parallax for portrait
  curPX += (targetPX - curPX) * 0.06;
  curPY += (targetPY - curPY) * 0.06;
  if (portraitImg) portraitImg.style.setProperty('--px', curPX + 'px');
  if (portraitImg) portraitImg.style.setProperty('--py', curPY + 'px');

  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ============================================================
// ABOUT SECTION — scroll reveal + VIP card tilt interaction
// ============================================================
// ABOUT BANNER — counter + reveal
// ============================================================
(function aboutBanner(){
  const banner = document.querySelector('.about-banner');
  if (!banner) return;

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (!target) return;
    const sup = el.querySelector('.ab-sup');
    const supHTML = sup ? sup.outerHTML : '';
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.innerHTML = current + supHTML;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        banner.classList.add('is-in');
        setTimeout(() => {
          banner.querySelectorAll('.ab-card-num[data-target]').forEach(animateCounter);
        }, 400);
        observer.unobserve(banner);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(banner);
})();

// ============================================================
(function aboutSection(){
  const about = document.getElementById('about');
  if (!about) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        about.classList.add('is-in');
        const sheenEl = document.getElementById('idCardSheen');
        if (sheenEl){
          setTimeout(() => sheenEl.classList.add('auto-sweep'), 500);
        }
        observer.unobserve(about);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(about);

  const cardWrap = document.getElementById('idCardWrap');
  const card = cardWrap ? cardWrap.querySelector('.id-card') : null;
  const sheen = document.getElementById('idCardSheen');
  if (!card || isCoarsePointer) return;

  cardWrap.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;   // 0 -> 1
    const relY = (e.clientY - rect.top) / rect.height;    // 0 -> 1

    const rotateY = (relX - 0.5) * 16;   // left/right tilt
    const rotateX = (0.5 - relY) * 16;   // up/down tilt

    card.style.setProperty('--rx', rotateY + 'deg');
    card.style.setProperty('--ry', rotateX + 'deg');
    if (sheen) sheen.style.transform = `translateX(${(relX - 0.5) * 40}%)`;
  });

  cardWrap.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    if (sheen) sheen.style.transform = 'translateX(-60%)';
  });
})();

// ============================================================
// SKILLS — tabs + progress bars + reveal
// ============================================================
(function skillsTabs(){
  const section = document.querySelector('.skills');
  if (!section) return;

  // Tab switching
  const tabs = section.querySelectorAll('.skills-tab');
  const panels = section.querySelectorAll('.skills-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = section.querySelector('#panel-' + target);
      if (panel) {
        panel.classList.add('active');
        // animate bars in newly shown panel
        animateBars(panel);
      }
    });
  });

  function animateBars(container) {
    container.querySelectorAll('.sp-bar-fill').forEach(bar => {
      const w = bar.getAttribute('data-width');
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = w + '%';
        });
      });
    });
  }

  // IntersectionObserver for reveal + initial bar animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        section.classList.add('is-in');
        // animate bars in the active panel
        const activePanel = section.querySelector('.skills-panel.active');
        if (activePanel) {
          setTimeout(() => animateBars(activePanel), 300);
        }
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(section);
})();

(function roleRotator(){
  const rotator = document.getElementById('roleRotator');
  if (!rotator) return;
  const words = Array.from(rotator.querySelectorAll('.role-word'));
  if (words.length < 2) return;

  let current = 0;
  const holdTime = 2600;
  const transitionTime = 480;

  setInterval(() => {
    const next = (current + 1) % words.length;
    const currentEl = words[current];
    const nextEl = words[next];

    currentEl.classList.add('is-leaving');
    currentEl.classList.remove('is-active');
    nextEl.classList.add('is-active');

    setTimeout(() => {
      currentEl.classList.remove('is-leaving');
    }, transitionTime);

    current = next;
  }, holdTime);
})();

// ============================================================
// GENERIC SECTION REVEAL — work, skills, education, certificates, contact
// ============================================================
(function genericSectionReveal(){
  const sectionIds = ['work', 'skills', 'education', 'certificates', 'contact'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach(sec => observer.observe(sec));
})();

// ============================================================
// CERTIFICATE LIGHTBOX
// ============================================================
(function certificateLightbox(){
  const dialog = document.getElementById('certLightbox');
  const preview = document.getElementById('certLightboxImage');
  const closeButton = document.getElementById('certLightboxClose');
  const cards = document.querySelectorAll('.cert-card');

  if (!dialog || !preview || !closeButton || !cards.length) return;

  const openCertificate = (card) => {
    const image = card.querySelector('.cert-image');
    if (!image) return;

    preview.src = image.currentSrc || image.src;
    preview.alt = image.alt;
    dialog.showModal();
    document.body.classList.add('cert-lightbox-open');
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => openCertificate(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCertificate(card);
      }
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('cert-lightbox-open');
    preview.removeAttribute('src');
  });
})();

// ============================================================
// CONTACT FORM — builds a pre-filled WhatsApp message
// ============================================================
(function contactForm(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const WHATSAPP_NUMBER = '923223399125'; // Farooq's WhatsApp, country code + number, no leading 0 or +

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#cf-name').value.trim();
    const contact = form.querySelector('#cf-contact').value.trim();
    const message = form.querySelector('#cf-message').value.trim();

    const text =
      `Hi Farooq, I'm ${name}.\n` +
      `Reach me at: ${contact}\n\n` +
      `${message}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  });
})();

// ============================================================
// BACK TO TOP
// ============================================================
(function backToTop(){
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
