import docx
from pypdf import PdfReader
import re
import unicodedata

def normalize_text(text):
    # Normalize unicode characters to decompose accents
    text = unicodedata.normalize('NFKD', text)
    # Remove accents and convert to lowercase
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    # Replace non-alphanumeric with spaces, and collapse multiple spaces
    text = re.sub(r'[^a-z0-9]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_pdf_toc(pdf_filename):
    print("--- Parsing PDF TOC pages ---")
    reader = PdfReader(pdf_filename)
    
    toc_text = ""
    for page_num in [3, 4, 5]:
        toc_text += reader.pages[page_num].extract_text() + "\n"
        
    lines = [line.strip() for line in toc_text.split('\n') if line.strip()]
    
    entries = []
    for line in lines:
        # Match pattern: title .... page
        # Example: "Capítulo 1 – La taberna de Cándido ......................... 12"
        # We can find the last dot sequence
        parts = re.split(r'\.{3,}', line)
        if len(parts) >= 2:
            title = parts[0].strip()
            # The page number might have extra text after it or be part of a combined line
            # Let's extract the first integer from the second part
            page_match = re.search(r'^(\d+)', parts[1].strip())
            if page_match:
                page = int(page_match.group(1))
                entries.append((title, page))
            # Also check if there's a second entry on the same line (sometimes PyPDF merges columns)
            # e.g., "94 Capítulo 27 – Las fronteras" -> actually, let's look for "Capítulo" or "LIBRO"
            rest = parts[1].strip()
            # If the line was like "94 Capítulo 27 – Las fronteras ... 97"
            sub_matches = re.findall(r'(\d+)\s+((?:Capítulo|LIBRO|EPÍLOGO|PRÓLOGO|NOTA).*?)$', rest)
            # but wait, let's make it simpler. Let's search using a regex on the whole raw text!
            
    # Better approach: regex on the entire toc_text
    # Find all occurrences of titles followed by dots and page numbers
    # We support accents/unicode
    # e.g., (Capítulo \d+ [^\.]+?)\s*\.{3,}\s*(\d+)
    # or (LIBRO [^\.]+?)\s*\.{3,}\s*(\d+)
    # or (PRÓLOGO|EPÍLOGO|NOTA[^\.]+?)\s*\.{3,}\s*(\d+)
    # Let's match these
    pattern = r'((?:Cap[íi]tulo\s+\d+|LIBRO\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+|PR[ÓO]LOGO|EP[ÍI]LOGO|NOTA\s+SOBRE\s+ESTA\s+EDICI[ÓO]N)[^\.]+?)\s*\.{3,}\s*(\d+)'
    matches = re.findall(pattern, toc_text, re.IGNORECASE)
    
    parsed_entries = []
    for title, page in matches:
        parsed_entries.append((title.strip(), int(page)))
        
    print(f"Parsed {len(parsed_entries)} entries from TOC text.")
    return parsed_entries

def find_chapters_in_pdf(pdf_filename, toc_entries):
    reader = PdfReader(pdf_filename)
    print("\n--- Finding actual pages of chapters in PDF ---")
    
    # We will search for normalized titles on each page
    # To be extremely accurate, we can also extract paragraphs from the docx file
    # and compare paragraph contents directly.
    # But let's first map actual pages in the PDF.
    actual_pages = {}
    
    for page_idx, page in enumerate(reader.pages):
        # Skip the first 6 pages
        if page_idx < 6:
            continue
        text = page.extract_text()
        norm_page_text = normalize_text(text)
        
        for title, reported_page in toc_entries:
            norm_title = normalize_text(title)
            # If the title is "libro primero la tierra baldia", let's search it
            # If it's a chapter, we can also search for e.g. "capitulo 1 la taberna de candido"
            if norm_title in norm_page_text:
                if title not in actual_pages:
                    actual_pages[title] = page_idx + 1
            else:
                # Let's try a fallback: search for "capitulo X" if it's "capitulo X ..."
                cap_match = re.match(r'^(capitulo \d+)', norm_title)
                if cap_match:
                    cap_prefix = cap_match.group(1)
                    # Let's check if the prefix + some key words are in the text
                    # e.g., "capitulo 1"
                    # But "capitulo 1" might appear on other pages as header/footer or references.
                    # Usually, the chapter start page has the full chapter title.
                    pass
                    
    # Let's print comparison
    print("\n--- Comparison: Reported Page vs Actual Page ---")
    mismatches = 0
    matches_count = 0
    print(f"{'Title':<60} | {'Reported Page':<15} | {'Actual Page':<15} | {'Diff':<5}")
    print("-" * 105)
    for title, reported_page in toc_entries:
        actual_page = actual_pages.get(title, None)
        if actual_page is not None:
            diff = actual_page - reported_page
            if diff != 0:
                mismatches += 1
            else:
                matches_count += 1
            print(f"{title[:60]:<60} | {reported_page:<15} | {actual_page:<15} | {diff:<5}")
        else:
            # Let's do a looser match for "NOT FOUND"
            # Maybe the title has slight OCR/extraction differences
            # Let's check if we can find it by part of the title
            norm_title = normalize_text(title)
            found = False
            for page_idx, page in enumerate(reader.pages):
                if page_idx < 6:
                    continue
                norm_page_text = normalize_text(page.extract_text())
                # Match if at least 80% of words of norm_title are in norm_page_text in the same order
                # or if the first 20 characters of norm_title are in norm_page_text
                if len(norm_title) > 15 and norm_title[:20] in norm_page_text:
                    actual_page = page_idx + 1
                    actual_pages[title] = actual_page
                    diff = actual_page - reported_page
                    if diff != 0:
                        mismatches += 1
                    else:
                        matches_count += 1
                    print(f"{title[:60]:<60} | {reported_page:<15} | {actual_page:<15}*| {diff:<5}")
                    found = True
                    break
            if not found:
                print(f"{title[:60]:<60} | {reported_page:<15} | {'NOT FOUND':<15} | -")
            
    print(f"\nSummary: {matches_count} matching pages, {mismatches} mismatches.")

if __name__ == "__main__":
    entries = parse_pdf_toc("El-diputado-Nicolai-TOC.docx.pdf")
    find_chapters_in_pdf("El-diputado-Nicolai-TOC.docx.pdf", entries)
