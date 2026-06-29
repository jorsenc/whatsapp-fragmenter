from pypdf import PdfReader
import re

def smart_parse_pdf_toc(pdf_filename):
    reader = PdfReader(pdf_filename)
    toc_text = ""
    for page_num in [3, 4, 5]:
        toc_text += reader.pages[page_num].extract_text() + "\n"
    
    # We want to split the text by headings.
    # Let's find the positions of all heading starting tokens:
    # e.g., PRÓLOGO, EPÍLOGO, LIBRO, Capítulo
    # Let's use a regex to find all tokens like "Capítulo \d+", "LIBRO ...", "PRÓLOGO", "EPÍLOGO", "NOTA SOBRE..."
    heading_markers = [
        r'PRLOGO', r'PRÓLOGO',
        r'EPLOGO', r'EPÍLOGO',
        r'LIBRO\s+[A-Z\u00c0-\u00ff]+', # e.g. LIBRO PRIMERO, LIBRO SÉPTIMO
        r'Captulo\s+\d+', r'Capítulo\s+\d+',
        r'NOTA\s+SOBRE\s+ESTA\s+EDICIN', r'NOTA\s+SOBRE\s+ESTA\s+EDICIÓN'
    ]
    
    # Let's find all headings in the order they appear
    combined_pattern = '|'.join(f'({m})' for m in heading_markers)
    matches = list(re.finditer(combined_pattern, toc_text, re.IGNORECASE))
    
    entries = []
    for i in range(len(matches)):
        start_pos = matches[i].start()
        end_pos = matches[i+1].start() if i+1 < len(matches) else len(toc_text)
        
        chunk = toc_text[start_pos:end_pos].strip()
        # The chunk contains the title and then dots, and finally the page number.
        # Let's clean up linebreaks in the chunk
        chunk_clean = re.sub(r'\s+', ' ', chunk)
        
        # Now let's extract the page number, which is usually the trailing number of the chunk
        # e.g. "Capítulo 11 – Lo que dijo la prensa y lo que pensó la calle46" -> page 46
        # e.g. "Capítulo 12 – El miedo cambia de bando ......................... 49" -> page 49
        # e.g. "PRÓLOGO .................... 7" -> page 7
        num_match = re.search(r'(\d+)\s*$', chunk_clean)
        if num_match:
            page_num = int(num_match.group(1))
            # The title is everything before the page number and optional dots/spaces
            title_part = chunk_clean[:num_match.start()].strip()
            # Remove trailing dots
            title_part = re.sub(r'[\s\.]+$', '', title_part).strip()
            entries.append((title_part, page_num))
        else:
            print(f"Failed to find page number in chunk: {repr(chunk_clean)}")
            
    print(f"Smart parsed {len(entries)} entries.")
    for t, p in entries:
        print(f"  '{t}' -> page {p}")
    return entries

if __name__ == "__main__":
    smart_parse_pdf_toc("El-diputado-Nicolai-TOC.docx.pdf")
