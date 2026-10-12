(function () {
  var navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.querySelectorAll("#mainnav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var drawer = document.getElementById("contactDrawer");
  var backdrop = document.getElementById("contactBackdrop");
  var closeBtn = document.getElementById("drawerClose");
  var closeTimer;

  function openDrawer() {
    if (!drawer || !backdrop) return;
    clearTimeout(closeTimer);
    drawer.classList.add("open");
    backdrop.classList.add("open");
  }

  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
  }

  function scheduleClose() {
    closeTimer = setTimeout(closeDrawer, 350);
  }

  document.querySelectorAll('a[href="/contact-us/"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openDrawer();
    });
  });

  var trigger = document.getElementById("contactTrigger");
  if (trigger) {
    trigger.addEventListener("mouseenter", openDrawer);
    trigger.addEventListener("mouseleave", scheduleClose);
  }

  if (drawer) {
    drawer.addEventListener("mouseenter", function () {
      clearTimeout(closeTimer);
    });
    drawer.addEventListener("mouseleave", scheduleClose);
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawer();
  });

  var lb = document.getElementById("mediaLb");
  var lbFrame = document.getElementById("mediaLbFrame");
  var lbEmpty = document.getElementById("mediaLbEmpty");
  var lbClose = document.getElementById("mediaLbClose");

  function openLightbox(embed) {
    if (!lb || !lbFrame || !lbEmpty) return;
    lbFrame.querySelectorAll("iframe").forEach(function (el) {
      el.remove();
    });
    if (embed) {
      lbEmpty.style.display = "none";
      var frame = document.createElement("iframe");
      frame.src = embed;
      frame.title = "Video";
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.allowFullscreen = true;
      lbFrame.appendChild(frame);
    } else {
      lbEmpty.style.display = "flex";
    }
    lb.classList.add("open");
  }

  function closeLightbox() {
    if (!lb || !lbFrame) return;
    lb.classList.remove("open");
    lbFrame.querySelectorAll("iframe").forEach(function (el) {
      el.remove();
    });
  }

  document.querySelectorAll(".media-card").forEach(function (card) {
    card.addEventListener("click", function () {
      openLightbox(card.dataset.embed);
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lb) {
    lb.addEventListener("click", function (event) {
      if (event.target === lb) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lb && lb.classList.contains("open")) closeLightbox();
  });

  function syncVideoSoundButton(video, button) {
    if (!button) return;
    var muted = video.muted || video.volume === 0;
    button.classList.toggle("is-muted", muted);
    var label = muted ? "Turn sound on" : "Mute video";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  function setVideoExpanded(card, video, button, expanded) {
    card.classList.toggle("is-expanded", expanded);
    document.body.classList.toggle("video-expanded", expanded);
    video.controls = expanded;
    button.classList.toggle("is-exit", expanded);
    var label = expanded ? "Exit fullscreen" : "Expand video to fullscreen";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  function exitNativeFullscreen() {
    try {
      if (document.exitFullscreen) return Promise.resolve(document.exitFullscreen());
      if (document.webkitExitFullscreen) return Promise.resolve(document.webkitExitFullscreen());
    } catch (err) {}
    return Promise.resolve();
  }

  function playVideo(video) {
    var playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(function () {});
  }

  function expandVideo(card, video, button) {
    setVideoExpanded(card, video, button, true);
    playVideo(video);
    try {
      if (card.requestFullscreen) card.requestFullscreen().catch(function () {});
      else if (card.webkitRequestFullscreen) card.webkitRequestFullscreen();
      else if (video.requestFullscreen) video.requestFullscreen().catch(function () {});
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch (err) {}
  }

  function collapseVideo(card, video, button) {
    exitNativeFullscreen().catch(function () {});
    setVideoExpanded(card, video, button, false);
  }

  document.querySelectorAll(".video-card").forEach(function (card) {
    var button = card.querySelector(".video-fullscreen-toggle");
    var soundButton = card.querySelector(".video-sound-toggle");
    var video = card.querySelector("video");
    if (!button || !video) return;

    syncVideoSoundButton(video, soundButton);

    if (soundButton) {
      soundButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (video.muted || video.volume === 0) {
          video.volume = 1;
          video.muted = false;
          playVideo(video);
        } else {
          video.muted = true;
        }
        syncVideoSoundButton(video, soundButton);
      });
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      var expanded = card.classList.contains("is-expanded") || document.fullscreenElement || document.webkitFullscreenElement;
      if (expanded) {
        collapseVideo(card, video, button);
        return;
      }

      expandVideo(card, video, button);
    });

    card.addEventListener("click", function (event) {
      if (event.target.closest("button")) return;
      if (card.classList.contains("is-expanded")) return;
      expandVideo(card, video, button);
    });

    video.addEventListener("dblclick", function () {
      button.click();
    });

    video.addEventListener("volumechange", function () {
      syncVideoSoundButton(video, soundButton);
    });

    video.addEventListener("webkitendfullscreen", function () {
      setVideoExpanded(card, video, button, false);
    });
  });

  function syncFullscreenVideoControls() {
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    document.querySelectorAll(".video-card.is-expanded").forEach(function (card) {
      var button = card.querySelector(".video-fullscreen-toggle");
      var video = card.querySelector("video");
      if (button && video) setVideoExpanded(card, video, button, false);
    });
  }

  document.addEventListener("fullscreenchange", syncFullscreenVideoControls);
  document.addEventListener("webkitfullscreenchange", syncFullscreenVideoControls);
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    exitNativeFullscreen().catch(function () {});
    document.querySelectorAll(".video-card.is-expanded").forEach(function (card) {
      var button = card.querySelector(".video-fullscreen-toggle");
      var video = card.querySelector("video");
      if (button && video) setVideoExpanded(card, video, button, false);
    });
  });

  var consentKey = "kmeCookieConsentV1";

  function readCookieConsent() {
    try {
      var stored = window.localStorage.getItem(consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }

  function writeCookieConsent(consent) {
    window.kmeCookieConsent = consent;
    try {
      window.localStorage.setItem(consentKey, JSON.stringify(consent));
    } catch (err) {}
    try {
      document.dispatchEvent(new CustomEvent("kmeCookieConsentChange", { detail: consent }));
    } catch (err) {}
  }

  function makeCookieConsent(status, analytics, media) {
    return {
      status: status,
      essential: true,
      analytics: Boolean(analytics),
      media: Boolean(media),
      updatedAt: new Date().toISOString()
    };
  }

  function setupCookieConsent() {
    var existingConsent = readCookieConsent();
    if (existingConsent) window.kmeCookieConsent = existingConsent;

    var banner = document.createElement("aside");
    banner.className = "cookie-consent";
    banner.id = "cookieConsent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "cookieConsentTitle");
    banner.setAttribute("aria-describedby", "cookieConsentText");
    banner.innerHTML =
      '<div class="cookie-consent-panel">' +
        '<div>' +
          '<h2 id="cookieConsentTitle">Cookie and usage consent</h2>' +
          '<p id="cookieConsentText">We use essential technologies to run this site. With your consent, we may also use usage analytics and functional media services to improve the website and support embedded content. Read our <a href="/cookie-policy/">Cookie Policy</a>.</p>' +
        '</div>' +
        '<div class="cookie-consent-actions">' +
          '<button type="button" class="cookie-manage">Manage choices</button>' +
          '<button type="button" class="cookie-necessary">Necessary only</button>' +
          '<button type="button" class="cookie-primary cookie-accept">Accept all</button>' +
        '</div>' +
        '<div class="cookie-consent-preferences" aria-label="Cookie preferences">' +
          '<label class="cookie-choice"><span><strong>Essential</strong><span>Required for navigation, security, consent storage, and core website functionality.</span></span><input type="checkbox" checked disabled></label>' +
          '<label class="cookie-choice"><span><strong>Usage analytics</strong><span>Helps us understand site usage and improve performance and content.</span></span><input type="checkbox" data-cookie-choice="analytics"></label>' +
          '<label class="cookie-choice"><span><strong>Functional media</strong><span>Supports embedded video, map, social, and external content features.</span></span><input type="checkbox" data-cookie-choice="media"></label>' +
          '<div class="cookie-consent-actions">' +
            '<button type="button" class="cookie-necessary">Necessary only</button>' +
            '<button type="button" class="cookie-primary cookie-save">Save choices</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    var analyticsInput = banner.querySelector('[data-cookie-choice="analytics"]');
    var mediaInput = banner.querySelector('[data-cookie-choice="media"]');
    var manageButton = banner.querySelector(".cookie-manage");
    var acceptButtons = banner.querySelectorAll(".cookie-accept");
    var necessaryButtons = banner.querySelectorAll(".cookie-necessary");
    var saveButton = banner.querySelector(".cookie-save");

    function showBanner(manage) {
      var consent = readCookieConsent();
      if (analyticsInput) analyticsInput.checked = Boolean(consent && consent.analytics);
      if (mediaInput) mediaInput.checked = Boolean(consent && consent.media);
      banner.classList.add("open");
      banner.classList.toggle("manage", Boolean(manage));
      if (manage && analyticsInput) analyticsInput.focus();
      else if (manageButton) manageButton.focus();
    }

    function closeBanner() {
      banner.classList.remove("open", "manage");
    }

    function saveConsent(status, analytics, media) {
      writeCookieConsent(makeCookieConsent(status, analytics, media));
      closeBanner();
    }

    if (manageButton) {
      manageButton.addEventListener("click", function () {
        banner.classList.add("manage");
        if (analyticsInput) analyticsInput.focus();
      });
    }

    acceptButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        saveConsent("accepted", true, true);
      });
    });

    necessaryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        saveConsent("necessary", false, false);
      });
    });

    if (saveButton) {
      saveButton.addEventListener("click", function () {
        saveConsent("custom", analyticsInput && analyticsInput.checked, mediaInput && mediaInput.checked);
      });
    }

    document.querySelectorAll("[data-cookie-settings]").forEach(function (button) {
      button.addEventListener("click", function () {
        showBanner(true);
      });
    });

    window.openCookieSettings = function openCookieSettings() {
      showBanner(true);
    };

    if (!existingConsent) showBanner(false);
  }

  if (document.body) setupCookieConsent();

  if (window.parent !== window) {
    var pageMap = {
      "index.html": "home",
      "about-us/index.html": "about",
      "local-business.html": "local",
      "global.html": "global",
      "news.html": "news",
      "careers.html": "careers",
    };
    document.addEventListener(
      "click",
      function (event) {
        var link = event.target.closest("a");
        if (!link) return;
        var href = link.getAttribute("href");
        if (!href) return;
        var match = href.match(/^([a-z0-9-]+\.html)(#.+)?$/i);
        if (match && pageMap[match[1].toLowerCase()]) {
          event.preventDefault();
          window.parent.showPage(pageMap[match[1].toLowerCase()], match[2] ? match[2].slice(1) : null);
        }
      },
      true
    );
  }
})();

window.openEnquiryMail = function openEnquiryMail(form, event) {
  event.preventDefault();
  var lines = [];
  try {
    var data = new FormData(form);
    data.forEach(function (value, key) {
      if (String(value).trim()) lines.push(key + ": " + value);
    });
  } catch (err) {}
  var subject = encodeURIComponent("Kasumigaseki MENA inquiry");
  var body = encodeURIComponent(lines.join("\n"));
  window.location.href = "mailto:info.dubai@kasumigaseki.co.jp?subject=" + subject + "&body=" + body;
  var note = form.querySelector(".form-note");
  if (note) {
    note.textContent = "Opening your email app to send this inquiry.";
    note.classList.add("show");
  }
};


