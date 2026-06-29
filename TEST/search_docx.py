import docx

doc = docx.Document("El-diputado-Nicolai-TOC.docx")
print("Searching for 'INDICE' or 'ÍNDICE' or 'TOC' or 'PRÓLOGO' in all paragraphs:")
for idx, p in enumerate(doc.paragraphs):
    text = p.text.strip()
    if any(k in text.upper() for k in ["INDICE", "ÍNDICE", "TOC", "PRÓLOGO", "PROLOGO"]):
        print(f"[{idx}] (style: {p.style.name}): {repr(text)}")
