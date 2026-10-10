// ========================================
// PHOTOS
// Reads images/photos/photos.json, which scripts/build_photos.py generates.
// Two categories (tabs) x two views (horizontal strip / masonry grid).
// ========================================
const PHOTO_DIR = 'images/photos/';
const FULL_SIZE = 2000;   // keep in sync with scripts/build_photos.py
const THUMB_SIZE = 900;
const CATEGORIES = ['all', 'street', 'landscape'];
const VIEWS = ['strip', 'grid'];

let photos = [];
let visible = [];         // indexes into photos for the current category
let category = 'all';
let view = 'strip';
let currentPhoto = 0;     // position within visible

const display = document.getElementById('photos-display');
const counter = document.getElementById('photo-strip-counter');
const prevBtn = document.getElementById('photo-strip-prev');
const nextBtn = document.getElementById('photo-strip-next');

async function loadPhotos() {
    try {
        const res = await fetch(PHOTO_DIR + 'photos.json', { cache: 'no-cache' });
        photos = res.ok ? await res.json() : [];
    } catch (e) {
        photos = [];
    }

    if (!photos.length) {
        document.getElementById('photos-empty').hidden = false;
        document.querySelector('.photos-toolbar').hidden = true;
        return;
    }

    photos.forEach((photo, i) => {
        const item = document.createElement('button');
        item.className = 'photo-item';
        item.dataset.index = i;
        item.setAttribute('aria-label', photo.caption ? 'Open photo: ' + photo.caption : 'Open photo');
        item.addEventListener('click', () => openPhotoModal(visible.indexOf(i)));

        // Let the browser pick the 2000px version when a photo is shown large
        const ratio = photo.width / photo.height;
        const fullWidth = Math.round(photo.width * FULL_SIZE / THUMB_SIZE);
        const img = document.createElement('img');
        img.src = PHOTO_DIR + 'thumbs/' + photo.file;
        img.srcset = PHOTO_DIR + 'thumbs/' + photo.file + ' ' + photo.width + 'w, '
            + PHOTO_DIR + photo.file + ' ' + fullWidth + 'w';
        img.dataset.ratio = ratio.toFixed(3);
        img.alt = photo.caption || '';
        img.width = photo.width;
        img.height = photo.height;
        img.loading = 'lazy';
        img.decoding = 'async';
        item.appendChild(img);

        if (photo.caption) {
            const caption = document.createElement('span');
            caption.className = 'photo-caption';
            caption.textContent = photo.caption;
            item.appendChild(caption);
        }

        display.appendChild(item);
    });

    CATEGORIES.forEach(cat => {
        const count = photos.filter(p => inCategory(p, cat)).length;
        document.querySelector('.photos-tab[data-category="' + cat + '"] .photos-tab-count').textContent = count;
    });

    const fromHash = location.hash.slice(1);
    let savedView = null;
    try { savedView = localStorage.getItem('photos-view'); } catch (e) {}
    setView(VIEWS.includes(savedView) ? savedView : 'strip', false);
    setCategory(CATEGORIES.includes(fromHash) ? fromHash : 'all', false);
}

// "all" shows everything; photos without a category yet show under every tab
function inCategory(photo, cat) {
    return cat === 'all' || !photo.category || photo.category === cat;
}

function setCategory(cat, updateHash = true) {
    category = cat;
    visible = [];
    display.querySelectorAll('.photo-item').forEach(item => {
        const i = Number(item.dataset.index);
        const show = inCategory(photos[i], cat);
        item.hidden = !show;
        if (show) visible.push(i);
    });
    document.querySelectorAll('.photos-tab').forEach(tab => {
        const active = tab.dataset.category === cat;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active);
    });
    if (updateHash) history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
    stopGlide();
    display.scrollLeft = 0;
    updateStripControls();
}

function setView(v, save = true) {
    view = v;
    display.classList.toggle('view-strip', v === 'strip');
    display.classList.toggle('view-grid', v === 'grid');
    document.body.classList.toggle('photos-view-grid', v === 'grid');
    document.querySelectorAll('.photos-view-btn').forEach(btn => {
        const active = btn.dataset.view === v;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active);
    });

    // Strip shows photos at a fixed height, the grid at a column width
    display.querySelectorAll('.photo-item img').forEach(img => {
        img.sizes = v === 'strip'
            ? 'calc(' + img.dataset.ratio + ' * min(820px, 100vh - 25rem))'
            : '(max-width: 560px) 100vw, (max-width: 970px) 50vw, 33vw';
    });

    if (save) {
        try { localStorage.setItem('photos-view', v); } catch (e) {}
    }
    stopGlide();
    display.scrollLeft = 0;
    updateStripControls();
}

document.querySelectorAll('.photos-tab').forEach(tab => {
    tab.addEventListener('click', () => setCategory(tab.dataset.category));
});

document.querySelectorAll('.photos-view-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
});

// ========================================
// STRIP CONTROLS
// ========================================
function visibleItems() {
    return [...display.querySelectorAll('.photo-item:not([hidden])')];
}

// Position (within visible) of the photo nearest the strip's left edge
function stripIndex() {
    const items = visibleItems();
    const left = display.getBoundingClientRect().left + parseFloat(getComputedStyle(display).scrollPaddingLeft || 0);
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
        const dist = Math.abs(item.getBoundingClientRect().left - left);
        if (dist < bestDist) {
            bestDist = dist;
            best = i;
        }
    });
    return best;
}

function updateStripControls() {
    if (view !== 'strip' || !visible.length) return;
    const atEnd = display.scrollLeft + display.clientWidth >= display.scrollWidth - 2;
    const index = atEnd ? visible.length - 1 : stripIndex();
    counter.textContent = (index + 1) + ' / ' + visible.length;
    prevBtn.disabled = display.scrollLeft <= 2;
    nextBtn.disabled = atEnd;
}

// Wheel over the strip + mouse drag (shared with Experience, see script.js).
// Wheeling anywhere else scrolls the page normally, so On Rotation stays reachable.
const scroller = initSmoothScroller(display, {
    enabled: () => view === 'strip' && !document.getElementById('photoModal').classList.contains('active')
});

function stopGlide() {
    scroller.stop();
}

function scrollStripTo(i) {
    const items = visibleItems();
    const item = items[Math.max(0, Math.min(i, items.length - 1))];
    if (!item) return;
    if (view === 'strip') {
        const inset = parseFloat(getComputedStyle(display).scrollPaddingLeft || 0);
        const offset = item.getBoundingClientRect().left - display.getBoundingClientRect().left - inset;
        scroller.glideTo(display.scrollLeft + offset);
    } else {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

prevBtn.addEventListener('click', () => scrollStripTo(stripIndex() - 1));
nextBtn.addEventListener('click', () => scrollStripTo(stripIndex() + 1));
display.addEventListener('scroll', () => requestAnimationFrame(updateStripControls), { passive: true });
window.addEventListener('resize', updateStripControls);

// ========================================
// LIGHTBOX (steps through the current category only)
// ========================================
function showPhoto(pos) {
    currentPhoto = (pos + visible.length) % visible.length;
    const photo = photos[visible[currentPhoto]];
    const img = document.getElementById('photoModalImage');
    img.src = PHOTO_DIR + photo.file;
    img.alt = photo.caption || '';
    document.getElementById('photoModalCaption').textContent = photo.caption || '';
}

function openPhotoModal(pos) {
    showPhoto(pos);
    document.getElementById('photoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePhotoModal() {
    document.getElementById('photoModal').classList.remove('active');
    document.body.style.overflow = '';
    scrollStripTo(currentPhoto);
}

function stepPhoto(delta) {
    showPhoto(currentPhoto + delta);
}

document.getElementById('photoModal').addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('photo-modal-figure')) {
        closePhotoModal();
    }
});

document.addEventListener('keydown', function(e) {
    const modalOpen = document.getElementById('photoModal').classList.contains('active');
    if (modalOpen) {
        if (e.key === 'Escape') closePhotoModal();
        if (e.key === 'ArrowLeft') stepPhoto(-1);
        if (e.key === 'ArrowRight') stepPhoto(1);
        return;
    }
    // Arrow keys move the strip when nothing else has focus
    if (view !== 'strip') return;
    if (e.target !== document.body && !display.contains(e.target)) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollStripTo(stripIndex() - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollStripTo(stripIndex() + 1); }
});

loadPhotos();

// ========================================
// SIDE TABLE OF CONTENTS
// One link per .fun-block, named after its heading, so new sections show up
// automatically. Highlights the section in view; clicking glides to it.
// ========================================
function initFunToc() {
    const toc = document.getElementById('fun-toc');
    const blocks = [...document.querySelectorAll('.fun-block[id]')];
    if (!toc || blocks.length === 0) return;

    const links = blocks.map(block => {
        const link = document.createElement('a');
        link.href = '#' + block.id;
        link.textContent = block.querySelector('.fun-heading').textContent;
        link.addEventListener('click', e => {
            e.preventDefault();
            block.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        toc.appendChild(link);
        return link;
    });

    // Active = the last section whose top has passed 40% of the screen
    // (the first one counts as active until then; the last once you hit bottom)
    function updateActive() {
        const line = window.innerHeight * 0.4;
        let active = 0;
        blocks.forEach((block, i) => {
            if (block.getBoundingClientRect().top <= line) active = i;
        });
        if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
            active = blocks.length - 1;
        }
        links.forEach((link, i) => {
            link.classList.toggle('active', i === active);
            link.toggleAttribute('aria-current', i === active);
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { updateActive(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', updateActive);
    // Photos and music load in after this runs and change the page height
    new ResizeObserver(updateActive).observe(document.body);
    updateActive();
}

initFunToc();
