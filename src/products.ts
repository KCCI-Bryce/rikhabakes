import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis
const lenis = new Lenis({
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// 2. Custom Cursor (Shared Logic)
const cursorDot = document.querySelector('.cursor-dot') as HTMLElement;
const cursorOutline = document.querySelector('.cursor-outline') as HTMLElement;

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;
  gsap.to(cursorDot, { x: posX, y: posY, duration: 0.1, ease: 'power2.out' });
  gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.8, ease: 'power2.out' });
});

document.querySelectorAll('a, .btn, button').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursorOutline, { scale: 1.5, backgroundColor: 'rgba(255,255,255,0.1)', duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursorOutline, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
  });
});

// 3. Shared Modals Setup (Menu & Login)
const setupModals = () => {
  // Menu logic
  const menuToggle = document.getElementById('menu-toggle')
  const menuClose = document.getElementById('menu-close')
  const menuPopup = document.getElementById('menu-popup')
  const menuLinks = document.querySelectorAll('.menu-link')

  if (menuToggle && menuClose && menuPopup) {
    const menuTl = gsap.timeline({ paused: true, reversed: true })
    menuTl.to(menuPopup, { autoAlpha: 1, duration: 0.6, ease: "power3.inOut" })
    menuTl.to(menuLinks, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power4.out" }, "-=0.3")

    menuToggle.addEventListener('click', () => { lenis.stop(); menuTl.play(); })
    const closeNav = () => { menuTl.reverse(); lenis.start(); }
    menuClose.addEventListener('click', closeNav)
    menuLinks.forEach(link => link.addEventListener('click', closeNav))
  }

  // Login logic
  const loginToggle = document.getElementById('login-toggle')
  const loginClose = document.getElementById('login-close')
  const loginPopup = document.getElementById('login-popup')
  const loginSubmitBtn = document.getElementById('login-submit-btn')
  const registerToggleBtn = document.getElementById('register-toggle-btn')
  const loginTitle = document.getElementById('login-title')
  const loginEmail = document.getElementById('login-email') as HTMLInputElement
  const loginPassword = document.getElementById('login-password') as HTMLInputElement
  const loginError = document.getElementById('login-error')

  if (loginToggle && localStorage.getItem('rikhabakes_token')) {
    loginToggle.textContent = 'Dashboard';
  }

  if (loginToggle && loginClose && loginPopup && loginSubmitBtn && registerToggleBtn) {
    const loginTl = gsap.timeline({ paused: true, reversed: true })
    loginTl.to(loginPopup, { autoAlpha: 1, duration: 0.5, ease: "power2.inOut" })
           .fromTo([loginTitle, loginEmail, loginPassword, loginSubmitBtn, loginError, registerToggleBtn], 
              { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.out" }, "-=0.2")

    loginToggle.addEventListener('click', () => {
      if (localStorage.getItem('rikhabakes_token')) window.location.href = '/dashboard.html';
      else { lenis.stop(); loginTl.play(); }
    })
    loginClose.addEventListener('click', () => { loginTl.reverse(); lenis.start(); })
  }
}

// 4. Products Fetching & Rendering
const fetchProducts = async () => {
  const container = document.getElementById('products-container');
  if (!container) return;

  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    container.innerHTML = ''; // Clear loading

    products.forEach((product: any, index: number) => {
      const card = document.createElement('div');
      card.className = 'product-card gsap-reveal-card';
      card.innerHTML = `
        <div class="product-img-wrapper">
          <img src="${product.image_url}" alt="${product.name}" class="product-img">
        </div>
        <div class="product-info">
          <div class="product-details">
            <h3>${product.name}</h3>
            <p>Hand-crafted with single-origin ingredients.</p>
          </div>
          <div class="product-price">${product.price}</div>
        </div>
      `;
      container.appendChild(card);

      // Staggered reveal for cards
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          delay: index * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

  } catch (error) {
    console.error("Failed to fetch products", error);
    container.innerHTML = '<div class="loading-indicator">Failed to load artistry.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Hero reveal
  gsap.fromTo('.gsap-reveal-text', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" });
  gsap.fromTo('.gsap-reveal-subtext', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.5, delay: 0.3, ease: "power3.out" });

  setupModals();
  fetchProducts();
});
