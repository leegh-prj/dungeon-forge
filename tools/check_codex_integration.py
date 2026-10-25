#!/usr/bin/env python3
"""Codex integration checks against source and assets, no saved data mutation."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(encoding='utf-8')
assert "'+r.key+'_'+type+'.webp'" in html, 'codex must use WebP assets'
assert "assets/codex/monsters/placeholder.svg" in html, 'missing neutral fallback'
assert 'const counts={all:entries.length' in html, 'filter counts missing'
assert 'aria-pressed=' in html, 'filter accessible state missing'
assert 'monsterFilter:focus-visible' in html, 'focus indicator missing'
assert '@media(max-width:390px){.monsterFilters' in html, 'small-screen layout missing'
assert "assets/hd/'+enemyId+'/idle-0.webp" not in html, 'old combat-frame codex path'
for key in ('water','poison','storm','fire','earth'):
    for kind in ('normal','boss'):
        path=root/'assets/codex/monsters'/f'{key}_{kind}.webp'
        assert path.is_file(), f'missing: {path}'
        with Image.open(path) as img:
            img.load()
            assert img.size==(512,512)
            assert img.mode=='RGBA'
            assert img.getchannel('A').getextrema()==(0,255)
print('PASS 10 codex assets, semantic filters and responsive fallback integration')
