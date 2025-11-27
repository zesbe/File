# Portfolio Yudi Haryanto

Portfolio website modern dan responsive untuk menampilkan projects, skills, dan informasi kontak.

## ✨ Fitur

- **Responsive Design** - Tampil sempurna di desktop, tablet, dan mobile
- **Modern UI/UX** - Design gradient yang menarik dengan animasi smooth
- **Interactive Elements** - Typing effect, scroll animations, dan hover effects
- **Multiple Sections**:
  - Hero/Landing dengan intro
  - About dengan statistik
  - Skills showcase dengan icons
  - Projects gallery dengan overlay
  - Contact form

## 🚀 Cara Menjalankan

### Opsi 1: Langsung Buka HTML
```bash
# Buka langsung di browser
xdg-open index.html
```

### Opsi 2: Menggunakan Node.js Server (Recommended)
```bash
# Jalankan server
node server.js

# Buka browser dan akses:
# http://localhost:3000
```

### Opsi 3: Menggunakan Python Server
```bash
# Python 3
python -m http.server 3000

# Akses: http://localhost:3000
```

## 📁 Struktur File

```
portfolio-yudi/
├── index.html      # File HTML utama
├── style.css       # Styling dan design
├── script.js       # JavaScript untuk interactivity
├── server.js       # Node.js HTTP server
└── README.md       # Dokumentasi
```

## 🎨 Customization

### Mengubah Warna Theme
Edit variabel CSS di `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
}
```

### Mengubah Konten
1. **Informasi Personal**: Edit section `#home` di `index.html`
2. **Skills**: Edit section `#skills`
3. **Projects**: Edit section `#projects`
4. **Contact Info**: Edit section `#contact`

### Menambah/Hapus Section
1. Tambahkan section baru di `index.html`
2. Tambahkan link ke navigation
3. Sesuaikan styling di `style.css` jika perlu

## 🔧 Teknologi

- **HTML5** - Semantic markup
- **CSS3** - Modern styling dengan gradients, animations, flexbox & grid
- **JavaScript (Vanilla)** - No frameworks, pure JavaScript
- **Font Awesome** - Icons library
- **Node.js** - Optional HTTP server

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📝 To-Do / Future Improvements

- [ ] Tambah dark/light mode toggle
- [ ] Integrasi dengan backend untuk contact form
- [ ] Tambah blog section
- [ ] Implementasi testimonials
- [ ] Tambah download CV button
- [ ] Multi-language support (ID/EN)
- [ ] Loading animation
- [ ] Tambah lebih banyak projects

## 📄 License

MIT License - Feel free to use this template for your own portfolio!

## 👨‍💻 Author

**Yudi Haryanto**
- Email: yudi.haryanto@example.com
- GitHub: [@yudiharyanto](https://github.com/yudiharyanto)
- LinkedIn: [Yudi Haryanto](https://linkedin.com/in/yudiharyanto)

---

Made with ❤️ using HTML, CSS & JavaScript
