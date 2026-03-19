import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// Initialize Lenis for buttery-smooth inertial scrolling
const lenis = new Lenis({
  duration: 1.5, // slightly slower, more elegant
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  touchMultiplier: 2,
})

// Synchronize Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// ------------------------------------------------------------------
// Custom Cursor
// ------------------------------------------------------------------
const cursorDot = document.querySelector('.cursor-dot') as HTMLElement;
const cursorOutline = document.querySelector('.cursor-outline') as HTMLElement;

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;

  gsap.to(cursorDot, { x: posX, y: posY, duration: 0.1, ease: 'power2.out' });
  gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.8, ease: 'power2.out' });
});

document.querySelectorAll('a, .btn').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursorOutline, { scale: 1.5, backgroundColor: 'rgba(255,255,255,0.1)', duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursorOutline, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
  });
});

// ------------------------------------------------------------------
// Animations Setup
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // 1. Hero Entrance Text Lines
  const heroLines = document.querySelectorAll('.gsap-hero-title .line-inner')
  gsap.fromTo(heroLines, 
    { yPercent: 120 }, 
    { yPercent: 0, duration: 1.5, stagger: 0.1, ease: "power4.out", delay: 0.2 }
  )

  const heroOthers = document.querySelectorAll('.gsap-hero-text, .gsap-hero-btn')
  gsap.fromTo(heroOthers,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.6 }
  )

  // 2. Parallax Images (Deep Scrub)
  const parallaxImgs = document.querySelectorAll('.gsap-parallax-img')
  parallaxImgs.forEach((img) => {
    // Math: img height is 130vh, top is -15vh. 
    // We travel from y: -15vh to y: 15vh, which keeps the image perfectly spanning the 100vh container.
    gsap.fromTo(img,
      { y: "-15vh" },
      {
        y: "15vh",
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement?.parentElement, // the section
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    )
  })

  // 3. Parallax images scrub (runs independently, no pinning needed)
  // The sticky-scene containers in HTML handle the wipe effect via CSS position:sticky.
  // GSAP is only responsible for the background image movement within the pinned sections.

  // 4. Split Text Reveals (Staggered lines for H2s)
  // Note: True SplitText requires Club GreenSock, so we fade-up block style
  const splitTexts = document.querySelectorAll('.split-text')
  splitTexts.forEach((text) => {
    gsap.fromTo(text, 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: text,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    )
  })

  const fadeUpTexts = document.querySelectorAll('.fade-up-text, .stagger-p p')
  fadeUpTexts.forEach((text) => {
    gsap.fromTo(text, 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: "power2.out",
        scrollTrigger: {
          trigger: text,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    )
  })

  // 5. Image Reveal & Zoom (Aupale-like wipe effect)
  const imgRevealCover = document.querySelector('.img-reveal-cover')
  const zoomImg = document.querySelector('.zoom-img')
  if (imgRevealCover && zoomImg) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.img-reveal-wrapper',
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    })
    tl.to(imgRevealCover, { height: '0%', duration: 1.2, ease: "power4.inOut" })
      .fromTo(zoomImg, { scale: 1.2 }, { scale: 1, duration: 1.5, ease: "power3.out" }, "-=1.2")
  }

  // 6. Footer Staggered Reveal
  const footerElements = document.querySelectorAll('.gsap-footer')
  ScrollTrigger.create({
    trigger: "footer",
    start: "top 90%",
    onEnter: () => {
      gsap.fromTo(footerElements, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power2.out" }
      )
    }
  })

  // ------------------------------------------------------------------
  // Interactive Pop-ups Logic
  // ------------------------------------------------------------------

  // A. Welcome Modal (Age Gate Style)
  const welcomePopup = document.getElementById('welcome-popup')
  const enterBtn = document.getElementById('enter-btn')
  
  if (welcomePopup && enterBtn) {
    // Pause Lenis scrolling while welcome modal is active
    lenis.stop()
    
    // Entrance animation for modal text
    gsap.fromTo('.welcome-title, .welcome-text, #enter-btn',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.5 }
    )

    enterBtn.addEventListener('click', () => {
      // Exit animation
      const tl = gsap.timeline({
        onComplete: () => {
          welcomePopup.style.display = 'none';
          lenis.start(); // Resume scrolling
        }
      })
      tl.to('.welcome-title, .welcome-text, #enter-btn', { y: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.in" })
        .to(welcomePopup, { opacity: 0, visibility: 'hidden', duration: 0.8, ease: "power2.inOut" }, "-=0.2")
    })
  } else {
    // Fallback if no welcome modal
    lenis.start()
  }

  // B. Full-screen Menu
  const menuToggle = document.getElementById('menu-toggle')
  const menuClose = document.getElementById('menu-close')
  const menuPopup = document.getElementById('menu-popup')
  const menuLinks = document.querySelectorAll('.menu-link')

  if (menuToggle && menuClose && menuPopup) {
    const menuTl = gsap.timeline({ paused: true, reversed: true })
    
    // Menu Background reveal
    menuTl.to(menuPopup, { autoAlpha: 1, duration: 0.6, ease: "power3.inOut" })
    // Menu Links stagger up
    menuTl.to(menuLinks, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power4.out" }, "-=0.3")

    menuToggle.addEventListener('click', () => {
      lenis.stop()
      menuTl.play()
    })

    const closeNav = () => {
      menuTl.reverse()
      lenis.start()
    }

    menuClose.addEventListener('click', closeNav)
    menuLinks.forEach(link => link.addEventListener('click', closeNav))
  }

  // C. Newsletter Floating Popup
  const newsletterPopup = document.getElementById('newsletter-popup')
  const newsletterClose = document.getElementById('newsletter-close')
  const newsletterBtn = newsletterPopup?.querySelector('.btn-small')
  const newsletterInput = newsletterPopup?.querySelector('input[type="email"]') as HTMLInputElement

  if (newsletterPopup && newsletterClose && newsletterBtn && newsletterInput) {
    ScrollTrigger.create({
      trigger: "body",
      start: "top -40%", // Triggers when scrolled 40% down
      onEnter: () => {
        if (!newsletterPopup.classList.contains('closed') && !newsletterPopup.classList.contains('subscribed')) {
          gsap.to(newsletterPopup, { autoAlpha: 1, y: -20, duration: 0.8, ease: "power3.out" })
        }
      }
    })

    newsletterClose.addEventListener('click', () => {
      newsletterPopup.classList.add('closed')
      gsap.to(newsletterPopup, { autoAlpha: 0, y: 20, duration: 0.4, ease: "power2.in" })
    })

    newsletterBtn.addEventListener('click', async () => {
      const email = newsletterInput.value;
      if (!email) return;

      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (response.ok) {
          newsletterPopup.classList.add('subscribed');
          newsletterPopup.innerHTML = '<h3 style="margin-bottom:0">Welcome to the inner circle.</h3>';
          setTimeout(() => {
            gsap.to(newsletterPopup, { autoAlpha: 0, y: 20, duration: 0.4, ease: "power2.in" })
          }, 3000);
        } else {
          alert("Error: " + (await response.json()).detail);
        }
      } catch (e) {
        console.error("Backend unreachable. Is FastAPI running?", e);
        alert("Backend unreachable. Please ensure Python backend is running.");
      }
    })
  }

  // D. Login Modal
  const loginToggle = document.getElementById('login-toggle')
  const loginClose = document.getElementById('login-close')
  const loginPopup = document.getElementById('login-popup')
  
  const loginTitle = document.getElementById('login-title')
  const loginSubtitle = document.getElementById('login-subtitle')
  const loginEmail = document.getElementById('login-email') as HTMLInputElement
  const loginPassword = document.getElementById('login-password') as HTMLInputElement
  const loginSubmitBtn = document.getElementById('login-submit-btn')
  const loginError = document.getElementById('login-error')
  const registerToggleBtn = document.getElementById('register-toggle-btn')

  let isLoginMode = true;

  if (loginToggle && localStorage.getItem('rikhabakes_token')) {
    loginToggle.textContent = 'Dashboard';
  }

  if (loginToggle && loginClose && loginPopup && loginSubmitBtn && registerToggleBtn) {
    const loginTl = gsap.timeline({ paused: true, reversed: true })
    
    loginTl.to(loginPopup, { autoAlpha: 1, duration: 0.5, ease: "power2.inOut" })
           .fromTo([loginTitle, loginSubtitle, loginEmail, loginPassword, loginSubmitBtn, loginError, registerToggleBtn], 
              { y: 30, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.out" }, "-=0.2")

    loginToggle.addEventListener('click', () => {
      if (localStorage.getItem('rikhabakes_token')) {
        window.location.href = '/dashboard.html';
      } else {
        lenis.stop();
        loginTl.play();
      }
    })

    loginClose.addEventListener('click', () => {
      loginTl.reverse()
      lenis.start()
    })

    registerToggleBtn.addEventListener('click', () => {
      isLoginMode = !isLoginMode;
      if (loginTitle && loginSubmitBtn) {
        loginTitle.textContent = isLoginMode ? 'Client Access' : 'Create Account';
        loginSubmitBtn.textContent = isLoginMode ? 'Sign In' : 'Register';
      }
      registerToggleBtn.textContent = isLoginMode ? 'Create Account Instead' : 'Have an account? Sign In';
      if (loginError) {
        loginError.style.color = '#ff5555';
        loginError.textContent = '';
      }
    })

    loginSubmitBtn.addEventListener('click', async () => {
      const email = loginEmail?.value;
      const password = loginPassword?.value;
      
      if (!email || !password) {
        if (loginError) loginError.textContent = "Email and password required.";
        return;
      }
      
      const endpoint = isLoginMode ? '/api/login' : '/api/register';
      
      try {
        if (loginSubmitBtn) loginSubmitBtn.textContent = "Processing...";
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          localStorage.setItem('rikhabakes_token', data.token);
          if (loginError) {
             loginError.style.color = '#55ff55';
             loginError.textContent = "Success! Access granted.";
          }
          loginToggle.textContent = 'Dashboard';
          setTimeout(() => {
            loginTl.reverse();
            lenis.start();
            if (loginSubmitBtn) loginSubmitBtn.textContent = isLoginMode ? 'Sign In' : 'Register';
          }, 1500);
        } else {
          if (loginError) {
             loginError.style.color = '#ff5555';
             loginError.textContent = data.detail || "Authentication failed.";
          }
          if (loginSubmitBtn) loginSubmitBtn.textContent = isLoginMode ? 'Sign In' : 'Register';
        }
      } catch (e) {
        if (loginError) {
           loginError.style.color = '#ff5555';
           loginError.textContent = "Server unreachable.";
        }
        if (loginSubmitBtn) loginSubmitBtn.textContent = isLoginMode ? 'Sign In' : 'Register';
      }
    })
  }

})

