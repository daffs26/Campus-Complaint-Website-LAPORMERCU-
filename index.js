/* ============================================================
   index.js — JS khusus Landing Page (index.html)
   ============================================================ */

// Smooth scroll untuk link navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');

  menu.classList.toggle('active');
  menuIcon.classList.toggle('hidden');
  closeIcon.classList.toggle('hidden');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');

  menu.classList.remove('active');
  menuIcon.classList.remove('hidden');
  closeIcon.classList.add('hidden');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.mobile-menu-btn');
  if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close mobile menu on resize to desktop
window.addEventListener('resize', function() {
  if (window.innerWidth >= 768) {
    closeMobileMenu();
  }
});
