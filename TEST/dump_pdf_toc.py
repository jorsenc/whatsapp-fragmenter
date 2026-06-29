from pypdf import PdfReader

reader = PdfReader("El-diputado-Nicolai-TOC.docx.pdf")
print("--- FULL TEXT OF PAGE 4 ---")
print(reader.pages[3].extract_text())
print("--- FULL TEXT OF PAGE 5 ---")
print(reader.pages[4].extract_text())
print("--- FULL TEXT OF PAGE 6 ---")
print(reader.pages[5].extract_text())
