document.addEventListener('DOMContentLoaded', () => {
  class UspStack {
    constructor(section) {
      this.section = section;
      this.shell = section.querySelector('[data-usp-stack]');
      this.content = section.querySelector('[data-usp-content]');
      this.cards = [...section.querySelectorAll('.usp__unit')];
      this.motionQuery = window.matchMedia('(max-width: 860px), (prefers-reduced-motion: reduce)');
      this.isEnhanced = false;
      this.activeIndex = 0;
      this.activeProgress = 0;
      this.rafId = 0;
      this.mobileObserver = null;

      this.onMotionChange = this.onMotionChange.bind(this);
      this.onResize = this.onResize.bind(this);
      this.onScroll = this.onScroll.bind(this);

      this.init();
    }

    init() {
      if (!this.shell || !this.content || this.cards.length === 0) {
        return;
      }

      if (typeof this.motionQuery.addEventListener === 'function') {
        this.motionQuery.addEventListener('change', this.onMotionChange);
      } else if (typeof this.motionQuery.addListener === 'function') {
        this.motionQuery.addListener(this.onMotionChange);
      }

      window.addEventListener('resize', this.onResize);
      this.updateActiveState(0);
      this.onMotionChange();
    }

    onMotionChange() {
      if (this.motionQuery.matches) {
        this.enableMobileMode();
        return;
      }

      this.disableMobileMode();
      this.enableEnhanced();
    }

    enableEnhanced() {
      if (this.isEnhanced) {
        this.setHeight();
        this.requestTick();
        return;
      }

      this.isEnhanced = true;
      this.section.classList.add('is-enhanced');
      this.setHeight();
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.requestTick();
    }

    disableEnhanced() {
      this.isEnhanced = false;
      this.section.classList.remove('is-enhanced');
      this.section.style.removeProperty('--stack-height');
      window.removeEventListener('scroll', this.onScroll);

      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }

      this.resetCardTransforms();
    }

    enableMobileMode() {
      this.disableEnhanced();

      if (this.mobileObserver || typeof IntersectionObserver !== 'function') {
        this.updateActiveState(this.activeIndex);
        return;
      }

      this.mobileObserver = new IntersectionObserver(
        entries => {
          let nextEntry = null;

          entries.forEach(entry => {
            if (!entry.isIntersecting) {
              return;
            }

            if (!nextEntry || entry.intersectionRatio > nextEntry.intersectionRatio) {
              nextEntry = entry;
            }
          });

          if (!nextEntry) {
            return;
          }

          const index = Number(nextEntry.target.dataset.index || '0');
          this.updateActiveState(index);
        },
        {
          threshold: [0.3, 0.45, 0.6, 0.75],
          rootMargin: '-10% 0px -10% 0px'
        }
      );

      this.cards.forEach(card => this.mobileObserver.observe(card));
      this.updateActiveState(0);
    }

    disableMobileMode() {
      if (!this.mobileObserver) {
        return;
      }

      this.mobileObserver.disconnect();
      this.mobileObserver = null;
    }

    setHeight() {
      const viewportHeight = window.innerHeight || 1;
      const sectionHeight = viewportHeight * (this.cards.length + 1.65);
      this.section.style.setProperty('--stack-height', `${sectionHeight}px`);
    }

    onResize() {
      if (this.isEnhanced) {
        this.setHeight();
        this.requestTick();
        return;
      }

      this.updateActiveState(this.activeIndex);
    }

    onScroll() {
      if (!this.isEnhanced) {
        return;
      }

      this.requestTick();
    }

    requestTick() {
      if (this.rafId) {
        return;
      }

      this.rafId = window.requestAnimationFrame(() => {
        this.rafId = 0;
        this.updateFromScroll();
      });
    }

    updateFromScroll() {
      if (!this.isEnhanced) {
        return;
      }

      const rect = this.section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const stageHeight = this.content.offsetHeight || viewportHeight;
      const measuredTitleStrip = this.cards.reduce((largest, card) => {
        const titleGroup = card.querySelector('.usp__group--fadeIn');
        const content = card.querySelector('.usp__unit--content');

        if (!titleGroup || !content) {
          return largest;
        }

        const contentStyles = window.getComputedStyle(content);
        const paddingTop = Number.parseFloat(contentStyles.paddingTop) || 0;
        const stripHeight = Math.ceil(paddingTop + titleGroup.offsetHeight + 28);

        return Math.max(largest, stripHeight);
      }, 0);
      const revealOffset = Math.min(Math.max(measuredTitleStrip, 124), Math.min(stageHeight * 0.28, 184));
      const maxScroll = Math.max(this.section.offsetHeight - viewportHeight, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), maxScroll);
      const progress = scrolled / maxScroll;
      const activeProgress = progress * (this.cards.length - 1);
      const activeIndex = Math.max(0, Math.min(this.cards.length - 1, Math.floor(activeProgress + 0.0001)));

      this.activeProgress = activeProgress;
      this.updateActiveState(activeIndex);

      this.cards.forEach((card, index) => {
        const segmentStart = Math.max(index - 1, 0);
        const segmentProgress = index === 0 ? 1 : Math.min(Math.max(activeProgress - segmentStart, 0), 1);
        const restingOffset = Math.min(index * revealOffset, stageHeight - revealOffset);
        const translateY = index === 0 ? 0 : restingOffset + (1 - segmentProgress) * (stageHeight - restingOffset);

        card.style.transform = `translate3d(0, ${translateY}px, 0)`;
        card.style.zIndex = `${index + 1}`;
      });
    }

    resetCardTransforms() {
      this.cards.forEach(card => {
        card.style.transform = '';
        card.style.zIndex = '';
      });
    }

    updateActiveState(index) {
      if (Number.isNaN(index)) {
        return;
      }

      this.activeIndex = Math.max(0, Math.min(this.cards.length - 1, index));

      this.cards.forEach((card, cardIndex) => {
        const isActive = cardIndex === this.activeIndex;
        card.classList.toggle('is-active', isActive);
      });
    }
  }

  const supportsObserver = typeof IntersectionObserver === 'function';
  const nav = document.getElementById('mainNav');
  const burger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('navMobile');
  const heroMedia = document.querySelectorAll('.hero__bg-media');
  const heroVideo = document.getElementById('heroVideo');
  const featureVideo = document.getElementById('featureVideo');
  const revealEls = document.querySelectorAll('.reveal');
  const navLinks = document.querySelectorAll('.nav__links a, .nav__mobile a');
  const sections = document.querySelectorAll('section[id]');
  const metricCards = document.querySelectorAll('.metric-card');
  const serviceTabs = document.querySelectorAll('.service-tab');
  const serviceImage = document.getElementById('serviceImage');
  const serviceLabel = document.getElementById('serviceLabel');
  const serviceCopy = document.getElementById('serviceCopy');
  const uspSection = document.querySelector('.usp');
  const mapPills = document.querySelectorAll('.map-pill');
  const locationCopy = document.getElementById('locationCopy');
  const locationCards = document.querySelectorAll('[data-location-card]');
  const contactForms = document.querySelectorAll('[data-contact-form]');
  const floatingContact = document.querySelector('[data-floating-contact]');
  const floatingContactTrigger = document.querySelector('[data-floating-contact-trigger]');
  const floatingContactPanel = floatingContact ? floatingContact.querySelector('.floating-contact__panel') : null;
  const contactEmail = 'info.dubai@kasumigaseki.co.jp';
  const contactPhone = '+97143883099';
  const officeDirectionsUrl = 'https://maps.app.goo.gl/xESmJtGHPZvotgkJ6';
  const cursorMediaQuery = window.matchMedia('(pointer: fine)');

  const autoplayVideo = video => {
    if (!video) {
      return;
    }

    video.muted = true;

    const attemptAutoplay = () => {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    if (video.readyState >= 2) {
      attemptAutoplay();
    } else {
      video.addEventListener('canplay', attemptAutoplay, { once: true });
    }
  };

  const initCustomCursor = () => {
    if (!cursorMediaQuery.matches) {
      return;
    }

    const interactiveSelector = [
      'a',
      'button',
      '[role="button"]',
      '.nav__group-trigger',
      'input',
      'textarea',
      'select',
      'summary',
      'label[for]',
      'video',
      'audio'
    ].join(', ');
    const mainScript = document.querySelector('script[src*="js/main.js"]');
    const cursorAsset = mainScript
      ? new URL('../images/icon logo - cursor-48.png', mainScript.src).href
      : '';

    if (!cursorAsset) {
      return;
    }

    const cursor = document.createElement('div');
    const cursorImage = document.createElement('img');
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let rafId = 0;
    let isVisible = false;

    cursor.className = 'site-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursorImage.src = cursorAsset;
    cursorImage.alt = '';
    cursor.appendChild(cursorImage);
    document.body.appendChild(cursor);
    document.body.classList.add('has-custom-cursor');

    const setCursorState = target => {
      const isInteractive = Boolean(target?.closest(interactiveSelector));
      cursor.classList.toggle('is-hidden', isInteractive);
      cursor.classList.toggle('is-visible', isVisible && !isInteractive);
    };

    const renderCursor = () => {
      rafId = 0;
      cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%) scale(1)`;
    };

    const requestRender = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(renderCursor);
    };

    document.addEventListener('mousemove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      isVisible = true;
      setCursorState(event.target);
      requestRender();
    });

    document.addEventListener('mouseover', event => {
      if (!isVisible) {
        return;
      }

      setCursorState(event.target);
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursor.classList.remove('is-visible');
    });

    window.addEventListener('blur', () => {
      isVisible = false;
      cursor.classList.remove('is-visible');
    });

    requestRender();
  };

  const getContactFieldLabel = (form, field) => {
    if (field.dataset.label) {
      return field.dataset.label.trim();
    }

    if (field.id) {
      const linkedLabel = form.querySelector(`label[for="${field.id}"]`);

      if (linkedLabel) {
        return linkedLabel.textContent.replace('*', '').trim();
      }
    }

    if (field.placeholder) {
      return field.placeholder.trim();
    }

    if (field.name) {
      return field.name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
    }

    return 'Field';
  };

  const buildContactMailto = form => {
    const fields = [...form.querySelectorAll('input, select, textarea')];
    const hasSubjectField = Boolean(form.querySelector('[name="subject"]'));
    let subject = 'Kasumigaseki website enquiry';
    const lines = ['Kasumigaseki website enquiry', ''];

    fields.forEach(field => {
      if (
        field.disabled ||
        ['submit', 'button', 'file', 'reset'].includes(field.type) ||
        field.name === 'consent'
      ) {
        return;
      }

      if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) {
        return;
      }

      const value = typeof field.value === 'string' ? field.value.trim() : '';

      if (!value) {
        return;
      }

      const label = getContactFieldLabel(form, field);

      if (field.name === 'subject') {
        subject = value;
      } else if (!hasSubjectField && field.name === 'enquiry_type') {
        subject = `${value} enquiry`;
      }

      lines.push(`${label}: ${value}`);
    });

    lines.push('');
    lines.push(`Page: ${window.location.href}`);

    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  };


  if (nav) {
    const handleScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  const setMobileMenu = isOpen => {
    if (!burger || !mobileNav) {
      return;
    }

    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  };

  if (burger && mobileNav) {
    setMobileMenu(false);

    burger.addEventListener('click', () => {
      setMobileMenu(!mobileNav.classList.contains('open'));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMobileMenu(false));
    });

    window.addEventListener(
      'resize',
      () => {
        if (window.innerWidth > 860) {
          setMobileMenu(false);
        }
      },
      { passive: true }
    );
  }

  if (supportsObserver) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  const setActiveNav = targetId => {
    const matchingLinks = [...navLinks].filter(link => link.getAttribute('href') === targetId);

    if (!matchingLinks.length) {
      return;
    }

    navLinks.forEach(link => link.classList.remove('active-nav'));
    matchingLinks.forEach(link => link.classList.add('active-nav'));
  };

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href');

      if (targetId && targetId.startsWith('#')) {
        setActiveNav(targetId);
      }
    });
  });

  if (supportsObserver && sections.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveNav(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach(section => sectionObserver.observe(section));
  }

  if (supportsObserver && metricCards.length) {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          const valueEl = entry.target.querySelector('.metric-card__value');

          if (!valueEl || valueEl.dataset.counted === 'true' || !valueEl.dataset.value) {
            return;
          }

          valueEl.dataset.counted = 'true';

          const prefix = valueEl.dataset.prefix || '';
          const suffix = valueEl.dataset.suffix || '';
          const targetValue = Number(valueEl.dataset.value || '0');
          const decimals = Number(valueEl.dataset.decimals || '0');
          const duration = 1200;
          const steps = 30;
          const increment = targetValue / steps;
          const interval = duration / steps;
          let currentValue = 0;

          const render = value => {
            valueEl.innerHTML = `${prefix}${value.toFixed(decimals)}<span>${suffix}</span>`;
          };

          const tick = () => {
            currentValue += increment;

            if (currentValue >= targetValue) {
              render(targetValue);
              return;
            }

            render(currentValue);
            window.setTimeout(tick, interval);
          };

          tick();
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    metricCards.forEach(card => counterObserver.observe(card));
  }

  if (serviceTabs.length && serviceImage && serviceLabel && serviceCopy) {
    const setService = tab => {
      const image = tab.dataset.image;
      const title = tab.dataset.title;
      const copy = tab.dataset.copy;

      serviceTabs.forEach(button => {
        const isActive = button === tab;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      serviceImage.style.opacity = '0.3';
      serviceImage.style.transform = 'scale(1.02)';

      window.setTimeout(() => {
        serviceImage.src = image;
        serviceImage.alt = `${title} service preview`;
        serviceLabel.textContent = title;
        serviceCopy.textContent = copy;
        serviceImage.style.opacity = '1';
        serviceImage.style.transform = 'scale(1)';
      }, 170);
    };

    const initialTab = document.querySelector('.service-tab.active') || serviceTabs[0];

    if (initialTab) {
      setService(initialTab);
    }

    serviceTabs.forEach(tab => {
      tab.addEventListener('click', () => setService(tab));
    });
  }

  if (mapPills.length && locationCopy) {
    const setActiveLocation = pill => {
      if (!pill) {
        return;
      }

      const locationKey = pill.dataset.location || '';

      mapPills.forEach(button => {
        const isActive = button === pill;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      locationCards.forEach(card => {
        const isActive = card.dataset.locationCard === locationKey;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      locationCopy.textContent = pill.dataset.copy || pill.textContent.trim();
    };

    mapPills.forEach(pill => {
      pill.addEventListener('click', () => {
        setActiveLocation(pill);
      });
    });

    locationCards.forEach(card => {
      const targetPill = Array.from(mapPills).find(pill => pill.dataset.location === card.dataset.locationCard);

      if (!targetPill) {
        return;
      }

      card.addEventListener('click', event => {
        if (event.target.closest('a')) {
          return;
        }

        setActiveLocation(targetPill);
      });

      card.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }

        event.preventDefault();
        setActiveLocation(targetPill);
      });
    });

    setActiveLocation(document.querySelector('.map-pill.active') || mapPills[0]);
  }

  if (uspSection) {
    new UspStack(uspSection);
  }

  if (contactForms.length) {
    contactForms.forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();

        const button = form.querySelector('button[type="submit"]');

        if (!button) {
          return;
        }

        const originalText = button.dataset.originalText || button.textContent;
        const successText = form.dataset.successText || 'Request sent';
        const mailtoLink = buildContactMailto(form);

        button.dataset.originalText = originalText;
        button.textContent = successText;
        button.disabled = true;

        window.location.href = mailtoLink;

        window.setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2200);
      });
    });
  }

  if (floatingContactPanel) {
    const emailLink = floatingContactPanel.querySelector('[href^="mailto:"]');

    if (!floatingContactPanel.querySelector('[data-floating-contact-link="call"]')) {
      const callLink = document.createElement('a');
      callLink.className = 'floating-contact__link';
      callLink.href = `tel:${contactPhone}`;
      callLink.dataset.floatingContactLink = 'call';
      callLink.innerHTML = '<i class="fa-solid fa-phone"></i><span>Call</span>';

      floatingContactPanel.prepend(callLink);
    }

    if (!floatingContactPanel.querySelector('[data-floating-contact-link="directions"]')) {
      const directionsLink = document.createElement('a');
      directionsLink.className = 'floating-contact__link';
      directionsLink.href = officeDirectionsUrl;
      directionsLink.target = '_blank';
      directionsLink.rel = 'noopener';
      directionsLink.dataset.floatingContactLink = 'directions';
      directionsLink.innerHTML = '<i class="fa-solid fa-location-dot"></i><span>Directions</span>';

      if (emailLink) {
        emailLink.insertAdjacentElement('afterend', directionsLink);
      } else {
        floatingContactPanel.append(directionsLink);
      }
    }
  }

  if (floatingContact && floatingContactTrigger) {
    const setFloatingContact = isOpen => {
      floatingContact.classList.toggle('is-open', isOpen);
      floatingContactTrigger.setAttribute('aria-expanded', String(isOpen));
    };

    setFloatingContact(false);

    floatingContactTrigger.addEventListener('click', event => {
      event.preventDefault();
      setFloatingContact(!floatingContact.classList.contains('is-open'));
    });

    document.addEventListener('click', event => {
      if (!floatingContact.contains(event.target)) {
        setFloatingContact(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setFloatingContact(false);
      }
    });
  }

  autoplayVideo(featureVideo);
  autoplayVideo(heroVideo);
  initCustomCursor();
  if (heroMedia.length) {
    window.addEventListener(
      'scroll',
      () => {
        const offset = Math.min(window.scrollY * 0.16, 48);
        heroMedia.forEach(media => {
          media.style.transform = `scale(1.04) translateY(${offset}px)`;
        });
      },
      { passive: true }
    );
  }
});

