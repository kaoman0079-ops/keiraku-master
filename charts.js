// 体表チャート（ラフ図）: 全身の模式図に経穴の位置を点で示す。
// 座標は「大体この辺」を示す目安であり、精密な解剖図ではない。
// points_map.csv の x,y は 0-1000（x: 正中=500、y: 頭頂=0〜足先=1000）。

function _limb(x1, y1, x2, y2, x3, y3, w) {
    return `<polyline points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="none" stroke="#D7E5F4" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function bodySilhouette(view) {
    const mir = (x) => 200 - x;
    let s = '';
    // 脚
    s += _limb(88, 196, 93, 284, 96, 372, 16);
    s += _limb(mir(88), 196, mir(93), 284, mir(96), 372, 16);
    // 足
    s += `<ellipse cx="98" cy="388" rx="11" ry="5" fill="#D7E5F4"/><ellipse cx="${mir(98)}" cy="388" rx="11" ry="5" fill="#D7E5F4"/>`;
    // 腕
    s += _limb(76, 68, 54, 132, 50, 188, 13);
    s += _limb(mir(76), 68, mir(54), 132, mir(50), 188, 13);
    // 手
    s += `<ellipse cx="49" cy="204" rx="5" ry="13" fill="#D7E5F4"/><ellipse cx="${mir(49)}" cy="204" rx="5" ry="13" fill="#D7E5F4"/>`;
    // 体幹
    s += `<path d="M78,64 L122,64 L116,150 L120,198 L80,198 L84,150 Z" fill="#D7E5F4"/>`;
    // 頭
    s += `<ellipse cx="100" cy="27" rx="15" ry="22" fill="#D7E5F4"/>`;
    if (view === 'back') {
        // 背面の目安: 脊柱のラインと臀溝
        s += `<line x1="100" y1="56" x2="100" y2="198" stroke="#A9C6E8" stroke-width="1.6" stroke-dasharray="4 3"/>`;
        s += `<path d="M82,200 Q100,206 118,200" fill="none" stroke="#A9C6E8" stroke-width="1.6"/>`;
    } else {
        // 前面の目安: 臍
        s += `<circle cx="100" cy="170" r="1.8" fill="#A9C6E8"/>`;
    }
    return s;
}

function chartSVG(view, meridianPts, selectedId) {
    const toXY = (p) => [p.x / 5, p.y / 2.5];
    let dots = '';
    // 同じ経絡の流れ（同ビュー内の点を順につなぐ）
    const pts = meridianPts.filter(p => p.view === view);
    if (pts.length > 1) {
        const line = pts.map(p => toXY(p).join(',')).join(' ');
        dots += `<polyline points="${line}" fill="none" stroke="#5B9BD5" stroke-width="1.2" opacity="0.35"/>`;
    }
    for (const p of pts) {
        const [cx, cy] = toXY(p);
        if (p.ID === selectedId) continue;
        dots += `<circle cx="${cx}" cy="${cy}" r="2.2" fill="#5B9BD5" opacity="0.75"/>`;
    }
    const sel = meridianPts.find(p => p.ID === selectedId && p.view === view);
    let selSvg = '';
    if (sel) {
        const [cx, cy] = toXY(sel);
        const anchorEnd = cx > 130;
        selSvg = `<circle cx="${cx}" cy="${cy}" r="5.5" fill="#FF5722" stroke="#FFF" stroke-width="1.6"/>` +
            `<text x="${anchorEnd ? cx - 8 : cx + 8}" y="${cy + 3}" font-size="9.5" font-weight="bold" fill="#D84315" text-anchor="${anchorEnd ? 'end' : 'start'}">${sel.name}</text>`;
    }
    return `<svg viewBox="0 0 200 400" style="width:100%;height:auto;display:block" role="img" aria-label="${view === 'front' ? '前面' : '背面'}チャート">
        <rect x="0" y="0" width="200" height="400" fill="#F7FAFD" rx="10"/>
        ${bodySilhouette(view)}${dots}${selSvg}
        <text x="100" y="14" font-size="8.5" fill="#8AA5C4" text-anchor="middle">${view === 'front' ? '前面' : '背面'}</text>
    </svg>`;
}

// モーダル内の「場所の目安」欄を描画する。mapData は ID -> {view,x,y,dermatome}
function renderPointMap(item, allData, mapData) {
    const mine = mapData[item.ID];
    if (!mine) return '';
    const meridianPts = allData
        .filter(d => d.所属経絡 === item.所属経絡)
        .map(d => mapData[d.ID] ? { ...mapData[d.ID], ID: d.ID, name: d.経穴名 } : null)
        .filter(Boolean);
    const charts = `<div style="display:flex;gap:8px">${chartSVG('front', meridianPts, item.ID)}${chartSVG('back', meridianPts, item.ID)}</div>`;
    const derma = mine.dermatome ? `<div style="margin-top:8px;font-size:0.95rem"><span class="label">デルマトーム</span>${mine.dermatome} の領域が目安</div>` : '';
    const note = `<div style="font-size:0.78rem;color:#8E8E93;margin-top:4px">点は大体の位置の目安です（精密図ではありません）。線は同じ経絡の流れ、オレンジがこの経穴。</div>`;
    return charts + derma + note;
}
