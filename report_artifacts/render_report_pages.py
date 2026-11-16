from pathlib import Path
import fitz


pdf = fitz.open(r"E:\HRM\BAO_CAO_THUC_TAP_HE_THONG_HRM.pdf")
out = Path(r"E:\HRM\report_artifacts\report_preview")
out.mkdir(parents=True, exist_ok=True)
pages = [0, 1, 2, 3, 4, 10, 20, 30, 40, len(pdf) - 1]
for index in pages:
    page = pdf[index]
    pix = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
    pix.save(str(out / f"page_{index + 1:02d}.png"))
print(f"Rendered {len(pages)} of {len(pdf)} pages")
