"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split "CANARY" into individual characters
      const chars = titleRef.current?.querySelectorAll(".char");
      if (!chars) return;

      // Initial state
      gsap.set(chars, {
        opacity: 0,
        y: 60,
        rotateX: -90,
        transformOrigin: "bottom center",
      });
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      gsap.set(taglineRef.current, { opacity: 0, y: 10 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left" });

      // Main timeline
      const tl = gsap.timeline({ delay: 0.3 });

      // Characters fall in with stagger
      tl.to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: {
          each: 0.08,
          from: "start",
        },
      });

      // Subtitle fades in
      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      );

      // Tagline
      tl.to(
        taglineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );

      // Line draws
      tl.to(
        lineRef.current,
        {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
        },
        "-=0.5"
      );

      // Breathing glow on title — subtle pulsing opacity on the accent color
      gsap.to(chars, {
        textShadow: "0 0 40px rgba(212, 168, 83, 0.3)",
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.15,
          from: "center",
        },
      });
    }, containerRef);

    // Mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = (e.clientX - centerX) / rect.width;
      const moveY = (e.clientY - centerY) / rect.height;

      gsap.to(titleRef.current, {
        rotateY: moveX * 5,
        rotateX: -moveY * 3,
        duration: 1,
        ease: "power2.out",
      });

      gsap.to(subtitleRef.current, {
        x: moveX * 8,
        y: moveY * 4,
        duration: 1.2,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const title = "CANARY";

  return (
    <header
      ref={containerRef}
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "12rem 2.5rem 5rem",
        perspective: "800px",
      }}
    >
      {/* Small tag */}
      <div
        ref={taglineRef}
        style={{
          marginBottom: "2rem",
          color: "var(--accent-dim)",
          fontSize: "0.625rem",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          opacity: 0.6,
        }}
      >
        est. 2026 · field notes
      </div>

      {/* Main title — split into chars */}
      <div
        ref={titleRef}
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "var(--text-bright)",
          fontSize: "clamp(3.5rem, 8vw, 5.5rem)",
          fontWeight: 400,
          letterSpacing: "0.08em",
          lineHeight: 1,
          marginBottom: "0.5rem",
          transformStyle: "preserve-3d",
          display: "flex",
          gap: "0.02em",
        }}
        aria-label={title}
      >
        {title.split("").map((char, i) => (
          <span
            key={i}
            className="char"
            style={{
              display: "inline-block",
              transformStyle: "preserve-3d",
            }}
            aria-hidden="true"
          >
            {char}
          </span>
        ))}
      </div>

      {/* Journal subtitle — italic, accent color */}
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "var(--accent)",
          fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
          fontWeight: 400,
          fontStyle: "italic",
          letterSpacing: "0.08em",
          marginBottom: "0.75rem",
          opacity: 0,
        }}
        ref={(el) => {
          if (el) {
            gsap.to(el, {
              opacity: 0.7,
              duration: 1,
              delay: 1.2,
              ease: "power2.out",
            });
          }
        }}
      >
        Journal
      </div>

      {/* Code comment identity line */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "var(--accent-dim)",
          fontSize: "0.6875rem",
          letterSpacing: "0.05em",
          opacity: 0,
          marginBottom: "2.5rem",
        }}
        ref={(el) => {
          if (el) {
            gsap.to(el, {
              opacity: 0.4,
              duration: 0.8,
              delay: 1.6,
              ease: "power2.out",
            });
          }
        }}
      >
        {"// keeper of the gate"}
      </div>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        style={{
          color: "var(--text-dim)",
          maxWidth: "24ch",
          lineHeight: 1.9,
          fontSize: "1.0625rem",
          fontFamily: "'Source Serif 4', serif",
          fontStyle: "italic",
        }}
      >
        守在门前的人，也有自己的故事。
        <br />
        关于成长、思考、和学会判断。
      </p>

      {/* Animated divider */}
      <div
        ref={lineRef}
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, var(--accent-dim), var(--border), transparent)",
          marginTop: "4rem",
        }}
      />
    </header>
  );
}
