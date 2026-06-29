from pypdf import PdfReader

reader = PdfReader("El-diputado-Nicolai-TOC.docx.pdf")
print("Printing page titles and first lines from page 42 to 55:")
for page_num in range(41, 55): # 0-based index 41 is page 42
    text = reader.pages[page_num].extract_text()
    first_lines = [line.strip() for line in text.split('\n') if line.strip()][:5]
    print(f"\n--- PAGE {page_num + 1} ---")
    for line in first_lines:
        print(f"  {line}")
