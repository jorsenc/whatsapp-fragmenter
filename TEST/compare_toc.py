from pypdf import PdfReader
import re
import unicodedata

def normalize_text(text):
    text = unicodedata.normalize('NFKD', text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r'[^a-z0-9]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def smart_parse_pdf_toc(pdf_filename):
    reader = PdfReader(pdf_filename)
    
    # We will process each TOC page individually to avoid footer confusion
    entries = []
    # Pages 4, 5, 6 are indices 3, 4, 5
    for page_idx in [3, 4, 5]:
        page_text = reader.pages[page_idx].extract_text()
        # The footer is always the last line, containing just the page number of the TOC page (4, 5, or 6)
        # Let's remove the footer first. It is usually a single number at the very end of the text.
        lines = page_text.split('\n')
        if lines and re.match(r'^\s*\d+\s*$', lines[-1]):
            # Remove the last line if it is just a number (the footer)
            page_text = '\n'.join(lines[:-1])
        elif lines and re.match(r'^\s*\d+\s*$', lines[-2]) and not lines[-1].strip():
            # If the last line is empty and the second to last is the footer
            page_text = '\n'.join(lines[:-2])
            
        # Markers for headings
        heading_markers = [
            r'PRLOGO', r'PRÓLOGO',
            r'EPLOGO', r'EPÍLOGO',
            r'LIBRO\s+[A-Z\u00c0-\u00ff\s\-]+',
            r'Captulo\s+\d+', r'Capítulo\s+\d+',
            r'NOTA\s+SOBRE\s+ESTA\s+EDICIN', r'NOTA\s+SOBRE\s+ESTA\s+EDICIÓN'
        ]
        
        combined_pattern = '|'.join(f'({m})' for m in heading_markers)
        matches = list(re.finditer(combined_pattern, page_text, re.IGNORECASE))
        
        for i in range(len(matches)):
            start_pos = matches[i].start()
            end_pos = matches[i+1].start() if i+1 < len(matches) else len(page_text)
            
            chunk = page_text[start_pos:end_pos].strip()
            chunk_clean = re.sub(r'\s+', ' ', chunk)
            
            num_match = re.search(r'(\d+)\s*$', chunk_clean)
            if num_match:
                page_num = int(num_match.group(1))
                title_part = chunk_clean[:num_match.start()].strip()
                title_part = re.sub(r'[\s\.]+$', '', title_part).strip()
                # Clean up title_part (e.g. replace double spaces)
                title_part = re.sub(r'\s+', ' ', title_part)
                entries.append((title_part, page_num))
            else:
                print(f"Failed to find page number in chunk: {repr(chunk_clean)}")
                
    return entries

def compare_toc_and_actual(pdf_filename):
    entries = smart_parse_pdf_toc(pdf_filename)
    reader = PdfReader(pdf_filename)
    
    print("\n--- Map of PDF pages ---")
    actual_pages = {}
    
    # Pre-extract and normalize text for all pages to speed up lookup
    normalized_pages = []
    for page_idx, page in enumerate(reader.pages):
        normalized_pages.append(normalize_text(page.extract_text()))
        
    for title, reported_page in entries:
        norm_title = normalize_text(title)
        
        # Let's search for this title in all body pages (indices 6 to end)
        found = False
        for page_idx in range(6, len(reader.pages)):
            norm_page_text = normalized_pages[page_idx]
            
            # Simple match
            if norm_title in norm_page_text:
                actual_pages[title] = page_idx + 1
                found = True
                break
                
        # If not found, try a looser match (e.g., first 30 characters)
        if not found:
            # Let's try matching a prefix of the title
            short_norm = norm_title[:30] if len(norm_title) > 30 else norm_title
            for page_idx in range(6, len(reader.pages)):
                norm_page_text = normalized_pages[page_idx]
                if short_norm in norm_page_text:
                    actual_pages[title] = page_idx + 1
                    found = True
                    break
                    
    # Print nice comparison table
    print(f"\n{'TOC Title':<60} | {'TOC Page':<8} | {'Actual Page':<12} | {'Difference':<10}")
    print("-" * 98)
    
    mismatches = []
    for title, reported_page in entries:
        actual_page = actual_pages.get(title, None)
        if actual_page is not None:
            diff = actual_page - reported_page
            diff_str = f"{diff:+d}" if diff != 0 else "0"
            if diff != 0:
                mismatches.append((title, reported_page, actual_page, diff))
            print(f"{title[:60]:<60} | {reported_page:<8} | {actual_page:<12} | {diff_str:<10}")
        else:
            print(f"{title[:60]:<60} | {reported_page:<8} | {'NOT FOUND':<12} | {'-':<10}")
            
    print(f"\nSummary: Total entries: {len(entries)}. Mismatches found: {len(mismatches)}.")
    if mismatches:
        print("\nMismatches detailed list:")
        for title, rep, act, diff in mismatches:
            print(f"  * {title}: TOC={rep}, Actual={act} (diff: {diff:+d})")

if __name__ == "__main__":
    compare_toc_and_actual("El-diputado-Nicolai-TOC.docx.pdf")
