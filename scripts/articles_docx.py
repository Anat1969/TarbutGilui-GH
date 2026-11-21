# מפיק גרסת Word לעריכה לכל כתבה: טקסט בלבד, מימין לשמאל, גופן David. הרצה: python3 scripts/articles_docx.py
import json, re, os
from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

root = os.path.join(os.path.dirname(__file__), '..')
data = json.load(open(os.path.join(root, 'src/data/articles.json'), encoding='utf-8'))
ins = json.load(open(os.path.join(root, 'src/data/instruments.json'), encoding='utf-8'))
fields = [f for f in ins['fields'] if not f['sci']]
by = [(f, sum(any(c['f'] == f['id'] for c in i['crossed']) for i in ins['instruments']), sum(any(c['f'] == f['id'] for c in i['ideas']) for i in ins['instruments'])) for f in fields]
most = sorted(by, key=lambda x: -x[1])[0]
wait = sorted(by, key=lambda x: (x[1], -x[2]))[0]
V = {'n': str(len(ins['instruments'])), 'most': most[0]['he'], 'mostDone': str(most[1]), 'waitDone': 'אחד' if wait[1] == 1 else str(wait[1]), 'waitIdea': str(wait[2])}
fill = lambda s: re.sub(r'\{(\w+)\}', lambda m: V.get(m.group(1), m.group(0)), s)

def para(doc, text, size=12, bold=False, space=6):
    p = doc.add_paragraph()
    pPr = p._p.get_or_add_pPr()
    pPr.append(OxmlElement('w:bidi'))
    jc = OxmlElement('w:jc'); jc.set(qn('w:val'), 'start'); pPr.append(jc)
    p.paragraph_format.space_after = Pt(space)
    for part in re.split(r'(\*\*[^*]+\*\*)', fill(text)):
        if not part: continue
        b = part.startswith('**')
        r = p.add_run(part[2:-2] if b else part)
        r.bold = bold or b
        r.font.size = Pt(size); r.font.name = 'David'
        rPr = r._r.get_or_add_rPr()
        rf = rPr.find(qn('w:rFonts'))
        rf.set(qn('w:cs'), 'David'); rf.set(qn('w:hAnsi'), 'David')
        rPr.append(OxmlElement('w:rtl'))
        sz = OxmlElement('w:szCs'); sz.set(qn('w:val'), str(size * 2)); rPr.append(sz)
        if r.bold: rPr.append(OxmlElement('w:bCs'))
    return p

out = os.path.join(root, 'public/articles'); os.makedirs(out, exist_ok=True)
for a in data['articles']:
    d = Document()
    para(d, a['verb'], 10)
    para(d, f"{a['t1']} {a['t2']}", 28, True, 10)
    para(d, a['dek'], 14, space=10)
    para(d, "אד' ענת דוד שטיבלמן", 10, space=18)
    for k, c in enumerate(a['chapters']):
        para(d, f"{k + 1:02d}  {c['h']}", 18, True, 8)
        for s in c['body']: para(d, s)
        para(d, c['insight'], 14, True, 18)
    para(d, '04  מה זה אומר לתכנון', 18, True, 8)
    for s in a['plan']['body']: para(d, s)
    for k, s in enumerate(a['plan']['steps']): para(d, f'{k + 1}. {s}')
    para(d, '', space=10)
    para(d, a['ask'], 18, True, 12)
    for h in a['haiku']: para(d, h, 13, space=2)
    para(d, '', space=10)
    if a.get('img'): para(d, f"תמונת השער (ב-PDF): {a['img']['cap']}. {a['img']['credit']}.", 9)
    para(d, 'השנים, השמות והמספרים נכתבו מידע כללי, וטרם צוטטו ממקור. פרסי נובל אומתו מול נתוני קרן נובל.', 9)
    d.save(os.path.join(out, a['id'] + '.docx'))
    print(a['id'] + '.docx')
