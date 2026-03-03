document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when a nav link is clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // 2. Header Style on Scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(20, 20, 20, 0.98)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
            header.style.padding = '0.5rem 0';
        } else {
            header.style.backgroundColor = 'rgba(26, 26, 26, 0.85)';
            header.style.boxShadow = 'none';
            header.style.padding = '1rem 0';
            header.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        }
    });

    // 3. Active Nav Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id], footer[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Add a small offset so that it triggers nicely right before hitting the section
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    });
});
