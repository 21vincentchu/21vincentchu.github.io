// ========================================
// LISTENING STATS (Fun page)
// Reads the "stats" block of music.json (api/update_spotify.py works the numbers
// out) and draws the tiles and charts. Names come from Spotify, so everything is
// inserted with textContent, never innerHTML.
// ========================================

(function () {
    const section = document.getElementById('listening-stats');
    if (!section) return;

    const tooltip = document.getElementById('chart-tooltip');

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    const pct = share => Math.round(share * 100) + '%';

    // ---------- Tooltip: same content on hover and keyboard focus ----------
    function showTooltip(target, value, label) {
        tooltip.replaceChildren(el('strong', '', value), el('span', '', label));
        tooltip.hidden = false;
        const r = target.getBoundingClientRect();
        const t = tooltip.getBoundingClientRect();
        let left = r.left + r.width / 2 - t.width / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - t.width - 8));
        let top = r.top - t.height - 10;
        if (top < 8) top = r.bottom + 10;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideTooltip() {
        tooltip.hidden = true;
    }

    function wireMark(node, value, label) {
        node.classList.add('chart-mark');
        node.tabIndex = 0;
        node.setAttribute('aria-label', label + ': ' + value);
        node.addEventListener('pointerenter', () => showTooltip(node, value, label));
        node.addEventListener('focus', () => showTooltip(node, value, label));
        node.addEventListener('pointerleave', hideTooltip);
        node.addEventListener('blur', hideTooltip);
    }

    window.addEventListener('scroll', hideTooltip, { passive: true });

    // ---------- "Show data" table twin ----------
    function renderTable(containerId, headers, rows) {
        const table = el('table');
        const head = el('tr');
        headers.forEach(([text, num]) => head.appendChild(el('th', num ? 'num' : '', text)));
        table.appendChild(el('thead')).appendChild(head);
        const body = el('tbody');
        rows.forEach(cells => {
            const tr = el('tr');
            cells.forEach((cell, i) => tr.appendChild(el('td', headers[i][1] ? 'num' : '', String(cell))));
            body.appendChild(tr);
        });
        table.appendChild(body);
        const wrap = el('div', 'chart-data-scroll');
        wrap.appendChild(table);
        document.getElementById(containerId).replaceChildren(wrap);
    }

    // ---------- Stat tiles ----------
    function renderTiles(facts) {
        const secs = facts.avg_track_seconds;
        const tiles = [
            ['Average song length', Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'), 'across ' + facts.tracks_counted + ' top songs'],
            ['Released in the past year', pct(facts.released_last_year_share), 'of my top songs'],
            ['Explicit', pct(facts.explicit_share), 'of my top songs'],
            ['Genres', String(facts.distinct_genres), 'across my top ' + facts.artists_counted + ' artists'],
        ];
        document.getElementById('stat-tiles').replaceChildren(...tiles.map(([label, value, detail]) => {
            const tile = el('div', 'stat-tile');
            tile.append(el('p', 'stat-label', label), el('p', 'stat-value', value), el('p', 'stat-detail', detail));
            return tile;
        }));
    }

    // ---------- Top genres: horizontal bars ----------
    function renderGenres(genres, artistCount) {
        document.getElementById('genres-sub').textContent =
            'How many of my top ' + artistCount + ' artists (last 6 months) Spotify files under each genre';
        const max = Math.max(...genres.map(g => g.artists));
        const rows = genres.map(g => {
            const row = el('div', 'hbar-row');
            const track = el('div', 'hbar-track');
            const bar = el('div', 'hbar');
            bar.style.width = (g.artists / max * 85) + '%';
            track.append(bar, el('span', 'hbar-value', String(g.artists)));
            row.append(el('span', 'hbar-label', g.genre), track);
            wireMark(row, g.artists + ' of ' + artistCount + ' artists', g.genre);
            return row;
        });
        document.getElementById('chart-genres').replaceChildren(...rows);
        renderTable('table-genres', [['Genre'], ['Artists', true]], genres.map(g => [g.genre, g.artists]));
    }

    // ---------- Popularity: dot strip, stacked so dots don't overlap ----------
    const SVG = 'http://www.w3.org/2000/svg';

    function svg(tag, attrs) {
        const node = document.createElementNS(SVG, tag);
        Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
        return node;
    }

    function renderPopularity(artists, median) {
        const box = document.getElementById('chart-popularity');
        const width = Math.max(260, box.clientWidth);
        const pad = { left: 8, right: 8, top: 22 };
        const r = 5;
        const lane = 2 * r + 3;
        const x = p => pad.left + (p / 100) * (width - pad.left - pad.right);

        // Greedy stacking: each dot takes the lowest lane with room at its x
        const lanes = [];
        const placed = artists.map(a => {
            const cx = x(a.popularity);
            let i = 0;
            while (lanes[i] !== undefined && cx - lanes[i] < 2 * r + 2) i++;
            lanes[i] = cx;
            return { ...a, cx, lane: i };
        });
        const laneCount = Math.max(1, lanes.length);
        const baseline = pad.top + laneCount * lane + 4;
        const height = baseline + 34;

        const root = svg('svg', { class: 'strip-svg', width, height, viewBox: `0 0 ${width} ${height}`, role: 'img',
            'aria-label': 'Artists by Spotify popularity score, median ' + median });

        [0, 25, 50, 75, 100].forEach(t => {
            root.appendChild(svg('line', { class: 'grid-line', x1: x(t), x2: x(t), y1: pad.top - 6, y2: baseline }));
            const label = svg('text', { x: x(t), y: baseline + 16, 'text-anchor': t === 0 ? 'start' : t === 100 ? 'end' : 'middle' });
            label.textContent = t;
            root.appendChild(label);
        });
        root.appendChild(svg('line', { class: 'axis-line', x1: pad.left, x2: width - pad.right, y1: baseline, y2: baseline }));

        const ends = [['Underground', pad.left, 'start'], ['Mainstream', width - pad.right, 'end']];
        ends.forEach(([text, ex, anchor]) => {
            const t = svg('text', { x: ex, y: baseline + 31, 'text-anchor': anchor });
            t.textContent = text;
            root.appendChild(t);
        });

        root.appendChild(svg('line', { class: 'median-line', x1: x(median), x2: x(median), y1: pad.top - 12, y2: baseline }));
        const medianLabel = svg('text', { class: 'median-label', x: x(median) + 5, y: pad.top - 4 });
        medianLabel.textContent = 'Median ' + median;
        root.appendChild(medianLabel);

        placed.forEach(a => {
            const cy = baseline - 4 - r - a.lane * lane;
            const g = svg('g');
            g.append(svg('circle', { class: 'hit', cx: a.cx, cy, r: 12 }), svg('circle', { class: 'dot', cx: a.cx, cy, r }));
            wireMark(g, 'Popularity ' + a.popularity, a.name);
            root.appendChild(g);
        });

        box.replaceChildren(root);
    }

    // ---------- Release years: grouped into ranges, columns ----------
    function yearBuckets(releaseYears) {
        const latest = Math.max(...releaseYears.map(y => y.year));
        const buckets = [
            ['Before ' + (latest - 11), y => y < latest - 11],
            [(latest - 11) + '–' + String(latest - 6).slice(2), y => y >= latest - 11 && y <= latest - 6],
            [(latest - 5) + '–' + String(latest - 3).slice(2), y => y >= latest - 5 && y <= latest - 3],
            [String(latest - 2), y => y === latest - 2],
            [String(latest - 1), y => y === latest - 1],
            [String(latest), y => y === latest],
        ];
        return buckets.map(([label, test]) => ({
            label,
            tracks: releaseYears.filter(y => test(y.year)).reduce((sum, y) => sum + y.tracks, 0),
        }));
    }

    function renderYears(releaseYears, trackCount) {
        document.getElementById('years-sub').textContent = 'Release year of my top ' + trackCount + ' songs';
        const buckets = yearBuckets(releaseYears);
        const max = Math.max(...buckets.map(b => b.tracks));
        const chart = el('div', 'vbar-chart');
        const labels = el('div', 'vbar-labels');
        buckets.forEach(b => {
            const slot = el('div', 'vbar-slot');
            const bar = el('div', 'vbar');
            bar.style.height = (b.tracks / max * 82) + '%';
            slot.append(el('span', 'vbar-value', String(b.tracks)), bar);
            wireMark(slot, b.tracks + (b.tracks === 1 ? ' song' : ' songs'), b.label);
            chart.appendChild(slot);
            labels.appendChild(el('span', '', b.label));
        });
        document.getElementById('chart-years').replaceChildren(chart, labels);
        renderTable('table-years', [['Released'], ['Songs', true]], buckets.map(b => [b.label, b.tracks]));
    }

    // ---------- Climbing / fading ----------
    function renderMovers(rising, fading) {
        function column(title, icon, cls, items, describe) {
            const col = el('div');
            const h = el('h4');
            const i = el('i', 'fas ' + icon + ' ' + cls);
            i.setAttribute('aria-hidden', 'true');
            h.append(i, document.createTextNode(title));
            const list = el('ol');
            items.forEach(a => {
                const li = el('li');
                li.append(el('span', 'mover-name', a.name), el('span', 'mover-detail', describe(a)));
                list.appendChild(li);
            });
            if (!items.length) list.appendChild(el('li', 'mover-detail', 'Nothing big this month'));
            col.append(h, list);
            return col;
        }
        document.getElementById('chart-movers').replaceChildren(
            column('Climbing', 'fa-arrow-up', 'mover-up', rising.slice(0, 5), a =>
                a.before ? '#' + a.before + ' this year → #' + a.now + ' this month' : '#' + a.now + ' this month, new this year'),
            column('Fading', 'fa-arrow-down', 'mover-down', fading.slice(0, 5), a =>
                a.now ? '#' + a.before + ' this year → #' + a.now + ' this month' : '#' + a.before + ' this year, out of this month\'s top 50'),
        );
    }

    // ---------- Load ----------
    async function load() {
        let stats;
        try {
            const res = await fetch('music.json', { cache: 'no-cache' });
            stats = (await res.json()).stats;
        } catch (e) {
            console.error('Error loading listening stats:', e);
        }
        if (!stats) return;   // section stays hidden

        section.hidden = false;
        const f = stats.facts;
        document.getElementById('stats-note').textContent =
            'From my Spotify top 50s · updated ' + new Date(stats.updated + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

        renderTiles(f);
        renderGenres(stats.genres, f.artists_counted);
        renderYears(stats.release_years, f.tracks_counted);
        renderMovers(stats.rising, stats.fading);

        const pop = stats.popularity;
        renderPopularity(pop, f.median_artist_popularity);
        renderTable('table-popularity', [['Artist'], ['Popularity', true]], [...pop].reverse().map(a => [a.name, a.popularity]));

        // Redraw the dot strip when its card changes width
        let lastWidth = document.getElementById('chart-popularity').clientWidth;
        new ResizeObserver(entries => {
            const w = entries[0].contentRect.width;
            if (Math.abs(w - lastWidth) < 2) return;
            lastWidth = w;
            renderPopularity(pop, f.median_artist_popularity);
        }).observe(document.getElementById('chart-popularity'));
    }

    load();
})();
