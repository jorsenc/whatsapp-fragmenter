from pypdf import PdfReader

reader = PdfReader("El-diputado-Nicolai-TOC.docx.pdf")

def print_page_details(pages_list):
    for p in pages_list:
        text = reader.pages[p-1].extract_text()
        print(f"\n================ PAGE {p} ================")
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        print("FIRST 5 LINES:")
        for l in lines[:5]:
            print(f"  {l}")
        print("LAST 5 LINES:")
        for l in lines[-5:]:
            print(f"  {l}")

print("Checking around first shift (pages 126 to 129):")
print_page_details([126, 127, 128, 129])

print("\nChecking around second shift (pages 167 to 171):")
print_page_details([167, 168, 169, 170])

print("\nChecking around third shift (pages 175 to 178):")
print_page_details([175, 176, 177, 178])
