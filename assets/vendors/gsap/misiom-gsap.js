(function ($) {
  "use strict";

  // =============================================
  // PLUGIN REGISTRATION
  // =============================================
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    ScrollToPlugin,
    CustomEase,
    SplitText,
  );

  // =============================================
  // HELPER / UTILITY FUNCTIONS
  // =============================================

  function addHoverPause(el, timeline) {
    el.addEventListener("mouseenter", () => timeline.pause());
    el.addEventListener("mouseleave", () => timeline.resume());
  }

  const marquee = (el, duration, x) => {
    const wrap = gsap.utils.wrap(0, 50);
    return gsap.to(el, {
      duration,
      ease: "none",
      x,
      modifiers: { x: (v) => (x = wrap(parseFloat(v)) + "%") },
      repeat: -1,
    });
  };

  const marqueeRight = (el, duration, x) => {
    const wrap = gsap.utils.wrap(0, 50);
    return gsap.to(el, {
      duration,
      ease: "none",
      x,
      modifiers: { x: (v) => (x = wrap(parseFloat(v)) + "%") },
      repeat: -1,
    });
  };

  // =============================================
  // ANIMATION FUNCTIONS
  // =============================================

  // split text animation
  function bwSplitText() {
    if ($(".bw-split-text").length) {
      var textheading = $(".bw-split-text");

      if (textheading.length === 0) return;
      textheading.each(function (index, el) {
        el.split = new SplitText(el, {
          type: "lines,words,chars",
          linesClass: "split-line",
        });

        if ($(el).hasClass("bw-split-text")) {
          gsap.set(el.split.chars, {
            opacity: 0.3,
            x: "-7",
          });
        }
        el.anim = gsap.to(el.split.chars, {
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 20%",
            markers: false,
            scrub: 1,
          },
          x: "0",
          y: "0",
          opacity: 1,
          duration: 0.7,
          stagger: 0.2,
        });
      });
    }
  }

  // reveal text animation 01
  function bwRevealText() {
    const bwElements = document.querySelectorAll(".bw-reveal-text");

    bwElements.forEach((el) => {
      if (!el.dataset.original) {
        el.dataset.original = el.innerHTML;
      }
    });

    const splitWords = (el) => {
      const text = el.dataset.original;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = text;

      const nodes = Array.from(wrapper.childNodes);
      const wrappedHTML = nodes
        .map((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent
              .split(/\s/)
              .map((word) => {
                return word
                  .split("-")
                  .map((part) => `<span class="word">${part}</span>`)
                  .join('<span class="hyphen">-</span>');
              })
              .join('<span class="whitespace"> </span>');
          } else {
            return node.outerHTML;
          }
        })
        .join("");
      el.innerHTML = wrappedHTML;
    };

    const getLines = (el) => {
      const lines = [];
      let line = [];
      const words = el.querySelectorAll("span");
      let lastTop = null;

      words.forEach((word) => {
        if (
          word.offsetTop !== lastTop &&
          !word.classList.contains("whitespace")
        ) {
          lastTop = word.offsetTop;
          line = [];
          lines.push(line);
        }
        line.push(word);
      });

      return lines;
    };

    const splitLines = (el) => {
      splitWords(el);

      const lines = getLines(el);
      let wrappedHTML = "";

      lines.forEach((wordsArr) => {
        wrappedHTML += '<span class="line"><span class="words">';
        wordsArr.forEach((word) => {
          wrappedHTML += word.outerHTML;
        });
        wrappedHTML += "</span></span>";
      });

      el.innerHTML = wrappedHTML;
    };

    const initReveal = (el) => {
      const lines = el.querySelectorAll(".words");
      gsap.killTweensOf(lines);
      gsap.set(el, { autoAlpha: 1 });

      gsap.from(lines, {
        yPercent: 100,
        ease: "power3.out",
        stagger: 0.25,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: el,
          toggleActions: "restart none none reset",
        },
      });
    };

    const runAll = () => {
      bwElements.forEach((el) => {
        splitLines(el);
        initReveal(el);
      });
    };

    runAll();

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        runAll();
      }, 200);
    });
  }

  // reveal text animation 02
  function bwRevealText2() {
    const textRevealElements = document.querySelectorAll(".bw-reveal-text-2");

    textRevealElements.forEach((element) => {
      const nodes = Array.from(element.childNodes);
      element.innerHTML = "";

      nodes.forEach((node) => {
        if (node.nodeName === "BR") {
          element.appendChild(node.cloneNode());
          return;
        }

        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach((text) => {
            if (!text.trim()) {
              element.append(text);
            } else {
              const word = document.createElement("div");
              word.className = "word";
              word.textContent = text;
              element.appendChild(word);
            }
          });
          return;
        }

        if (node.nodeType === 1) {
          const word = document.createElement("div");
          word.className = "word";
          word.appendChild(node.cloneNode(true));
          element.appendChild(word);
        }
      });

      element.querySelectorAll(".word").forEach((word) => {
        if (word.children.length) {
          word.querySelectorAll("*").forEach((tag) => {
            const childNodes = Array.from(tag.childNodes);
            tag.innerHTML = "";

            childNodes.forEach((node) => {
              if (node.nodeType === 1) {
                tag.appendChild(node);
                return;
              }

              if (node.nodeType === 3) {
                node.textContent.split("").forEach((char) => {
                  if (!char.trim()) {
                    tag.append(char);
                  } else {
                    const p = document.createElement("div");
                    p.className = "perspective";
                    p.innerHTML = `<div class="letter"><div>${char}</div></div>`;
                    tag.appendChild(p);
                  }
                });
              }
            });
          });
        }

        if (!word.children.length) {
          const text = word.textContent;
          word.innerHTML = "";
          text.split("").forEach((char) => {
            if (!char.trim()) {
              word.append(char);
            } else {
              const p = document.createElement("div");
              p.className = "perspective";
              p.innerHTML = `<div class="letter"><div>${char}</div></div>`;
              word.appendChild(p);
            }
          });
        }
      });

      const letters = element.querySelectorAll(".letter");

      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          toggleActions: "restart none none reset",
        },
      });

      tl.set(element, { autoAlpha: 1 });
      tl.fromTo(
        letters,
        1.6,
        {
          transformOrigin: "center",
          rotationY: 90,
          x: 30,
        },
        {
          rotationY: 0.1,
          x: 0,
          stagger: 0.025,
          ease: CustomEase.create("custom", "M0,0 C0.425,0.005 0,1 1,1 "),
        },
      );
    });
  }

  // bw title animation
  function bwTitleAnimation() {
    if (!document.querySelector(".bw-title-anim")) return;

    let splitTitleLines = gsap.utils.toArray(".bw-title-anim");

    splitTitleLines.forEach((splitTextLine) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: splitTextLine,
          start: "top 90%",
          end: "bottom 60%",
          scrub: false,
          markers: false,
          toggleActions: "play none none reverse",
        },
      });

      const itemSplitted = new SplitText(splitTextLine, {
        type: "words, lines",
      });

      gsap.set(splitTextLine, { perspective: 400 });

      itemSplitted.split({ type: "lines" });

      tl.from(itemSplitted.lines, {
        duration: 1,
        delay: 0.3,
        opacity: 0,
        rotationX: -80,
        force3D: true,
        transformOrigin: "top center -50",
        stagger: 0.1,
      });
    });
  }

  // scroll content horizontal & vertically
  function bwScroll() {
    document.querySelectorAll(".bw-scroll").forEach((section) => {
      let rl = section.querySelector(".bw-scroll-rl");
      let lr = section.querySelector(".bw-scroll-lr");
      let top = section.querySelector(".bw-scroll-top");
      let bottom = section.querySelector(".bw-scroll-bottom");

      if (!rl && !lr && !top && !bottom) return;

      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 100%",
          end: "bottom top",
          scrub: 1,
          markers: false,
        },
      });

      if (rl) tl.from(rl, { xPercent: 20 });
      if (lr) tl.from(lr, { xPercent: -20 }, 0);
      if (top) tl.from(top, { yPercent: 10 }, 0);
      if (bottom) tl.from(bottom, { yPercent: -10 }, 0);
    });
  }

  // rotate animation
  function bwAnimateRotate() {
    gsap.utils.toArray(".bw-animate-rotate").forEach((el) => {
      let arspin = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scrub: 1,
          start: "top 100%",
          end: "top -50%",
          toggleActions: "play none none reverse",
          markers: false,
        },
      });

      arspin
        .set(el, { transformOrigin: "center center" })
        .fromTo(
          el,
          { rotate: 0 },
          { rotate: 180, duration: 2, immediateRender: false },
        );
    });
  }

  // right to left animation
  function rightToLeftAnim() {
    document.querySelectorAll(".right-to-left-anim").forEach((el) => {
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "bottom 10%",
          scrub: 2,
          markers: false,
        },
      });

      tl.fromTo(el, { x: 200 }, { x: 0, duration: 1.6 });
    });
  }

  // left to right animation
  function leftToRightAnim() {
    document.querySelectorAll(".left-to-right-anim").forEach((el) => {
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "bottom 10%",
          scrub: 2,
          markers: false,
        },
      });

      tl.fromTo(el, { x: -200 }, { x: 0, duration: 1.6 });
    });
  }

  // scroll zoom effect
  function zoomEffect() {
    gsap.utils.toArray(".zoom-effect").forEach((el) => {
      let tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scrub: 1,
          start: "top 80%",
          end: "bottom 60%",
          toggleActions: "play none none reverse",
          markers: false,
        },
      });

      tl1.set(el, { transformOrigin: "center center" }).from(
        el,
        { scale: 0.7 },
        {
          background: "inherit",
          scale: 1,
          duration: 1,
          immediateRender: false,
        },
      );
    });
  }

  // scroll scale image
  function initScaleAnimation() {
    const scales = document.querySelectorAll(".scale-anim");
    scales.forEach((item) => {
      gsap.to(item, {
        scale: 1,
        duration: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
      });
    });
    const images = document.querySelectorAll(`${".scale-anim"} img`);
    images.forEach((img) => {
      gsap.set(img, {
        scale: 1.3,
      });
      gsap.to(img, {
        scale: 1,
        duration: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: img,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
      });
    });
  }

  // scroll move parallax image
  function imageParallaxEffect() {
    document.querySelectorAll(".image-parallax").forEach((wrapper) => {
      const imgLR = wrapper.querySelector(".image-parallax-lr");
      const imgRL = wrapper.querySelector(".image-parallax-rl");
      const isRTL = getComputedStyle(wrapper).direction === "rtl";

      gsap.set(wrapper, { overflow: "hidden" });

      function getXPercent(startLTR, endLTR) {
        return isRTL ? -startLTR : startLTR;
      }

      if (imgLR) {
        gsap.set(imgLR, {
          width: "125%",
          maxWidth: "none",
          xPercent: getXPercent(-12.5, 0),
          willChange: "transform",
        });

        gsap.to(imgLR, {
          xPercent: getXPercent(0, 12.5),
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (imgRL) {
        gsap.set(imgRL, {
          width: "125%",
          maxWidth: "none",
          xPercent: getXPercent(0, -12.5),
          willChange: "transform",
        });

        gsap.to(imgRL, {
          xPercent: getXPercent(-12.5, 0),
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });
  }

  // portfolio hover animatiom
  function initPortfolioHover() {
    const items = document.querySelectorAll(".portfolio-one .item");
    const carousel = document.querySelector(".portfolio-one__carousel");

    let activeHover = null;
    let activeParent = null;
    let isAnimating = false;
    let closeTimer = null;

    function getContainerRect() {
      const el =
        document.querySelector(".portfolio-one__carousel .owl-stage-outer") ||
        carousel;
      return el.getBoundingClientRect();
    }

    function forceClose() {
      if (!activeHover) return;

      if (closeTimer) clearTimeout(closeTimer);

      isAnimating = true;

      const triggerEl = activeParent.querySelector(".portfolio-one__item");
      const containerRect = getContainerRect();
      const itemRect = triggerEl.getBoundingClientRect();

      const title = activeHover.querySelectorAll(
        ".portfolio-one__hover__title",
      );
      const serial = activeHover.querySelectorAll(
        ".portfolio-one__hover__serial",
      );
      const text = activeHover.querySelectorAll(".portfolio-one__hover__text");
      const btn = activeHover.querySelectorAll(".portfolio-one__hover__btn");

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(activeHover, {
            visibility: "hidden",
            pointerEvents: "none",
          });

          activeParent.appendChild(activeHover);

          activeHover = null;
          activeParent = null;
          isAnimating = false;
        },
      });

      tl.to([btn, text, serial, title], {
        y: 100,
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
        stagger: 0.05,
      });

      tl.to(
        activeHover,
        {
          top: itemRect.top - containerRect.top,
          left: itemRect.left - containerRect.left,
          width: itemRect.width,
          height: itemRect.height,
          duration: 0.9,
          ease: "power3.inOut",
        },
        "-=0.1",
      );
    }

    function openPortfolio(item) {
      if (activeHover || isAnimating) return;

      isAnimating = true;

      const hoverEl = item.querySelector(".portfolio-one__hover");
      const triggerEl = item.querySelector(".portfolio-one__item");

      const containerRect = getContainerRect();
      const itemRect = triggerEl.getBoundingClientRect();

      activeHover = hoverEl;
      activeParent = item;

      carousel.appendChild(hoverEl);

      gsap.set(hoverEl, {
        visibility: "visible",
        pointerEvents: "auto",
        position: "absolute",
        top: itemRect.top - containerRect.top,
        left: itemRect.left - containerRect.left,
        width: itemRect.width,
        height: itemRect.height,
        opacity: 1,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
        },
      });

      tl.to(hoverEl, {
        top: 0,
        left: 0,
        width: containerRect.width,
        height: containerRect.height,
        duration: 0.9,
        ease: "power4.inOut",
      });

      tl.fromTo(
        hoverEl.querySelectorAll(".portfolio-one__hover__title"),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.4",
      );

      tl.fromTo(
        hoverEl.querySelectorAll(".portfolio-one__hover__serial"),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.3",
      );

      tl.fromTo(
        hoverEl.querySelectorAll(".portfolio-one__hover__text"),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.2",
      );

      tl.fromTo(
        hoverEl.querySelectorAll(".portfolio-one__hover__btn"),
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=0.1",
      );
    }

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (closeTimer) clearTimeout(closeTimer);
        openPortfolio(item);
      });
    });

    if (carousel) {
      carousel.addEventListener("mouseleave", () => {
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          forceClose();
        }, 50);
      });
    }
  }

  // portfolio panel pin scrolling
  function initPortfolioScale() {
    let pr = gsap.matchMedia();
    pr.add("(min-width: 1200px)", () => {
      let otherSections = document.querySelectorAll(".bw-portfolio-panel");

      otherSections.forEach((section, index) => {
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: "bottom 50%",
            endTrigger: ".bw-portfolio-wrap",
            pinSpacing: false,
            markers: false,
          },
        });

        tl.to(section, {
          scale: 0.8,
          ease: "none",
        });
      });
    });
  }

  // marquee - two lines
  const inibwarquees = () => {
    const containers = [...document.querySelectorAll(".marquee--gsap")];
    if (!containers.length) return;

    containers.forEach((container) => {
      const topEl = container.querySelector(".marquee__top");
      const bottomEl = container.querySelector(".marquee__bottom");

      if (!topEl || !bottomEl) return;

      topEl.innerHTML += topEl.innerHTML;
      bottomEl.innerHTML += bottomEl.innerHTML;

      const tlTop = gsap.timeline().add(marquee(topEl, 30, "-=50%"), 0);
      const tlBottom = gsap.timeline().add(marquee(bottomEl, 30, "+=50%"), 0);

      const clampTS = gsap.utils.clamp(0.5, 2);
      const baseSpeed = 0.8; // 🔥 idle smooth speed

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (st) => {
          let velocity = Math.abs(st.getVelocity() / 1000);
          let speed = velocity || baseSpeed;

          // 🔥 smooth transition (main fix)
          gsap.to(tlTop, {
            timeScale: clampTS(speed),
            duration: 0.5,
            ease: "power2.out",
          });

          gsap.to(tlBottom, {
            timeScale: clampTS(speed),
            duration: 0.5,
            ease: "power2.out",
          });
        },
      });

      addHoverPause(topEl, tlTop);
      addHoverPause(bottomEl, tlBottom);
    });
  };

  const inibwarquee = () => {
    const containers = [...document.querySelectorAll(".marquee-right--gsap")];
    if (!containers.length) return;

    containers.forEach((container) => {
      const el = container.querySelector(".marquee__toright");
      if (!el) return;

      el.innerHTML += el.innerHTML;

      const tl = gsap.timeline().add(marqueeRight(el, 30, "+=50%"), 0);

      const clampTS = gsap.utils.clamp(0.5, 2);
      const baseSpeed = 0.8;

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (st) => {
          let velocity = Math.abs(st.getVelocity() / 1000);
          let speed = velocity || baseSpeed;

          gsap.to(tl, {
            timeScale: clampTS(speed),
            duration: 0.5,
            ease: "power2.out",
          });
        },
      });

      addHoverPause(el, tl);
    });
  };

  const inibwarqueeLeft = () => {
    const containers = [...document.querySelectorAll(".marquee-left--gsap")];
    if (!containers.length) return;

    containers.forEach((container) => {
      const el = container.querySelector(".marquee__toleft");
      if (!el) return;

      el.innerHTML += el.innerHTML;

      const tl = gsap.timeline().add(marquee(el, 30, "-=50%"), 0);

      const clampTS = gsap.utils.clamp(0.5, 2);
      const baseSpeed = 0.8;

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (st) => {
          let velocity = Math.abs(st.getVelocity() / 1000);
          let speed = velocity || baseSpeed;

          gsap.to(tl, {
            timeScale: clampTS(speed),
            duration: 0.5,
            ease: "power2.out",
          });
        },
      });

      addHoverPause(el, tl);
    });
  };

  // rotating slide in
  function rotatingSlideIn() {
    if (document.querySelectorAll(".rotating-slide-wrap").length) {
      const pw = gsap.matchMedia();
      pw.add("(min-width: 992px)", () => {
        document.querySelectorAll(".rotating-slide-wrap").forEach((wrap) => {
          const pairs = wrap.querySelectorAll(
            ".rotating-slide-col:nth-child(odd)",
          );
          pairs.forEach((pair) => {
            const item1 = pair.querySelector(".rotating-slide-item-1");
            const item2 = pair.nextElementSibling?.querySelector(
              ".rotating-slide-item-2",
            );

            if (item1 && item2) {
              gsap.set(item1, { x: -400, rotate: -40 });
              gsap.set(item2, { x: 400, rotate: 40 });

              let tl = gsap.timeline({
                scrollTrigger: {
                  trigger: pair,
                  start: "top 90%",
                  end: "top 20%",
                  scrub: 1,
                },
              });

              tl.to(item1, { x: 0, rotate: 0 }).to(
                item2,
                { x: 0, rotate: 0 },
                0,
              );
            }
          });
        });
      });
    }
  }

  // faq pin
  let mm = gsap.matchMedia();
  mm.add("(min-width: 992px)", () => {
    const faqSection = document.querySelector(".faq-one, .team-details");
    const faqPin = document.querySelector(".faq-one__left, .team-details__image");

    if (!faqSection || !faqPin) return;

    ScrollTrigger.create({
      trigger: faqSection,
      start: "top 0px",
      end: () => "+=" + (faqSection.offsetHeight - faqPin.offsetHeight),
      pin: faqPin,
      pinSpacing: true,
      scrub: true,
    });
  });

  // service details sidebar pin
  let mm2 = gsap.matchMedia();
  mm2.add("(min-width: 992px)", () => {
    const serviceSection = document.querySelector(".service-details");
    const serviceSidebar = document.querySelector(".service-sidebar");

    if (!serviceSection || !serviceSidebar) return;

    ScrollTrigger.create({
      trigger: serviceSection,
      start: "top 0px",
      end: () =>
        "+=" + (serviceSection.offsetHeight - serviceSidebar.offsetHeight),
      pin: serviceSidebar,
      pinSpacing: true,
      scrub: true,
    });
  });

  // card flip in
  function bwItemFlipIn() {
    let bwItemFlipIn = gsap.utils.toArray(".bw-item-flip-in");
    if (bwItemFlipIn.length > 0) {
      bwItemFlipIn.forEach((item) => {
        gsap.set(item, {
          opacity: 0.7,
          transformPerspective: 4000,
          rotateX: 90,
          scale: 0.5,
          position: "relative",
          force3D: true,
        });

        gsap.to(item, {
          scrollTrigger: {
            trigger: item,
            scrub: 2,
            start: "top bottom+=100",
            end: "bottom center",
            markers: false,
          },
          scale: 1,
          rotateX: 0,
          opacity: 1,
          ease: "none",
        });
      });
    }
  }

  // testimonials pinned scrolling
  const section = document.querySelector(".testimonials-one--pinned");
  const container = document.querySelector(".container--pinned");
  const wrapper = document.querySelector(".testimonials-one__row");

  function testimonialsPinnedScrolling() {
    if (!section || !container || !wrapper) return;

    const screenHeight = window.innerHeight;

    const containerStyle = window.getComputedStyle(container);
    const paddingBottom = parseInt(containerStyle.paddingBottom) || 0;

    const wrapperHeight = wrapper.getBoundingClientRect().height;

    const finalY =
      wrapperHeight + screenHeight - (screenHeight - paddingBottom);

    gsap.to(wrapper, {
      y: -finalY,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${finalY}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  // awards animation
  function initAwardsAnimation() {
    mm.add("(min-width: 992px)", () => {
      const area = document.querySelector(".awards-one");
      if (!area) return;

      const boxes = area.querySelectorAll(".awards-one__item");
      if (boxes.length === 0) return;

      gsap.from(boxes, {
        x: "100%",
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          scrub: 2,
          trigger: area.querySelector(".awards-one__content"),
          start: "top 90%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  // work process 01 pinned scrolling
  const workProcess = document.querySelector("#workProcess");
  const workProcessWrapper = document.querySelector("#workProcessWrapper");

  function workProcessPinnedScrolling() {
    if (!workProcess || !workProcessWrapper) return;

    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger === workProcess) trigger.kill();
    });

    const wrapperHeight = workProcessWrapper.offsetHeight;

    gsap.fromTo(
      workProcessWrapper,
      {
        y: 0,
      },
      {
        y: -wrapperHeight,

        ease: "none",

        scrollTrigger: {
          trigger: workProcess,
          start: "top top",

          end: () => `+=${wrapperHeight}`,

          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      },
    );
  }

  // word process 02 animation
  function initWorkProcessAnimation() {
    mm.add("(min-width: 768px)", () => {
      const area = document.querySelector(".work-process-two");
      if (!area) return;

      const boxes = area.querySelectorAll(".work-process-two__item");
      if (boxes.length === 0) return;

      gsap.from(boxes, {
        x: "100%",
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          scrub: 2,
          trigger: area.querySelector(".work-process-two__wrapper"),
          start: "top 90%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  //image cliping effect
  function gridRevealAnim() {
    const initialClipPaths = [
      "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
      "polygon(33.33% 0%, 33.33% 0%, 33.33% 0%, 33.33% 0%)",
      "polygon(65.66% 0%, 66.66% 0%, 66.66% 0%, 66.66% 0%)",
      "polygon(0% 33.33%, 0% 33.33%, 0% 33.33%, 0% 33.33%)",
      "polygon(33.33% 33.33%, 33.33% 33.33%, 33.33% 33.33%, 33.33% 33.33%)",
      "polygon(65.66% 33.33%, 66.66% 33.33%, 66.66% 33.33%, 66.66% 33.33%)",
      "polygon(0% 66.66%, 0% 66.66%, 0% 66.66%, 0% 66.66%)",
      "polygon(33.33% 66.66%, 33.33% 66.66%, 33.33% 66.66%, 33.33% 66.66%)",
      "polygon(65.66% 66.66%, 66.66% 66.66%, 66.66% 66.66%, 66.66% 66.66%)",
    ];

    const finalClipPaths = [
      "polygon(0% 0%, 34.33% 0%, 34.33% 34.33%, 0% 34.33%)",
      "polygon(32.33% 0%, 66.66% 0%, 66.66% 33.33%, 33.33% 34.33%)",
      "polygon(65.66% 0%, 100% 0%, 100% 33.33%, 65.66% 34.33%)",
      "polygon(0% 33.33%, 33.33% 33.33%, 33.33% 66.66%, 0% 66.66%)",
      "polygon(30.33% 33.33%, 66.66% 33.33%, 66.66% 66.66%, 33.33% 66.66%)",
      "polygon(65.66% 33.33%, 100% 32.33%, 100% 66.66%, 65.66% 66.66%)",
      "polygon(0% 65.66%, 33.33% 66.66%, 33.33% 100%, 0% 100%)",
      "polygon(30.33% 66.66%, 66.66% 65.66%, 66.66% 100%, 33.33% 100%)",
      "polygon(65.66% 66.66%, 100% 65.66%, 100% 100%, 65.66% 100%)",
    ];

    document.querySelectorAll(".grid-reveal-anim").forEach((wrapper) => {
      const img = wrapper.querySelector(
        ".grid-reveal-anim-img[data-animate='true']",
      );
      if (!img) return;
      const url = img.src;

      wrapper.querySelectorAll(".mask").forEach((m) => m.remove());

      for (let i = 0; i < 9; i++) {
        const mask = document.createElement("div");
        mask.className = `mask mask-${i + 1}`;
        Object.assign(mask.style, {
          backgroundImage: `url(${url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          inset: "0",
        });
        wrapper.appendChild(mask);
      }
    });

    gsap.utils.toArray(".grid-reveal-anim").forEach((wrapper) => {
      const masks = wrapper.querySelectorAll(".mask");
      if (!masks.length) return;

      gsap.set(masks, { clipPath: (i) => initialClipPaths[i] });

      const order = [
        [".mask-1"],
        [".mask-2", ".mask-4"],
        [".mask-3", ".mask-5", ".mask-7"],
        [".mask-6", ".mask-8"],
        [".mask-9"],
      ];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top 90%",
          toggleActions: "restart none none reverse",
        },
      });

      order.forEach((targets, i) => {
        const validTargets = targets
          .map((c) => wrapper.querySelector(c))
          .filter((el) => el);

        if (validTargets.length) {
          tl.to(
            validTargets,
            {
              clipPath: (j, el) =>
                finalClipPaths[Array.from(masks).indexOf(el)],
              duration: 1,
              ease: "power4.out",
              stagger: 0.1,
            },
            i * 0.125,
          );
        }
      });
    });
  }

  // =============================================
  // CIRCLE BUTTON ANIMATION
  // =============================================

  $(".misiom-circle-btn").on("mouseenter", function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;

    $(this).find(".misiom-circle-btn__dot").css({
      top: y,
      left: x,
    });
  });

  $(".misiom-circle-btn").on("mouseout", function (e) {
    var x = e.pageX - $(this).offset().left;
    var y = e.pageY - $(this).offset().top;

    $(this).find(".misiom-circle-btn__dot").css({
      top: y,
      left: x,
    });
  });

  var hoverBtns = gsap.utils.toArray(".misiom-circle-btn-wrapper");
  const hoverBtnItem = gsap.utils.toArray(".misiom-circle-btn");
  hoverBtns.forEach((btn, i) => {
    $(btn).mousemove(function (e) {
      callParallax(e);
    });

    function callParallax(e) {
      parallaxIt(e, hoverBtnItem[i], 80);
    }

    function parallaxIt(e, target, movement) {
      var $this = $(btn);
      var relX = e.pageX - $this.offset().left;
      var relY = e.pageY - $this.offset().top;

      gsap.to(target, 0.5, {
        x: ((relX - $this.width() / 2) / $this.width()) * movement,
        y: ((relY - $this.height() / 2) / $this.height()) * movement,
        ease: Power2.easeOut,
      });
    }
    $(btn).mouseleave(function (e) {
      gsap.to(hoverBtnItem[i], 0.5, {
        x: 0,
        y: 0,
        ease: Power2.easeOut,
      });
    });
  });

  // =============================================
  //  WINDOW LOAD
  // =============================================

  $(window).on("load", function () {
    if ($("#smooth-wrapper").length && $("#smooth-content").length) {
      ScrollSmoother.create({
        smooth: 2,
        effects: true,
        smoothTouch: 0.1,
        ignoreMobileResize: false,
      });
    }

    bwSplitText();
    bwRevealText();
    bwRevealText2();
    bwTitleAnimation();
    bwScroll();
    bwAnimateRotate();
    rightToLeftAnim();
    leftToRightAnim();
    zoomEffect();
    initScaleAnimation();
    imageParallaxEffect();
    initPortfolioHover();
    initPortfolioScale();
    inibwarquees();
    inibwarquee();
    inibwarqueeLeft();
    rotatingSlideIn();
    bwItemFlipIn();
    testimonialsPinnedScrolling();
    initAwardsAnimation();
    workProcessPinnedScrolling();
    initWorkProcessAnimation();
    gridRevealAnim();

    ScrollTrigger.refresh();
  });

  window.addEventListener("resize", () => {
    workProcessPinnedScrolling();
    ScrollTrigger.refresh();
  });

  document.fonts.ready.then(function () {
    ScrollTrigger.refresh();
  });
})(jQuery);
