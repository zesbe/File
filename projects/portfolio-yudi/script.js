// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = navMenu.classList.contains('active')
        ? 'rotate(-45deg) translate(-5px, 6px)'
        : '';
    spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navMenu.classList.contains('active')
        ? 'rotate(45deg) translate(-5px, -6px)'
        : '';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    });
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav-menu a[href*=' + sectionId + ']')?.classList.add('active');
        } else {
            document.querySelector('.nav-menu a[href*=' + sectionId + ']')?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', scrollActive);

// Scroll to Top on Navbar Brand Click
document.querySelector('.nav-brand').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Form Submission
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const subject = contactForm.querySelectorAll('input[type="text"]')[1].value;
    const message = contactForm.querySelector('textarea').value;

    // Simple validation
    if (!name || !email || !message) {
        alert('Mohon isi semua field yang wajib!');
        return;
    }

    // Show success message
    alert(`Terima kasih ${name}! Pesan Anda telah terkirim. Saya akan segera menghubungi Anda di ${email}.`);

    // Reset form
    contactForm.reset();

    // In production, you would send this data to a backend server
    // Example:
    // fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name, email, subject, message })
    // })
});

// Animate on Scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all skill cards, project cards, and stat items
document.querySelectorAll('.skill-card, .project-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Typing Effect for Hero Title
const heroTitle = document.querySelector('.hero-title');
const originalText = heroTitle.innerHTML;
let isTypingDone = false;

function typeWriter(element, html, speed = 50) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < html.length) {
            // Check if current character is part of a tag
            if (html[i] === '<') {
                // Find the closing >
                let tagEnd = html.indexOf('>', i);
                element.innerHTML += html.substring(i, tagEnd + 1);
                i = tagEnd + 1;
            } else {
                element.innerHTML += html[i];
                i++;
            }
            setTimeout(type, speed);
        } else {
            isTypingDone = true;
        }
    }

    type();
}

// Start typing effect when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        typeWriter(heroTitle, originalText, 50);
    }, 500);
});

// Smooth Scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
        return;
    }

    if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.8)';
    }

    lastScroll = currentScroll;
});

// Add transition to navbar
navbar.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

// Particle Background Effect (Optional - can be heavy on mobile)
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = '2px';
    particle.style.height = '2px';
    particle.style.background = 'rgba(102, 126, 234, 0.5)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = Math.random() * window.innerHeight + 'px';
    particle.style.zIndex = '-1';

    document.body.appendChild(particle);

    // Animate particle
    let yPos = parseFloat(particle.style.top);
    const speed = Math.random() * 2 + 1;

    function animateParticle() {
        yPos -= speed;
        particle.style.top = yPos + 'px';

        if (yPos < -10) {
            particle.remove();
        } else {
            requestAnimationFrame(animateParticle);
        }
    }

    animateParticle();
}

// Create particles periodically (only on desktop)
if (window.innerWidth > 768) {
    setInterval(createParticle, 500);
}

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16); // 60fps

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }

    updateCounter();
}

// Observe stats and animate when visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const target = parseInt(entry.target.textContent);
            animateCounter(entry.target, target);
            entry.target.classList.add('counted');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item h3').forEach(stat => {
    statsObserver.observe(stat);
});

// Log page load time
window.addEventListener('load', () => {
    console.log('%c Portfolio Yudi Haryanto ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px;');
    console.log('%c Website loaded successfully! ', 'color: #667eea; font-size: 14px;');
    console.log('%c Built with ❤️ using HTML, CSS & JavaScript ', 'color: #999;');
});
