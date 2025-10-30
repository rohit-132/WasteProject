// Dynamic imports to prevent SSR issues
let gsap: any;
let ScrollTrigger: any;
let LocomotiveScroll: any;

// Only import on client side
if (typeof window !== 'undefined') {
  Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    // @ts-ignore
    import('locomotive-scroll')
  ]).then(([gsapModule, scrollTriggerModule, locomotiveModule]) => {
    gsap = gsapModule.default;
    ScrollTrigger = scrollTriggerModule.default;
    LocomotiveScroll = locomotiveModule.default;
    
    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
  });
}

/**
 * Sets up Locomotive Scroll with GSAP ScrollTrigger integration
 */
export async function setupLocomotive(containerRef: HTMLElement | null) {
  if (!containerRef || typeof window === 'undefined') return null;
  
  // Wait for libraries to be loaded
  if (!LocomotiveScroll || !ScrollTrigger) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!LocomotiveScroll || !ScrollTrigger) return null;
  }
  
  // Initialize Locomotive Scroll
  const locoScroll = new LocomotiveScroll({
    el: containerRef,
    smooth: true,
    multiplier: 1,
    lerp: 0.1, // Linear Interpolation - smoother scrolling
    tablet: { smooth: true },
    smartphone: { smooth: true }
  });
  
  // Tell ScrollTrigger to use these proxy methods for the containerRef element
  ScrollTrigger.scrollerProxy(containerRef, {
    scrollTop(value: any) {
      return arguments.length 
        ? locoScroll.scrollTo(value, 0, 0) 
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    // LocomotiveScroll handles things differently on mobile devices
    pinType: containerRef.style.transform ? "transform" : "fixed"
  });
  
  // Each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  
  // After everything is set up, refresh() ScrollTrigger and update LocomotiveScroll
  ScrollTrigger.refresh();
  
  return locoScroll;
}

/**
 * Splits the text into individual spans for character-by-character animation
 */
export function splitText(element: HTMLElement | null) {
  if (!element || typeof window === 'undefined') return;
  
  const text = element.textContent || '';
  const words = text.split(' ');
  let html = '';
  
  words.forEach((word, wordIndex) => {
    html += '<span class="word">';
    
    for (let i = 0; i < word.length; i++) {
      html += `<span class="char">${word[i]}</span>`;
    }
    
    html += '</span>';
    
    if (wordIndex < words.length - 1) {
      html += '<span class="char">&nbsp;</span>';
    }
  });
  
  element.innerHTML = html;
}

/**
 * Creates text highlight animation using GSAP
 */
export async function createTextHighlightAnimation(element: HTMLElement | null, containerRef: HTMLElement | null) {
  if (!element || !containerRef || typeof window === 'undefined') return;
  
  // Wait for GSAP to be loaded
  if (!gsap) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!gsap) return;
  }
  
  // First split the text
  splitText(element);
  
  // Set initial color
  gsap.set(element.querySelectorAll('.char'), {
    color: 'inherit',
  });
  
  // Create animation
  gsap.to(element.querySelectorAll('.char'), {
    color: '#45DA81', // The green color you specified
    stagger: 0.02,
    duration: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element,
      scroller: containerRef,
      start: 'top 80%',
      end: 'top 20%',
      scrub: true,
    }
  });
  
  // Create a cool wave effect
  gsap.to(element.querySelectorAll('.word'), {
    y: -10,
    opacity: 1,
    stagger: 0.1,
    duration: 0.5,
    ease: 'back.out(1.7)',
    scrollTrigger: {
      trigger: element,
      scroller: containerRef,
      start: 'top 80%',
      end: 'top 40%',
      scrub: 1,
    }
  });
}