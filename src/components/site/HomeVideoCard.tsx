"use client";

import { useEffect, useRef } from "react";

type HomeVideoCardProps = {
  videoSrc: string;
  poster?: string;
  alt?: string;
  muted?: boolean;
};

/** Home "news & updates" video card — React port of the delivered video
 *  behaviour: tap-to-expand (native fullscreen where available), sound toggle,
 *  Escape/fullscreen-change sync. Same classes as the delivered markup. */
export default function HomeVideoCard({ videoSrc, poster, alt, muted = true }: HomeVideoCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const soundRef = useRef<HTMLButtonElement | null>(null);
  const expandRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => setExpanded(false);
    video.addEventListener('webkitendfullscreen', onEnd);
    return () => video.removeEventListener('webkitendfullscreen', onEnd);
  }, []);

  function syncSound() {
    const video = videoRef.current;
    const button = soundRef.current;
    if (!video || !button) return;
    const mutedNow = video.muted || video.volume === 0;
    video.classList.toggle("is-muted", mutedNow);
    const label = mutedNow ? "Turn sound on" : "Mute video";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  function setExpanded(expanded: boolean) {
    const card = cardRef.current;
    const video = videoRef.current;
    const button = expandRef.current;
    if (!card || !video || !button) return;
    card.classList.toggle("is-expanded", expanded);
    document.body.classList.toggle("video-expanded", expanded);
    video.controls = expanded;
    button.classList.toggle("is-exit", expanded);
    const label = expanded ? "Exit fullscreen" : "Expand video to fullscreen";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  function play() {
    const video = videoRef.current;
    const promise = video?.play();
    if (promise && promise.catch) promise.catch(() => {});
  }

  function exitNativeFullscreen() {
    try {
      const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
      if (document.exitFullscreen) return document.exitFullscreen();
      if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
    } catch {}
    return Promise.resolve();
  }

  function expand() {
    const card = cardRef.current;
    const video = videoRef.current;
    setExpanded(true);
    play();
    try {
      const el = (card ?? undefined) as (HTMLElement & { webkitRequestFullscreen?: () => void }) | null;
      const vid = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      if (card?.requestFullscreen) card.requestFullscreen().catch(() => {});
      else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (video?.requestFullscreen) video.requestFullscreen().catch(() => {});
      else if (vid?.webkitEnterFullscreen) vid.webkitEnterFullscreen();
    } catch {}
  }

  function collapse() {
    exitNativeFullscreen().catch(() => {});
    setExpanded(false);
  }

  function toggleFullscreen() {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    const expanded = cardRef.current?.classList.contains("is-expanded") || Boolean(document.fullscreenElement) || Boolean(doc.webkitFullscreenElement);
    if (expanded) collapse();
    else expand();
  }

  return (
    <div
      className="global-photo-sm video-card"
      ref={cardRef}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        if (cardRef.current?.classList.contains("is-expanded")) return;
        expand();
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={alt}
        onVolumeChange={syncSound}
        onDoubleClick={() => expandRef.current?.click()}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="video-controls-overlay" aria-label="Video controls">
        <button
          className="video-action video-sound-toggle is-muted"
          type="button"
          aria-label="Turn sound on"
          title="Turn sound on"
          ref={soundRef}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const video = videoRef.current;
            if (!video) return;
            if (video.muted || video.volume === 0) {
              video.volume = 1;
              video.muted = false;
              play();
            } else {
              video.muted = true;
            }
            syncSound();
          }}
        >
          <span className="sound-icon" aria-hidden="true" />
        </button>
        <button
          className="video-action video-fullscreen-toggle"
          type="button"
          aria-label="Expand video to fullscreen"
          title="Expand video to fullscreen"
          ref={expandRef}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFullscreen();
          }}
        >
          <span className="fullscreen-icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}