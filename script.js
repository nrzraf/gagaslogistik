/* ── PT. GAGAS LOGISTIK INDONESIA - MAIN JAVASCRIPT ── */
/* ── Smooth Scroll (JS-driven, overrides CSS) ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

    /* ── NAV SCROLL ── */
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    /* ── MOBILE MENU ── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    function openMobileMenu() {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });
    // Close menu when a link is clicked — smooth scroll handled by global handler above
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMobileMenu());
    });

    /* ── SCROLL REVEAL ── */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    /* ── STAT COUNTERS ── */
    function animateCounter(el) {
      const target = parseFloat(el.dataset.target);
      const decimal = el.dataset.decimal;
      const duration = 1800;
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const val = eased * target;
        el.textContent = decimal ? val.toFixed(1) : Math.floor(val);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = decimal ? target.toFixed(1) : target;
      }
      requestAnimationFrame(step);
    }
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stats-grid').forEach(el => statObserver.observe(el));

    /* ── 3D CAROUSEL ── */
    const cards = Array.from(document.querySelectorAll('.phone-card'));
    const totalCards = cards.length;
    let currentCenter = 0;
    let autoTimer = null;
    let isAnimating = false;

    // Zoom steps (optimized for modern box cards)
    const zoomSteps = [
      { pw: 200, g1: 220, g2: 390, gh: 520, sh: 380 },
      { pw: 240, g1: 260, g2: 460, gh: 620, sh: 420 },
      { pw: 280, g1: 300, g2: 540, gh: 720, sh: 470 },
      { pw: 320, g1: 340, g2: 610, gh: 810, sh: 510 },
      { pw: 360, g1: 380, g2: 680, gh: 900, sh: 560 },
    ];
    let zoomLevel = 2;

    // Per-position config: [translateX multiplier, rotateY, scale, opacity]
    const posConfig = {
      'center':       [  0,    0,    1,    1   ],
      'left1':        [ -1,   28,  0.82,  1   ],
      'right1':       [  1,  -28,  0.82,  1   ],
      'left2':        [ -1,   45,  0.64,  0.55],
      'right2':       [  1,  -45,  0.64,  0.55],
      'hidden-left':  [ -1,   60,  0.48,  0   ],
      'hidden-right': [  1,  -60,  0.48,  0   ],
    };
    const posGap = {
      'center': 0, 'left1': 'g1', 'right1': 'g1',
      'left2': 'g2', 'right2': 'g2',
      'hidden-left': 'gh', 'hidden-right': 'gh',
    };

    // Single function: apply width + transform + opacity to all cards atomically
    function applyCardStyles(suppressTransition) {
      const s = zoomSteps[zoomLevel];
      cards.forEach(card => {
        const pos = card.dataset.pos;
        const cfg = posConfig[pos];
        if (!cfg) return;
        const gapKey = posGap[pos];
        const tx = cfg[0] * (gapKey ? s[gapKey] : 0);
        const shell = card.querySelector('.phone-shell');

        if (suppressTransition) {
          card.style.transition = 'none';
          if (shell) shell.style.transition = 'none';
        }

        card.style.width   = s.pw + 'px';
        card.style.transform = `translateX(${tx}px) rotateY(${cfg[1]}deg) scale(${cfg[2]})`;
        card.style.opacity = cfg[3];
        if (shell) {
          shell.style.width = s.pw + 'px';
          // Update center shadow via JS too
          if (pos === 'center') {
            shell.style.boxShadow = '0 0 0 1.5px rgba(163,24,29,0.3), 0 24px 60px rgba(117,18,22,0.16), 0 4px 16px rgba(0,0,0,0.06)';
          } else {
            shell.style.boxShadow = '0 0 0 1px rgba(163,24,29,0.08), 0 8px 24px rgba(0,0,0,0.06)';
          }
        }

        if (suppressTransition) {
          // Re-enable transitions next frame
          requestAnimationFrame(() => {
            card.style.transition = '';
            if (shell) shell.style.transition = '';
          });
        }
      });
      carouselStageEl.style.height = s.sh + 'px';
    }

    function getPositionForOffset(cardIndex, centerIndex, total) {
      let offset = cardIndex - centerIndex;
      while (offset > Math.floor(total / 2)) offset -= total;
      while (offset < -Math.floor(total / 2)) offset += total;
      if (total === 4 && (offset === 2 || offset === -2)) {
        return 'right2';
      }
      const posMap = { '-2': 'left2', '-1': 'left1', '0': 'center', '1': 'right1', '2': 'right2' };
      return posMap[String(offset)] || (offset < 0 ? 'hidden-left' : 'hidden-right');
    }

    function updatePositions() {
      cards.forEach((card, i) => {
        card.dataset.pos = getPositionForOffset(i, currentCenter, totalCards);
      });
      document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentCenter);
      });
      applyCardStyles(false); // allow transitions for sliding
    }

    function goTo(index) {
      if (isAnimating) return;
      isAnimating = true;
      currentCenter = ((index % totalCards) + totalCards) % totalCards;
      updatePositions();
      setTimeout(() => { isAnimating = false; }, 700);
    }

    function next() { goTo((currentCenter + 1) % totalCards); }
    function prev() { goTo((currentCenter - 1 + totalCards) % totalCards); }

    // Build dots
    const dotsContainer = document.getElementById('carouselDots');
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === currentCenter ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    document.getElementById('carouselNext').addEventListener('click', () => { next(); resetAuto(); });
    document.getElementById('carouselPrev').addEventListener('click', () => { prev(); resetAuto(); });

    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (card.dataset.pos !== 'center') { goTo(i); resetAuto(); }
      });
    });

    function startAuto() { autoTimer = setInterval(next, 3500); }
    function stopAuto()  { clearInterval(autoTimer); }
    function resetAuto() { stopAuto(); startAuto(); }

    const stage = document.getElementById('carouselStage');
    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);

    let touchStartX = 0;
    stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetAuto(); }
    });

    const carouselStageEl = document.getElementById('carouselStage');

    function setZoom(level) {
      zoomLevel = Math.max(0, Math.min(zoomSteps.length - 1, level));
      applyCardStyles(true);
    }

    // Init Carousel
    updatePositions();
    setZoom(zoomLevel);
    startAuto();

    /* ── COPY PHONE NUMBER TO CLIPBOARD ── */
    const copyPhoneBtn = document.getElementById('copyPhoneBtn');
    if (copyPhoneBtn) {
      const copyPhoneText = document.getElementById('copyPhoneText') || copyPhoneBtn;
      const originalText = copyPhoneText.textContent;
      let copyTimer = null;

      copyPhoneBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const phoneNumber = '021-89453378';
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(phoneNumber);
          } else {
            const ta = document.createElement('textarea');
            ta.value = phoneNumber;
            ta.style.position = 'fixed';
            ta.style.left = '-999999px';
            ta.style.top = '-999999px';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          copyPhoneBtn.classList.add('copied');
          copyPhoneText.textContent = currentLang === 'id' ? 'Tersalin!' : 'Copied!';
          clearTimeout(copyTimer);
          copyTimer = setTimeout(() => {
            copyPhoneBtn.classList.remove('copied');
            copyPhoneText.textContent = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
      });
    }

    /* ── PRICING TOGGLE (if present) ── */
    const pricingToggle = document.getElementById('pricingToggle');
    if (pricingToggle) {
      const prices = { starter: [20, 13], pro: [60, 39], ent: [150, 98] };
      const annualTotals = { starter: 156, pro: 468, ent: 1176 };
      let isAnnual = false;
      const monthlyLabel = document.getElementById('monthlyLabel');
      const annualLabel = document.getElementById('annualLabel');

      function updatePricing() {
        const idx = isAnnual ? 1 : 0;
        const pStarter = document.getElementById('price-starter');
        const pPro = document.getElementById('price-pro');
        const pEnt = document.getElementById('price-ent');
        if (pStarter) pStarter.textContent = prices.starter[idx];
        if (pPro) pPro.textContent = prices.pro[idx];
        if (pEnt) pEnt.textContent = prices.ent[idx];
        const annualSuffix = currentLang === 'id' ? 'ditagih tahunan' : 'billed annually';
        const nStarter = document.getElementById('annual-note-starter');
        const nPro = document.getElementById('annual-note-pro');
        const nEnt = document.getElementById('annual-note-ent');
        if (nStarter) nStarter.textContent = isAnnual ? `$${annualTotals.starter} ${annualSuffix}` : '\u00a0';
        if (nPro) nPro.textContent = isAnnual ? `$${annualTotals.pro} ${annualSuffix}` : '\u00a0';
        if (nEnt) nEnt.textContent = isAnnual ? `$${annualTotals.ent} ${annualSuffix}` : '\u00a0';
        if (monthlyLabel) monthlyLabel.classList.toggle('active', !isAnnual);
        if (annualLabel) annualLabel.classList.toggle('active', isAnnual);
        pricingToggle.classList.toggle('annual', isAnnual);
        pricingToggle.setAttribute('aria-checked', isAnnual);
      }

      pricingToggle.addEventListener('click', () => { isAnnual = !isAnnual; updatePricing(); });
      pricingToggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isAnnual = !isAnnual; updatePricing(); }
      });
    }

    /* ── FAQ ACCORDION ── */
    const faqItems = document.querySelectorAll('.faq-item');
    let allOpen = false;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => toggleFaq(item));
      question.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(item); }
      });
    });

    function toggleFaq(item) {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      item.querySelector('.faq-question').setAttribute('aria-expanded', !isOpen);
    }

    const faqToggleAllBtn = document.getElementById('faqToggleAll');
    const faqToggleIcon  = document.getElementById('faqToggleIcon');
    faqToggleAllBtn.addEventListener('click', () => {
      allOpen = !allOpen;
      faqItems.forEach(item => {
        item.classList.toggle('open', allOpen);
        item.querySelector('.faq-question').setAttribute('aria-expanded', String(allOpen));
      });
      faqToggleIcon.textContent = allOpen ? '−' : '+';
      const faqToggleText = document.getElementById('faqToggleText');
      if (faqToggleText) {
        faqToggleText.textContent = allOpen 
          ? (currentLang === 'id' ? 'Tutup semua' : 'Collapse all') 
          : (currentLang === 'id' ? 'Buka semua' : 'Expand all');
      }
    });

    /* ── I18N (LANGUAGE SWITCHER) ── */
    const FLAG_ID_SVG = `<svg width="19" height="19" viewBox="0 0 24 24" class="flag-icon" style="border-radius: 50%; border: 1px solid rgba(0,0,0,0.15); box-sizing: border-box;"><rect width="24" height="12" fill="#CE1126"/><rect y="12" width="24" height="12" fill="#FFFFFF"/></svg>`;

    const FLAG_EN_SVG = `<svg width="19" height="19" viewBox="0 0 24 24" class="flag-icon" style="border-radius: 50%; border: 1px solid rgba(0,0,0,0.15); box-sizing: border-box;"><rect width="24" height="24" fill="#012169"/><path d="M0 0 L24 24 M24 0 L0 24" stroke="#FFFFFF" stroke-width="4.2"/><path d="M0 0 L24 24 M24 0 L0 24" stroke="#C8102E" stroke-width="1.8"/><path d="M12 0 V24 M0 12 H24" stroke="#FFFFFF" stroke-width="6.5"/><path d="M12 0 V24 M0 12 H24" stroke="#C8102E" stroke-width="3.8"/></svg>`;

    const translations = {
      id: {
        "meta_title": "PT. Gagas Logistik Indonesia - Transportasi Darat & Manajemen Logistik Terpercaya",
        "nav.services": "Layanan",
        "nav.pricing": "Biaya",
        "nav.solutions": "Solusi Transportasi",
        "nav.halal": "Komitmen Halal",
        "nav.about": "Visi & Misi",
        "nav.faq": "FAQ",
        "nav.contact": "Kontak",
        "nav.contact_us": "Hubungi Kami",

        "hero.badge": "Standar Layanan Unggul · <strong>Manajemen Logistik &amp; Armada Terpercaya</strong>",
        "hero.title": "Transportasi Darat &amp; Logistik,<br><em>Unggul, Aman &amp; Berintegritas Tinggi.</em>",
        "hero.sub": "PT. Gagas Logistik Indonesia memadukan eksekusi transportasi dan manajemen armada modern dengan standar operasional terbaik, presisi, dan terpercaya.",
        "hero.cta_contact": "Hubungi Kami",
        "hero.cta_services": "Lihat Layanan",
        "hero.trust_1": "Standar Layanan Unggul",
        "hero.trust_2": "99.8% Ketepatan Waktu SLA",
        "hero.db_title": "Pusat Kendali Operasional",
        "hero.db_tag": "Aktif Beroperasi",
        "hero.stat_1_label": "Kepatuhan Standar Armada",
        "hero.stat_2_label": "Pengawasan Operasional",
        "hero.stat_3_label": "Efisiensi Rute",
        "hero.float_badge_2_label": "Distribusi kargo aman",

        "ticker.label": "Mitra pengiriman kargo dan transportasi darat terpercaya di seluruh Indonesia",

        "services.label": "Layanan Armada",
        "services.title": "Armada &amp; Layanan Logistik,<br><em>siap mengirim kargo Anda</em>",
        "services.sub": "Pilihan armada logistik lengkap dan terpercaya dari Gagas Logistik — melayani pengiriman kargo ringan, muatan berat, hingga rantai dingin (cold chain).",
        "services.card_0_title": "Light Truck",
        "services.card_0_desc": "Lincah dan efisien untuk pengiriman kargo ringan serta distribusi cepat area perkotaan.",
        "services.card_1_title": "Medium Truck",
        "services.card_1_desc": "Daya angkut optimal untuk distribusi material industri, logistik retail, dan rute antarkota.",
        "services.card_2_title": "Heavy Cargo",
        "services.card_2_desc": "Kapasitas maksimal untuk muatan besar jarak jauh, wingbox, kontainer, dan rantai pasok industri.",
        "services.card_3_title": "Cold Chain",
        "services.card_3_desc": "Armada berpendingin khusus untuk pengiriman produk beku, farmasi, &amp; makanan segar.",

        "solutions.label": "Solusi Terpadu",
        "solutions.title": "Solusi Transportasi Darat &amp;<br><em>Manajemen Pengemudi Handal</em>",
        "solutions.sub": "Menggabungkan eksekusi transportasi presisi dengan manajemen armada mutakhir untuk efisiensi maksimal di jalan.",
        "solutions.land_title": "Land Transportation",
        "solutions.land_desc": "Kami menggabungkan eksekusi transportasi dengan layanan manajemen transportasi untuk memenuhi segala kebutuhan Anda di jalan raya. Melalui jaringan pusat kendali dan armada terawat, kami mengoordinasikan pengiriman di sepanjang rute serta memastikan kargo Anda selalu menempuh rute paling efisien. Solusi transportasi darat kami menyediakan berbagai tipe truk didukung suspensi udara (air suspension), pengawasan rute terkoordinasi, serta armada berpendingin (refrigerated cargo).",
        "solutions.tag_control_tower": "Pusat Kendali",
        "solutions.tag_monitoring": "Pengawasan Terkoordinasi",
        "solutions.tag_air_susp": "Air Suspension",
        "solutions.tag_temp_ctrl": "Refrigerated Cargo",
        "solutions.tag_route_opt": "Rute Paling Efisien",
        "solutions.tag_global_net": "Jaringan Luas",
        "solutions.driver_title": "Driver Management",
        "solutions.driver_desc": "Mengelola pengemudi armada secara efektif mampu menghemat biaya operasional perusahaan secara signifikan setiap tahunnya. Melalui pelatihan pengemudi profesional, sistem telematika canggih, dan manajemen bahan bakar yang terukur, armada dapat memangkas biaya dan jarak tempuh tanpa mengurangi standar layanan. Kami menerapkan prosedur terstruktur mulai dari pemeriksaan lisensi, penilaian risiko (risk assessment), hingga pelatihan economic driving dan pemilihan rute terbaik.",
        "solutions.tag_driver_training": "Driver Training",
        "solutions.tag_telematics": "Telematics Systems",
        "solutions.tag_fuel_mgmt": "Fuel Management",
        "solutions.tag_eco_driving": "Economic Driving",
        "solutions.tag_licence_check": "Licence Checks",
        "solutions.tag_risk_assess": "Risk Assessments",

        "pricing.label": "Skema Tarif &amp; Multi-Drop",
        "pricing.title": "Tarif Transparan Armada Truk,<br><em>Hemat Biaya Drop Tambahan</em>",
        "pricing.sub": "Pengiriman kargo multi-titik (multi-drop) kini lebih efisien dan hemat bersama Gagas Logistik. Titik drop pertama selalu gratis!",
        "pricing.promo_badge": "Promo Multi-Drop",
        "pricing.promo_text": "<strong>Drop ke-1 GRATIS!</strong> Setiap pengiriman armada CDE &amp; CDD bebas biaya drop pertama. Tambahan titik drop berikutnya mulai Rp 15.000.",
        "pricing.cde_pill": "Engkel 4 Roda",
        "pricing.cde_title": "Truk CDE (Colt Diesel Engkel)",
        "pricing.cde_desc": "Truk kategori kecil-menengah yang lincah dengan manuver tinggi di area perkotaan dan jalan sempit.",
        "pricing.drop1_label": "Drop Pertama (Drop #1)",
        "pricing.drop_free": "GRATIS",
        "pricing.cde_next_label": "Drop ke-2 dan seterusnya (>1 Drop):",
        "pricing.per_drop": "/ titik drop",
        "pricing.spec_wheels": "Jumlah Roda",
        "pricing.cde_wheels": "4 Roda (2 Depan, 2 Belakang)",
        "pricing.spec_axle": "Konfigurasi Gandar",
        "pricing.cde_axle": "1 Sumbu Gandar Tunggal",
        "pricing.spec_capacity": "Kapasitas Beban",
        "pricing.cde_capacity": "1 s/d 2,5 Ton (hingga 2 Ton)",
        "pricing.spec_use": "Karakteristik &amp; Muatan",
        "pricing.cde_use": "Distribusi retail perkotaan, material ringan, paket UMKM, &amp; rute padat",
        "pricing.cta_cde": "Pesan Truk CDE",
        "pricing.cdd_badge": "Pilihan Terpopuler",
        "pricing.cdd_pill": "Double 6 Roda",
        "pricing.cdd_title": "Truk CDD (Colt Diesel Double)",
        "pricing.cdd_desc": "Truk kategori medium-heavy dengan volume dan daya muat besar untuk distribusi skala besar antar wilayah.",
        "pricing.cdd_next_label": "Drop ke-2 dan seterusnya (>1 Drop):",
        "pricing.cdd_wheels": "6 Roda (2 Depan, 4 Belakang)",
        "pricing.cdd_axle": "Ban Ganda pada Sumbu Gandar Belakang",
        "pricing.cdd_capacity": "4 s/d 7 Ton (beban berat 5–7 Ton)",
        "pricing.cdd_use": "Distribusi kargo pabrik, logistik retail besar, material industri, &amp; antar-kota",
        "pricing.cta_cdd": "Pesan Truk CDD",
        "pricing.diff_title": "Perbedaan Utama Truk CDE dan CDD",
        "pricing.diff_text": "<strong>Truk CDE (Colt Diesel Engkel)</strong> memiliki total 4 roda pada sumbu gandar tunggal dengan kapasitas beban sekitar 1 hingga 2,5 ton (hingga 2 ton), sangat cocok untuk kelincahan distribusi dalam kota. Sementara itu, <strong>Truk CDD (Colt Diesel Double)</strong> memiliki total 6 roda dengan ban ganda di sumbu belakang dan kapasitas angkut jauh lebih besar yaitu 4 hingga 7 ton (5–7 ton), ideal untuk pengiriman kargo berkapasitas besar dan jarak menengah-jauh.",

        "stats.s1_label": "Kepatuhan Standar Mutu",
        "stats.s1_sub": "Standar resmi operasional terpadu",
        "stats.s2_label": "Pemantauan Armada",
        "stats.s2_sub": "Pengawasan armada & kargo terpadu",
        "stats.s3_label": "Ketepatan Waktu SLA",
        "stats.s3_sub": "Performa rute teruji & terpercaya",
        "stats.s4_label": "Armada Truk Modern",
        "stats.s4_sub": "Suspensi udara & cold chain siap jalan",

        "halal.label": "Jaminan Mutu & Kepatuhan",
        "halal.title": "Komitmen Kebijakan Halal<br><em>Sistem Jaminan Produk Halal (SJPH)</em>",
        "halal.sub": "Memastikan integritas halal dari hulu hingga hilir sesuai standar Badan Penyelenggara Jaminan Produk Halal (BPJPH).",
        "halal.pledge_text": "\"Manajemen dan seluruh karyawan PT. Gagas Logistik Indonesia berkomitmen dan bertanggung jawab dalam memastikan pemenuhan persyaratan Sistem Jaminan Produk Halal (SJPH) secara konsisten dan berkesinambungan dengan melakukan tindakan sebagai berikut:\"",
        "halal.c1_title": "Kepatuhan Peraturan BPJPH",
        "halal.c1_desc": "Mematuhi peraturan perundangan yang terkait dan memenuhi persyaratan sertifikasi produk halal yang ditetapkan oleh Badan Penyelenggara Jaminan Produk Halal (BPJPH).",
        "halal.c2_title": "Jaminan Produk & Bahan Halal",
        "halal.c2_desc": "Menjamin semua bahan dan produk yang kami distribusikan halal, bebas dari kontaminasi silang, dan selalu higienis selama proses pengangkutan.",
        "halal.c3_title": "Penyediaan Sumber Daya Memadai",
        "halal.c3_desc": "Menyediakan sumber daya yang memadai dalam rangka penyusunan, penerapan, dan perbaikan yang berkelanjutan dari Sistem Jaminan Produk Halal (SJPH).",
        "halal.c4_title": "Pelatihan & Kompetensi SDM",
        "halal.c4_desc": "Melakukan pembinaan sumber daya manusia melalui pelatihan dan/atau peningkatan kompetensi di bidang halal sesuai dengan kebutuhan operasional.",
        "halal.c5_title": "Sosialisasi Kebijakan Halal",
        "halal.c5_desc": "Melakukan sosialisasi Kebijakan Halal kepada semua pihak yang terkait (internal dan eksternal) untuk memastikan semua personel menjaga integritas halal di perusahaan.",

        "vision.label": "Tentang Kami",
        "vision.title": "Fondasi Kuat untuk Pertumbuhan<br><em>Visi &amp; Misi Perusahaan</em>",
        "vision.sub": "Menjadi rujukan terdepan dalam industri logistik global dan mitra paling terpercaya bagi perkembangan bisnis Anda.",
        "vision.quote_text": "\"Logistik merupakan tulang punggung perdagangan global dan memainkan peran penting dalam setiap aspek kehidupan kita sehari-hari. Dengan komitmen ini, ambisi kami adalah menjadikan Gagas Logistik referensi terdepan yang tak terbantahkan di industri logistik. <em>Dengan melakukan yang terbaik, kami memampukan bisnis untuk tumbuh dan komunitas untuk berkembang.</em>\"",
        "vision.vision_badge": "Visi Kami",
        "vision.vision_title": "Vision",
        "vision.v1": "Menjadikan kepercayaan dan kepuasan pelanggan sebagai prioritas utama (To make customer trust and satisfaction our top priorities).",
        "vision.v2": "Menjadi Transporter yang sukses dan terdepan di Indonesia (To become a successful Transporter in Indonesia).",
        "vision.v3": "Menjadi perusahaan yang dihormati oleh pelanggan, karyawan, dan pemegang saham (To become a respected company for its customers, employees, and shareholders).",
        "vision.mission_badge": "Misi Kami",
        "vision.mission_title": "Mission",
        "vision.m1": "Menjadi Transporter dengan pertumbuhan tercepat di Indonesia dengan penekanan pada kepuasan pelanggan, pertumbuhan berkelanjutan, dan manajemen yang solid (To become the fastest growing Transporter in Indonesia with the emphasis on customer satisfaction, sustainable growth, and solid management).",
        "vision.m2": "Menciptakan nilai tambah dengan menghadirkan solusi rantai pasok end-to-end yang menjawab kebutuhan bisnis pelanggan yang paling kompleks dan dinamis.",
        "vision.m3": "Membangun kemitraan jangka panjang yang kokoh berlandaskan keahlian internasional dan pemahaman mendalam atas pasar lokal Indonesia.",

        "faq.label": "FAQ",
        "faq.title": "Pertanyaan yang<br><em>sering diajukan</em>",
        "faq.sub": "Tidak menemukan yang Anda cari? Hubungi kami di admin@gagaslogistik.com — kami merespons dalam 2 jam.",
        "faq.expand_all": "Buka semua",
        "faq.collapse_all": "Tutup semua",
        "faq.q1": "Bagaimana komitmen mutu dan kepatuhan SJPH di Gagas Logistik?",
        "faq.a1": "Manajemen dan seluruh staf berkomitmen konsisten menerapkan Sistem Jaminan Produk (SJPH) sesuai standar BPJPH, menjamin semua produk yang didistribusikan higienis, bebas kontaminasi, dan ditangani oleh personel terlatih dan kompeten.",
        "faq.q2": "Apa saja keunggulan layanan Land Transportation Gagas Logistik?",
        "faq.a2": "Kami mengombinasikan eksekusi pengiriman dengan manajemen pusat kendali terpadu, armada bersuspensi udara (air suspension), pengawasan rute terkoordinasi, dan rute tercepat untuk efisiensi biaya maksimal.",
        "faq.q3": "Bagaimana simulasi biaya multi-drop untuk truk CDE dan CDD?",
        "faq.a3": "Untuk armada truk CDE maupun CDD, titik drop pertama tidak dikenakan biaya tambahan (1 = gratis). Jika terdapat lebih dari 1 titik bongkar/drop (>1 drop), tarif tambahan berlaku sangat hemat: truk CDE sebesar Rp 15.000 per drop tambahan, dan truk CDD sebesar Rp 20.000 per drop tambahan.",
        "faq.q4": "Apakah tersedia armada truk berpendingin (Cold Chain)?",
        "faq.a4": "Ya, kami menyediakan truk berpendingin (Cold Chain) untuk pengiriman produk beku, bahan farmasi, dan hasil pangan segar dengan standar penanganan higienis dan terpercaya.",
        "faq.q5": "Bagaimana cara memantau status pengiriman kargo kami?",
        "faq.a5": "Seluruh armada dikoordinasikan secara terpusat oleh tim operasional kami, memberikan pembaruan rute secara berkala dan penyampaian bukti pengiriman digital secara transparan.",
        "faq.q6": "Bagaimana cara memesan layanan atau bermitra dengan Gagas Logistik?",
        "faq.a6": "Anda dapat langsung menghubungi kami melalui telepon di <strong>021-89453378</strong>, melihat lokasi kantor di Google Maps, atau mengirimkan detail kebutuhan kargo Anda via email ke <strong>admin@gagaslogistik.com</strong>.",

        "contact.label": "✦ Hubungi Kami",
        "contact.title": "Siap Mengirim Kargo Anda?<br><em>Hubungi Kami Sekarang</em>",
        "contact.sub": "Gagas Logistik siap melayani kebutuhan transportasi dan kargo Anda secara cepat, aman, dan terpercaya. Hubungi kami melalui telepon, kunjungi lokasi, atau kirim email.",
        "contact.maps": "Google Maps",

        "footer.brand_desc": "Solusi logistik dan manajemen kargo terpadu untuk tim yang ingin fokus pada perkembangan bisnis.",
        "footer.col_product": "Navigasi",
        "footer.col_company": "Perusahaan",
        "footer.col_support": "Bantuan",
        "footer.link_services": "Layanan Armada",
        "footer.link_pricing": "Tarif &amp; Biaya Multi-Drop",
        "footer.link_solutions": "Solusi Transportasi",
        "footer.link_halal": "Komitmen Halal SJPH",
        "footer.link_about": "Visi & Misi",
        "footer.link_faq": "FAQ",
        "footer.link_blog": "Blog",
        "footer.link_careers": "Karir",
        "footer.link_press": "Media Kit",
        "footer.link_status": "Status Layanan",
        "footer.link_help": "Pusat Bantuan",
        "footer.link_docs": "Dokumentasi",
        "footer.link_security": "Keamanan",
        "footer.link_contact": "Hubungi Kami",
        "footer.link_community": "Komunitas",
        "footer.copy": "© 2026 PT. Gagas Logistik Indonesia. Hak Cipta Dilindungi.",
        "footer.privacy": "Kebijakan Privasi",
        "footer.terms": "Ketentuan Layanan",
        "footer.cookie": "Kebijakan Cookie"
      },
      en: {
        "meta_title": "PT. Gagas Logistik Indonesia - Land Transportation & Professional Logistics Solutions",
        "nav.services": "Services",
        "nav.pricing": "Pricing",
        "nav.solutions": "Transport Solutions",
        "nav.halal": "Halal Commitment",
        "nav.about": "Vision & Mission",
        "nav.faq": "FAQ",
        "nav.contact": "Contact",
        "nav.contact_us": "Contact Us",

        "hero.badge": "Quality Management · <strong>Excellence &amp; Reliable Fleet Standards</strong>",
        "hero.title": "Land Transportation &amp; Logistics,<br><em>Excellence, Safety &amp; High Integrity.</em>",
        "hero.sub": "PT. Gagas Logistik Indonesia combines transportation execution and modern fleet management with top operational standards, precision, and reliability.",
        "hero.cta_contact": "Contact Us",
        "hero.cta_services": "View Services",
        "hero.trust_1": "Proven Operational Standards",
        "hero.trust_2": "99.8% On-Time SLA",
        "hero.db_title": "Central Operations Center",
        "hero.db_tag": "Active Operations",
        "hero.stat_1_label": "Fleet Quality Standards",
        "hero.stat_2_label": "Operational Oversight",
        "hero.stat_3_label": "Route Efficiency",
        "hero.float_badge_2_label": "Safe cargo distribution",

        "ticker.label": "Trusted cargo delivery and land transportation partner across Indonesia",

        "services.label": "Fleet Services",
        "services.title": "Fleet &amp; Logistics Services,<br><em>ready to deliver your cargo</em>",
        "services.sub": "Comprehensive and trusted logistics fleet from Gagas Logistik — serving light cargo, heavy freight, to cold chain delivery.",
        "services.card_0_title": "Light Truck",
        "services.card_0_desc": "Agile and efficient for light cargo delivery and rapid urban distribution.",
        "services.card_1_title": "Medium Truck",
        "services.card_1_desc": "Optimal payload capacity for industrial distribution, retail logistics, and intercity routes.",
        "services.card_2_title": "Heavy Cargo",
        "services.card_2_desc": "Maximum capacity for long-haul freight, wingboxes, containers, and industrial supply chains.",
        "services.card_3_title": "Cold Chain",
        "services.card_3_desc": "Specialized refrigerated fleet for frozen goods, pharmaceuticals, &amp; fresh produce.",

        "solutions.label": "Integrated Solutions",
        "solutions.title": "Land Transportation &amp;<br><em>Professional Driver Management</em>",
        "solutions.sub": "Combining precise transport execution with state-of-the-art fleet management for maximum efficiency on the road.",
        "solutions.land_title": "Land Transportation",
        "solutions.land_desc": "We combine transport execution with transport management services to meet all your needs on the road. Through our network of operations centers and fleet maintenance standards, we coordinate your shipments throughout their journey and ensure your goods are always travelling on the most efficient route. Our road transport solution provides many truck types alongside a range of value added services including air suspension vehicles, coordinated route management, and refrigerated cargo.",
        "solutions.tag_control_tower": "Operations Center",
        "solutions.tag_monitoring": "Coordinated Monitoring",
        "solutions.tag_air_susp": "Air Suspension",
        "solutions.tag_temp_ctrl": "Refrigerated Cargo",
        "solutions.tag_route_opt": "Optimized Routes",
        "solutions.tag_global_net": "Global & Domestic Network",
        "solutions.driver_title": "Driver Management",
        "solutions.driver_desc": "Managing fleet drivers effectively can save companies thousands of pounds each year. Through driver training, telematics systems and effective fuel management systems, fleets can reduce costs and mileage while maintaining the same level of service. There are many different procedures and management policies fleets can implement to help manage company drivers more effectively, from licence checks to risk assessments. Training on economic driving, mapping out the best routes and sourcing out the best local prices for fuel are just some of the ways fleets can manage fuel and their drivers to make the most out of fuel. Tracking systems are becoming increasingly popular with fleets and can improve costs and visibility when it comes to driver management and help to run a more efficient fleet.",
        "solutions.tag_driver_training": "Driver Training",
        "solutions.tag_telematics": "Telematics Systems",
        "solutions.tag_fuel_mgmt": "Fuel Management",
        "solutions.tag_eco_driving": "Economic Driving",
        "solutions.tag_licence_check": "Licence Checks",
        "solutions.tag_risk_assess": "Risk Assessments",

        "pricing.label": "Pricing &amp; Multi-Drop Rates",
        "pricing.title": "Transparent Fleet Pricing,<br><em>Save on Extra Drop Points</em>",
        "pricing.sub": "Multi-point cargo delivery (multi-drop) is now more efficient and cost-effective with Gagas Logistik. The 1st drop point is always free!",
        "pricing.promo_badge": "Multi-Drop Promo",
        "pricing.promo_text": "<strong>1st Drop is FREE!</strong> Every CDE &amp; CDD fleet delivery includes the first drop point free of charge. Additional drop points start from IDR 15,000.",
        "pricing.cde_pill": "Engkel 4 Wheels",
        "pricing.cde_title": "CDE Truck (Colt Diesel Engkel)",
        "pricing.cde_desc": "Small-to-medium truck designed for agile maneuvering through dense urban roads and narrow routes.",
        "pricing.drop1_label": "First Drop (Drop #1)",
        "pricing.drop_free": "FREE",
        "pricing.cde_next_label": "2nd drop and onwards (>1 Drop):",
        "pricing.per_drop": "/ drop point",
        "pricing.spec_wheels": "Total Wheels",
        "pricing.cde_wheels": "4 Wheels (2 Front, 2 Rear)",
        "pricing.spec_axle": "Axle Configuration",
        "pricing.cde_axle": "1 Single Axle",
        "pricing.spec_capacity": "Load Capacity",
        "pricing.cde_capacity": "1 to 2.5 Tons (up to 2 Tons)",
        "pricing.spec_use": "Cargo &amp; Usage Suitability",
        "pricing.cde_use": "Urban retail distribution, light materials, SME packages, &amp; congested routes",
        "pricing.cta_cde": "Book CDE Truck",
        "pricing.cdd_badge": "Most Popular",
        "pricing.cdd_pill": "Double 6 Wheels",
        "pricing.cdd_title": "CDD Truck (Colt Diesel Double)",
        "pricing.cdd_desc": "Medium-to-heavy truck with large volume and payload capacity for large-scale inter-region distribution.",
        "pricing.cdd_next_label": "2nd drop and onwards (>1 Drop):",
        "pricing.cdd_wheels": "6 Wheels (2 Front, 4 Rear)",
        "pricing.cdd_axle": "Dual Tires on Rear Axle",
        "pricing.cdd_capacity": "4 to 7 Tons (heavy payload 5–7 Tons)",
        "pricing.cdd_use": "Factory cargo distribution, large retail logistics, industrial goods, &amp; intercity routes",
        "pricing.cta_cdd": "Book CDD Truck",
        "pricing.diff_title": "Main Differences Between CDE and CDD Trucks",
        "pricing.diff_text": "<strong>CDE Truck (Colt Diesel Engkel)</strong> has a total of 4 wheels on a single axle with a payload capacity of approximately 1 to 2.5 tons (up to 2 tons), optimal for agile intra-city distribution. Meanwhile, <strong>CDD Truck (Colt Diesel Double)</strong> has a total of 6 wheels with dual tires on the rear axle and a significantly higher payload of 4 to 7 tons (5–7 tons), ideal for high-volume cargo and medium-to-long distance hauling.",

        "stats.s1_label": "Fleet Quality Standards",
        "stats.s1_sub": "Official integrated operational standard",
        "stats.s2_label": "Fleet Monitoring",
        "stats.s2_sub": "Integrated fleet & cargo oversight",
        "stats.s3_label": "On-Time SLA Delivery",
        "stats.s3_sub": "Proven & dependable route performance",
        "stats.s4_label": "Modern Fleet Trucks",
        "stats.s4_sub": "Air suspension & cold chain ready",

        "halal.label": "Quality Assurance & Compliance",
        "halal.title": "Halal Policy Commitment<br><em>Halal Product Assurance System (SJPH)</em>",
        "halal.sub": "Ensuring end-to-end halal integrity in accordance with Halal Product Assurance Organizing Body (BPJPH) standards.",
        "halal.pledge_text": "\"The management and all employees of PT. Gagas Logistik Indonesia are committed and responsible for ensuring consistent and sustainable compliance with the Halal Product Assurance System (SJPH) requirements by taking the following actions:\"",
        "halal.c1_title": "BPJPH Regulatory Compliance",
        "halal.c1_desc": "Comply with relevant laws and regulations and fulfill halal product certification requirements stipulated by the Halal Product Assurance Organizing Body (BPJPH).",
        "halal.c2_title": "100% Halal Cargo Guarantee",
        "halal.c2_desc": "Guarantee that all materials and products distributed are halal, free from cross-contamination, and maintained hygienically during transport.",
        "halal.c3_title": "Adequate Resource Provision",
        "halal.c3_desc": "Provide adequate resources for the preparation, implementation, and continuous improvement of the Halal Product Assurance System (SJPH).",
        "halal.c4_title": "HR Training & Halal Competence",
        "halal.c4_desc": "Develop human resources through training and/or competency enhancement in the halal field according to operational needs.",
        "halal.c5_title": "Halal Policy Socialization",
        "halal.c5_desc": "Socialize the Halal Policy to all relevant stakeholders (internal and external) to ensure all personnel safeguard halal integrity at the company.",

        "vision.label": "About Us",
        "vision.title": "Strong Foundation for Growth<br><em>Company Vision &amp; Mission</em>",
        "vision.sub": "Becoming the undisputed leading reference in the global logistics industry and the most trusted partner for your business growth.",
        "vision.quote_text": "\"Logistics forms the backbone of global trade and plays a vital role in all aspects of our everyday lives. With this in mind, our ambition is to make Gagas Logistik an undisputed world leading reference in the logistics industry. <em>By doing what we do best, we enable businesses to grow and communities to thrive.</em>\"",
        "vision.vision_badge": "Our Vision",
        "vision.vision_title": "Vision",
        "vision.v1": "To make customer trust and satisfaction our top priorities.",
        "vision.v2": "To become a successful Transporter in Indonesia.",
        "vision.v3": "To become a respected company for its customers, employees, and shareholders.",
        "vision.mission_badge": "Our Mission",
        "vision.mission_title": "Mission",
        "vision.m1": "To become the fastest growing Transporter in Indonesia with the emphasis on customer satisfaction, sustainable growth, and solid management.",
        "vision.m2": "Create value for our customers by consistently delivering exceptional end-to-end supply chain solutions that answer even their most complex and dynamic needs.",
        "vision.m3": "Building strong, long-term partnerships with our customers based on international expertise and deep local market know-how.",

        "faq.label": "FAQ",
        "faq.title": "Frequently Asked<br><em>Questions</em>",
        "faq.sub": "Can't find what you're looking for? Reach us at admin@gagaslogistik.com — we reply within 2 hours.",
        "faq.expand_all": "Expand all",
        "faq.collapse_all": "Collapse all",
        "faq.q1": "What is Gagas Logistik's assurance and SJPH compliance commitment?",
        "faq.a1": "Management and all staff are committed to consistently implementing the Product Assurance System (SJPH) under BPJPH standards, ensuring all distributed goods remain hygienic, cross-contamination free, and handled by trained personnel.",
        "faq.q2": "What are the advantages of Gagas Logistik's Land Transportation?",
        "faq.a2": "We combine transport execution with central operations management, air suspension vehicles, coordinated route oversight, and optimized routes for accelerated delivery and cost reduction.",
        "faq.q3": "How does multi-drop pricing work for CDE and CDD trucks?",
        "faq.a3": "For both CDE and CDD truck fleets, the first drop point is completely free (1 = free). If there are more than 1 drop points (>1 drop), extra drop fees are very economical: CDE truck is IDR 15,000 per additional drop, and CDD truck is IDR 20,000 per additional drop.",
        "faq.q4": "Do you provide Cold Chain refrigerated trucks?",
        "faq.a4": "Yes, we provide specialized Cold Chain refrigerated trucks for frozen goods, pharmaceuticals, and fresh produce with hygienic and reliable handling standards.",
        "faq.q5": "How can customers track their cargo shipment status?",
        "faq.a5": "Our entire fleet is coordinated centrally by our operations team, offering regular journey updates and transparent digital proof of delivery.",
        "faq.q6": "How can we book services or partner with Gagas Logistik?",
        "faq.a6": "You can reach our team directly by phone at <strong>021-89453378</strong>, check our office location on Google Maps, or send your cargo inquiry via email to <strong>admin@gagaslogistik.com</strong>.",

        "contact.label": "✦ Contact Us",
        "contact.title": "Ready to Ship Your Cargo?<br><em>Contact Us Now</em>",
        "contact.sub": "Gagas Logistik is ready to serve your transportation and cargo needs quickly, safely, and reliably. Reach us by phone, visit our location, or send an email.",
        "contact.maps": "Google Maps",

        "footer.brand_desc": "Integrated logistics and fleet management solutions enabling businesses to grow and communities to thrive.",
        "footer.col_product": "Navigation",
        "footer.col_company": "Company",
        "footer.col_support": "Support",
        "footer.link_services": "Fleet Services",
        "footer.link_pricing": "Multi-Drop Pricing",
        "footer.link_solutions": "Transport Solutions",
        "footer.link_halal": "Halal SJPH Commitment",
        "footer.link_about": "Vision & Mission",
        "footer.link_faq": "FAQ",
        "footer.link_blog": "Blog",
        "footer.link_careers": "Careers",
        "footer.link_press": "Press Kit",
        "footer.link_status": "Service Status",
        "footer.link_help": "Help Center",
        "footer.link_docs": "Documentation",
        "footer.link_security": "Security",
        "footer.link_contact": "Contact Us",
        "footer.link_community": "Community",
        "footer.copy": "© 2026 PT. Gagas Logistik Indonesia. All Rights Reserved.",
        "footer.privacy": "Privacy Policy",
        "footer.terms": "Terms of Service",
        "footer.cookie": "Cookie Policy"
      }
    };

    let currentLang = localStorage.getItem('gagas_lang') || 'id';

    function applyLanguage(lang) {
      currentLang = lang;
      document.documentElement.lang = lang;
      const dict = translations[lang] || translations.id;

      // Update text elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) {
          if (el.tagName === 'TITLE') {
            document.title = dict[key];
          } else {
            el.textContent = dict[key];
          }
        }
      });

      // Update HTML elements
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (dict[key] !== undefined) {
          el.innerHTML = dict[key];
        }
      });

      // Update all toggle buttons
      // Requirement:
      // "ketika id di pencet, semua teks berubah menjadi english, dan icon berubah menjadi en. dan sebaliknya"
      // In ID state: button displays ID + Indonesian flag. Clicking it triggers transition to English.
      // In EN state: button displays EN + UK flag. Clicking it triggers transition to Indonesian.
      const isId = lang === 'id';
      const nextLangLabel = isId ? 'Ganti bahasa ke English (EN)' : 'Ganti bahasa ke Indonesia (ID)';
      const flagSvg = isId ? FLAG_ID_SVG : FLAG_EN_SVG;
      const displayText = isId ? 'ID' : 'EN';

      document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.setAttribute('aria-label', nextLangLabel);
        btn.setAttribute('title', nextLangLabel);
        const textEl = btn.querySelector('.lang-text');
        const flagEl = btn.querySelector('.lang-flag');
        if (textEl) textEl.textContent = displayText;
        if (flagEl) flagEl.innerHTML = flagSvg;
      });

      // Update annual pricing text if present
      if (typeof updatePricing === 'function') {
        try { updatePricing(); } catch (err) {}
      }

      // Update FAQ expand/collapse text if present
      const faqToggleText = document.getElementById('faqToggleText');
      if (faqToggleText) {
        faqToggleText.textContent = allOpen 
          ? (isId ? 'Tutup semua' : 'Collapse all')
          : (isId ? 'Buka semua' : 'Expand all');
      }

      try {
        localStorage.setItem('gagas_lang', lang);
      } catch (err) {}
    }

    function toggleLanguage() {
      const nextLang = currentLang === 'id' ? 'en' : 'id';
      applyLanguage(nextLang);
    }

    // Attach delegated click listener for 100% reliable language switching
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-toggle-btn');
      if (btn) {
        e.preventDefault();
        toggleLanguage();
      }
    });

    // Initialize with stored or default language
    applyLanguage(currentLang);

