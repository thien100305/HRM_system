from pathlib import Path
from datetime import date
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Cm, Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


ROOT = Path(r"E:\HRM")
ART = ROOT / "report_artifacts"
SHOT = ART / "screenshots"
DIAG = ART / "diagrams"
OUT = ROOT / "BAO_CAO_THUC_TAP_HE_THONG_HRM_CAP_NHAT.docx"
LOGO = ART / "template_unpacked_v1" / "word" / "media" / "image1.jpeg"

BLUE = "1F4E78"
LIGHT_BLUE = "D9EAF7"
PURPLE = "625BF6"
TEAL = "42BFB3"
GRAY = "EDEDED"
YELLOW = "FFF2CC"

# Bảng màu đơn sắc cho các sơ đồ trong báo cáo: dễ in và không gây rối mắt.
INK = "#1F2933"
TEXT = "#374151"
LINE = "#6B7280"
OUTLINE = "#374151"
FILL = "#F7F7F7"
FILL_DARK = "#E5E7EB"


def font(size=34, bold=False):
    path = Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf")
    return ImageFont.truetype(str(path), size)


def draw_arrow(draw, start, end, fill=LINE, width=5):
    draw.line([start, end], fill=fill, width=width)
    x2, y2 = end
    x1, y1 = start
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    length = 20
    for delta in (2.6, -2.6):
        p = (x2 + length * math.cos(angle + delta), y2 + length * math.sin(angle + delta))
        draw.line([end, p], fill=fill, width=width)


def rounded_box(draw, xy, title, subtitle="", fill=FILL, outline=OUTLINE):
    draw.rounded_rectangle(xy, radius=18, fill=fill, outline=outline, width=3)
    x1, y1, x2, y2 = xy
    draw.text(((x1 + x2) / 2, y1 + 26), title, font=font(30, True), fill=INK, anchor="ma")
    if subtitle:
        lines = subtitle.split("\n")
        y = y1 + 78
        for line in lines:
            draw.text(((x1 + x2) / 2, y), line, font=font(22), fill=TEXT, anchor="ma")
            y += 34


def make_diagrams():
    DIAG.mkdir(parents=True, exist_ok=True)

    img = Image.new("RGB", (1600, 900), "white")
    d = ImageDraw.Draw(img)
    d.text((800, 45), "KIẾN TRÚC TỔNG THỂ HỆ THỐNG HRM", font=font(42, True), fill="#14213D", anchor="ma")
    rounded_box(d, (90, 260, 430, 620), "CLIENT", "React 19\nReact Router\nBootstrap / Axios", FILL, OUTLINE)
    rounded_box(d, (630, 200, 970, 680), "SERVER", "Spring Boot 3.5\nREST API\nSecurity + JWT\nService / JPA", FILL_DARK, OUTLINE)
    rounded_box(d, (1170, 260, 1510, 620), "DATABASE", "SQL Server\n10 bảng nghiệp vụ\nRàng buộc quan hệ", FILL, OUTLINE)
    draw_arrow(d, (430, 420), (630, 420))
    draw_arrow(d, (630, 490), (430, 490))
    draw_arrow(d, (970, 420), (1170, 420))
    draw_arrow(d, (1170, 490), (970, 490))
    d.text((530, 385), "HTTP/JSON", font=font(24, True), fill="#334E68", anchor="mm")
    d.text((1070, 385), "JPA/JDBC", font=font(24, True), fill="#334E68", anchor="mm")
    d.text((800, 800), "Mô hình phân lớp giúp tách giao diện, nghiệp vụ và dữ liệu", font=font(26), fill="#52606D", anchor="mm")
    img.save(DIAG / "architecture.png")

    img = Image.new("RGB", (1600, 1050), "white")
    d = ImageDraw.Draw(img)
    d.text((800, 35), "SƠ ĐỒ PHÂN RÃ CHỨC NĂNG", font=font(42, True), fill="#14213D", anchor="ma")
    rounded_box(d, (560, 105, 1040, 240), "HỆ THỐNG HRM", "Quản trị nguồn nhân lực", FILL_DARK, OUTLINE)
    nodes = [
        (115, 340, 535, 525, "Tổ chức", "Nhân viên · Phòng ban · Chức vụ"),
        (590, 340, 1010, 525, "Thời gian", "Chấm công · Nghỉ cả/nửa ngày"),
        (1065, 340, 1485, 525, "Thu nhập", "Tính lương · Thưởng/phạt"),
        (115, 680, 535, 865, "Công việc", "Giao việc · Theo dõi · Minh chứng"),
        (590, 680, 1010, 865, "Hệ thống", "Tài khoản · Phân quyền · Bảo mật"),
        (1065, 680, 1485, 865, "Tương tác", "Dashboard · Chat · Thông báo"),
    ]
    for x1, y1, x2, y2, t, s in nodes:
        rounded_box(d, (x1, y1, x2, y2), t, s, FILL, OUTLINE)
        start_x = 800
        start_y = 240
        end_x = (x1 + x2) // 2
        end_y = y1
        draw_arrow(d, (start_x, start_y), (end_x, end_y), LINE, 3)
    img.save(DIAG / "functional.png")

    img = Image.new("RGB", (1800, 1150), "white")
    d = ImageDraw.Draw(img)
    d.text((900, 30), "MÔ HÌNH TÁC NHÂN VÀ CA SỬ DỤNG", font=font(42, True), fill="#14213D", anchor="ma")
    actors = [
        (80, 240, 360, 900, "ADMIN", ["Tạo/quản lý tài khoản", "Quản lý tổ chức", "Quản lý chấm công", "Xem dashboard", "Duyệt nghỉ phép"]),
        (760, 240, 1040, 900, "HR", ["Quản lý nhân viên", "Chấm công", "Tính lương", "Giao việc", "Tải file minh chứng"]),
        (1440, 240, 1720, 900, "EMPLOYEE", ["Đăng nhập", "Xem chấm công", "Nghỉ cả/nửa ngày", "Xem lương", "Hoàn thành + đính kèm"]),
    ]
    for x1, y1, x2, y2, role, uses in actors:
        d.rounded_rectangle((x1, y1, x2, y2), radius=18, fill=FILL, outline=OUTLINE, width=3)
        d.ellipse((x1 + 100, y1 + 35, x1 + 180, y1 + 115), fill=OUTLINE)
        d.line((x1 + 140, y1 + 115, x1 + 140, y1 + 205), fill=INK, width=6)
        d.line((x1 + 85, y1 + 150, x1 + 195, y1 + 150), fill=INK, width=6)
        d.line((x1 + 140, y1 + 205, x1 + 95, y1 + 260), fill=INK, width=6)
        d.line((x1 + 140, y1 + 205, x1 + 185, y1 + 260), fill=INK, width=6)
        d.text(((x1+x2)//2, y1 + 300), role, font=font(30, True), fill=INK, anchor="ma")
        y = y1 + 370
        for use in uses:
            d.rounded_rectangle((x1 + 25, y, x2 - 25, y + 70), radius=14, fill=FILL_DARK, outline=LINE, width=2)
            d.text(((x1+x2)//2, y + 20), use, font=font(22), fill=TEXT, anchor="ma")
            y += 90
    d.text((900, 1030), "Quyền truy cập được kiểm soát ở cả định tuyến frontend và Spring Security backend", font=font(25), fill="#52606D", anchor="mm")
    img.save(DIAG / "usecase.png")

    img = Image.new("RGB", (1800, 1250), "white")
    d = ImageDraw.Draw(img)
    d.text((900, 25), "SƠ ĐỒ QUAN HỆ DỮ LIỆU KHÁI QUÁT", font=font(42, True), fill="#14213D", anchor="ma")
    boxes = {
        "ROLE": (90, 150, 390, 330, ["id (PK)", "name"]),
        "USER": (540, 120, 900, 380, ["id (PK)", "username", "password", "role_id (FK)", "employee_id (FK)"]),
        "EMPLOYEE": (1080, 100, 1530, 450, ["id (PK)", "employee_code", "full_name", "salary", "hire_date", "department_id (FK)", "position_id (FK)"]),
        "DEPARTMENT": (1040, 570, 1410, 800, ["id (PK)", "department_code", "name", "description"]),
        "POSITION": (1450, 570, 1760, 800, ["id (PK)", "position_code", "name"]),
        "ATTENDANCE": (60, 540, 430, 820, ["id (PK)", "attendance_date", "check_in", "check_out", "status", "employee_id (FK)"]),
        "LEAVE_REQUEST": (470, 560, 850, 850, ["id (PK)", "start_date", "end_date", "leave_session", "reason/status", "employee_id (FK)"]),
        "SALARY": (160, 940, 560, 1200, ["id (PK)", "month/year", "basic_salary", "working_days", "leave_day_units", "late_days", "total_salary"]),
        "TASK_ASSIGNMENT": (700, 930, 1160, 1210, ["id (PK)", "title", "due_date", "status/priority", "attachment_data", "employee_id (FK)"]),
        "COMPANY_MESSAGE": (1280, 930, 1740, 1190, ["id (PK)", "sender_username", "sender_name", "message_content", "sent_at"]),
    }
    # Vẽ quan hệ trước các thực thể để đường nối luôn nằm phía sau nội dung.
    relations = [
        ((390, 235), (540, 235)), ((900, 250), (1080, 250)),
        ((1260, 450), (1225, 570)), ((1370, 450), (1600, 570)),
        ((1080, 330), (430, 670)), ((1080, 350), (850, 700)),
        ((1080, 390), (450, 940)), ((1190, 450), (930, 930)),
    ]
    for a, b in relations:
        draw_arrow(d, a, b, LINE, 3)
    for title, (x1, y1, x2, y2, attrs) in boxes.items():
        d.rounded_rectangle((x1, y1, x2, y2), radius=14, fill=FILL, outline=OUTLINE, width=3)
        d.rectangle((x1, y1, x2, y1 + 58), fill=OUTLINE)
        d.text(((x1+x2)//2, y1 + 13), title, font=font(24, True), fill="white", anchor="ma")
        y = y1 + 75
        for attr in attrs:
            d.text((x1 + 22, y), attr, font=font(19), fill="#273444")
            y += 31
    img.save(DIAG / "erd.png")

    img = Image.new("RGB", (1600, 760), "white")
    d = ImageDraw.Draw(img)
    d.text((800, 30), "QUY TRÌNH XỬ LÝ ĐƠN NGHỈ PHÉP", font=font(40, True), fill="#14213D", anchor="ma")
    steps = [
        ("Nhân viên", "Tạo đơn"),
        ("Hệ thống", "Kiểm tra dữ liệu"),
        ("HR/Admin", "Xem xét"),
        ("Quyết định", "Duyệt / Từ chối"),
        ("Cập nhật", "Trạng thái & lương"),
    ]
    x = 45
    for i, (t, s) in enumerate(steps):
        rounded_box(d, (x, 250, x + 255, 470), t, s, FILL if i % 2 == 0 else FILL_DARK, OUTLINE)
        if i < len(steps) - 1:
            draw_arrow(d, (x + 255, 360), (x + 315, 360), LINE, 4)
        x += 315
    img.save(DIAG / "leave_flow.png")

    img = Image.new("RGB", (1600, 800), "white")
    d = ImageDraw.Draw(img)
    d.text((800, 28), "LUỒNG TÍNH LƯƠNG", font=font(40, True), fill="#14213D", anchor="ma")
    steps = [
        ("Dữ liệu đầu vào", "Lương cơ bản\nChấm công\nNghỉ đã duyệt"),
        ("Chuẩn hóa", "Ngày công thực tế\nNgày nghỉ hưởng lương\nSố lần đi muộn"),
        ("Tính toán", "Lương ngày × ngày trả\n+ phụ cấp + thưởng\n− phạt đi muộn"),
        ("Kết quả", "Bảng lương tháng\nTối thiểu bằng 0\nLưu SQL Server"),
    ]
    x = 75
    for i, (t, s) in enumerate(steps):
        rounded_box(d, (x, 235, x + 315, 555), t, s, FILL_DARK if i % 2 else FILL, OUTLINE)
        if i < len(steps) - 1:
            draw_arrow(d, (x + 315, 395), (x + 385, 395), LINE, 5)
        x += 385
    d.text((800, 680), "Cấu hình mặc định: 26 ngày công, thưởng chuyên cần 500.000đ, phạt đi muộn 100.000đ/ngày", font=font(24), fill="#52606D", anchor="mm")
    img.save(DIAG / "salary_flow.png")


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_text(cell, text, bold=False, color=None, size=11, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    r = p.add_run(str(text))
    r.bold = bold
    r.font.name = "Times New Roman"
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    r.font.size = Pt(size)
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_run_font(run, size=13, bold=False, italic=False, color=None):
    run.font.name = "Times New Roman"
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def add_field(paragraph, instruction):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = instruction
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "Nhấn F9 để cập nhật"
    separate.append(text)
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, end])


def configure_document(doc):
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.3)
    section.bottom_margin = Cm(2.2)
    section.left_margin = Cm(3.2)
    section.right_margin = Cm(2.0)

    normal = doc.styles["Normal"]
    normal.font.name = "Times New Roman"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    normal.font.size = Pt(13)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.line_spacing = 1.35
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.first_line_indent = Cm(1)

    for level, size in [(1, 16), (2, 14), (3, 13)]:
        style = doc.styles[f"Heading {level}"]
        style.font.name = "Times New Roman"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string("000000")
        style.paragraph_format.space_before = Pt(10)
        style.paragraph_format.space_after = Pt(6)
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.first_line_indent = Cm(0)
        if level == 1:
            style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        else:
            style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    if "Figure Caption" not in [s.name for s in doc.styles]:
        cap = doc.styles.add_style("Figure Caption", WD_STYLE_TYPE.PARAGRAPH)
    else:
        cap = doc.styles["Figure Caption"]
    cap.font.name = "Times New Roman"
    cap._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    cap.font.size = Pt(11)
    cap.font.italic = True
    cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.first_line_indent = Cm(0)
    cap.paragraph_format.space_after = Pt(8)

    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_field(footer, "PAGE")


def add_centered(doc, text, size=14, bold=False, space_after=0):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_after = Pt(space_after)
    r = p.add_run(text)
    set_run_font(r, size=size, bold=bold)
    return p


def add_body(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_run_font(r1, bold=True)
        r2 = p.add_run(text[len(bold_prefix):])
        set_run_font(r2)
    else:
        r = p.add_run(text)
        set_run_font(r)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Cm(0.8)
        p.paragraph_format.first_line_indent = Cm(0)
        r = p.add_run(item)
        set_run_font(r)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        p.paragraph_format.left_indent = Cm(0.8)
        p.paragraph_format.first_line_indent = Cm(0)
        r = p.add_run(item)
        set_run_font(r)


def add_table(doc, headers, rows, widths=None, font_size=10):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, h in enumerate(headers):
        set_cell_text(hdr.cells[i], h, bold=True, color="FFFFFF", size=font_size, align=WD_ALIGN_PARAGRAPH.CENTER)
        shade_cell(hdr.cells[i], BLUE)
        if widths:
            hdr.cells[i].width = Cm(widths[i])
    for row_idx, row in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(row):
            align = WD_ALIGN_PARAGRAPH.CENTER if i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            set_cell_text(cells[i], value, size=font_size, align=align)
            if row_idx % 2:
                shade_cell(cells[i], "F3F6F9")
            if widths:
                cells[i].width = Cm(widths[i])
    doc.add_paragraph()
    return table


def add_figure(doc, path, caption, width=6.2):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(str(path), width=Inches(width))
    cp = doc.add_paragraph(style="Figure Caption")
    cp.add_run(caption)
    return p


def add_page_break(doc):
    doc.add_page_break()


def add_cover(doc, compact=False):
    if LOGO.exists():
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.first_line_indent = Cm(0)
        p.add_run().add_picture(str(LOGO), width=Inches(2.05 if compact else 2.2))
    add_centered(doc, "BỘ GIÁO DỤC VÀ ĐÀO TẠO", 14, True)
    add_centered(doc, "TRƯỜNG ĐẠI HỌC ĐÔNG Á", 14, True)
    add_centered(doc, "KHOA CÔNG NGHỆ THÔNG TIN", 14, True)
    for _ in range(1):
        doc.add_paragraph()
    add_centered(doc, "BÁO CÁO", 24, True)
    add_centered(doc, "THỰC TẬP NGHỀ NGHIỆP", 24, True)
    add_centered(doc, "NĂM HỌC: 2025 – 2026", 16, True)
    doc.add_paragraph()
    add_centered(doc, "ĐỀ TÀI:", 14, True)
    add_centered(doc, "XÂY DỰNG HỆ THỐNG QUẢN LÝ NHÂN SỰ HRM", 18, True, 6)
    if not compact:
        doc.add_paragraph()
    details = [
        ("Đơn vị thực tập", "Trung tâm ICT"),
        ("Thời gian thực tập", "Từ 15/07/2026 đến 01/08/2026"),
        ("Lịch thực tập", "Thứ Hai, Thứ Tư và Thứ Sáu hàng tuần"),
        ("Giảng viên hướng dẫn", "ThS. Tạ Quốc Ý"),
        ("Họ và tên sinh viên", "Lê Thanh Thiên"),
        ("Lớp", "[BỔ SUNG]"),
    ]
    table = doc.add_table(rows=0, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for label, value in details:
        cells = table.add_row().cells
        set_cell_text(cells[0], label + ":", bold=True, size=13)
        set_cell_text(cells[1], value, size=13)
        if "[BỔ SUNG]" in value:
            shade_cell(cells[1], YELLOW)
    for cell in table._element.xpath(".//w:tc"):
        tc_pr = cell.get_or_add_tcPr()
        borders = OxmlElement("w:tcBorders")
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            tag = OxmlElement(f"w:{edge}")
            tag.set(qn("w:val"), "nil")
            borders.append(tag)
        tc_pr.append(borders)
    doc.add_paragraph()
    add_centered(doc, "Đà Nẵng, tháng 8 năm 2026", 13, False)


def heading(doc, text, level=1):
    return doc.add_heading(text, level=level)


def build_report():
    make_diagrams()
    doc = Document()
    configure_document(doc)

    add_cover(doc)
    add_page_break(doc)
    add_cover(doc, compact=True)
    add_page_break(doc)

    heading(doc, "MỤC LỤC", 1)
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(0)
    add_field(p, 'TOC \\o "1-3" \\h \\z \\u')
    add_page_break(doc)

    heading(doc, "DANH MỤC TỪ VIẾT TẮT", 1)
    add_table(doc, ["Từ viết tắt", "Diễn giải"], [
        ("HRM", "Human Resource Management – Quản lý nguồn nhân lực"),
        ("API", "Application Programming Interface – Giao diện lập trình ứng dụng"),
        ("REST", "Representational State Transfer"),
        ("JWT", "JSON Web Token"),
        ("JPA", "Java Persistence API"),
        ("UI/UX", "Giao diện người dùng / Trải nghiệm người dùng"),
        ("CRUD", "Create, Read, Update, Delete"),
        ("CSDL", "Cơ sở dữ liệu"),
        ("RBAC", "Role-Based Access Control – Phân quyền theo vai trò"),
    ], widths=[4, 11], font_size=11)
    add_page_break(doc)

    heading(doc, "LỜI CẢM ƠN", 1)
    for text in [
        "Thực tập nghề nghiệp là giai đoạn quan trọng giúp sinh viên chuyển hóa kiến thức trên giảng đường thành năng lực giải quyết vấn đề trong môi trường thực tế. Trong quá trình phân tích, xây dựng và hoàn thiện đề tài “Hệ thống quản lý nhân sự HRM”, tôi đã nhận được nhiều sự hướng dẫn, hỗ trợ và góp ý quý báu.",
        "Trước hết, tôi xin chân thành cảm ơn Trường Đại học Đông Á và Khoa Công nghệ Thông tin đã trang bị nền tảng kiến thức về lập trình, cơ sở dữ liệu, phân tích thiết kế hệ thống và kỹ năng làm việc nhóm. Đây là cơ sở để tôi có thể tiếp cận quy trình phát triển một ứng dụng web hoàn chỉnh.",
        "Tôi xin bày tỏ lòng biết ơn đến ThS. Tạ Quốc Ý, giảng viên hướng dẫn, đã định hướng phương pháp thực hiện, góp ý về nội dung chuyên môn và giúp tôi điều chỉnh báo cáo theo hướng khoa học, rõ ràng. Tôi cũng xin cảm ơn Trung tâm ICT đã tạo điều kiện để tôi tìm hiểu môi trường làm việc, quy trình phát triển phần mềm và yêu cầu thực tế của bài toán quản lý nhân sự.",
        "Trong phạm vi thời gian thực tập, báo cáo khó tránh khỏi những thiếu sót. Tôi kính mong nhận được góp ý của giảng viên và đơn vị thực tập để hệ thống tiếp tục được hoàn thiện và có khả năng ứng dụng tốt hơn trong thực tế.",
    ]:
        add_body(doc, text)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.first_line_indent = Cm(0)
    r = p.add_run("Sinh viên thực hiện\nLê Thanh Thiên")
    set_run_font(r, 13, True)
    add_page_break(doc)

    heading(doc, "CHƯƠNG 1: TỔNG QUAN VỀ ĐƠN VỊ THỰC TẬP", 1)
    heading(doc, "1.1. Giới thiệu đơn vị thực tập", 2)
    add_body(doc, "Trung tâm ICT là đơn vị hoạt động trong lĩnh vực công nghệ thông tin, hỗ trợ nghiên cứu, phát triển và ứng dụng các giải pháp số. Trong thời gian từ ngày 15/07/2026 đến ngày 01/08/2026, tôi tham gia thực tập tại Trung tâm vào các ngày thứ Hai, thứ Tư và thứ Sáu hàng tuần.")
    add_body(doc, "Môi trường tại Trung tâm ICT tạo điều kiện cho sinh viên tiếp cận quy trình phân tích yêu cầu, thiết kế, lập trình và kiểm thử một sản phẩm phần mềm. Quá trình thực tập tập trung vào việc xây dựng hệ thống quản lý nhân sự HRM và rèn luyện kỹ năng triển khai dự án full-stack.")
    add_table(doc, ["Thông tin", "Nội dung"], [
        ("Tên đơn vị", "Trung tâm ICT"),
        ("Thời gian", "15/07/2026 – 01/08/2026"),
        ("Lịch thực tập", "Thứ Hai, Thứ Tư và Thứ Sáu hàng tuần"),
        ("Lĩnh vực", "Công nghệ thông tin, nghiên cứu và phát triển giải pháp số"),
        ("Môi trường", "Học tập, nghiên cứu và phát triển sản phẩm theo dự án"),
        ("Công cụ tiêu biểu", "Git, hệ thống quản lý công việc, công cụ kiểm thử API"),
    ], widths=[4, 11], font_size=11)

    heading(doc, "1.2. Lĩnh vực hoạt động", 2)
    add_body(doc, "Các nhóm dịch vụ và sản phẩm chính của đơn vị gồm:")
    add_bullets(doc, [
        "Thiết kế và phát triển website, web application theo yêu cầu.",
        "Xây dựng phần mềm quản lý bán hàng, nhân sự, kho, tài chính và vận hành nội bộ.",
        "Thiết kế giao diện UI/UX và tối ưu trải nghiệm người dùng.",
        "Tư vấn chuyển đổi số, số hóa quy trình và tích hợp dữ liệu.",
        "Bảo trì, nâng cấp, kiểm thử và hỗ trợ kỹ thuật cho sản phẩm đã triển khai.",
    ])

    heading(doc, "1.3. Văn hóa và môi trường làm việc", 2)
    add_body(doc, "Môi trường làm việc tại doanh nghiệp đề cao tính chủ động, minh bạch và tinh thần phối hợp. Thành viên được khuyến khích trao đổi trực tiếp về khó khăn, đề xuất phương án cải tiến và chịu trách nhiệm đối với phần việc được giao. Các buổi chia sẻ kỹ thuật giúp kiến thức không bị giới hạn trong từng cá nhân.")
    add_body(doc, "Đối với sinh viên thực tập, môi trường này tạo cơ hội làm quen với cách tổ chức mã nguồn, quy ước đặt tên, quản lý phiên bản, phân chia công việc và phản hồi sau kiểm thử. Bên cạnh kỹ năng lập trình, thái độ đúng giờ, khả năng báo cáo tiến độ và kỹ năng tự nghiên cứu là các yếu tố được chú trọng.")

    heading(doc, "1.4. Quy trình làm việc", 2)
    add_figure(doc, DIAG / "leave_flow.png", "Hình 1.1. Minh họa tư duy xử lý một quy trình nghiệp vụ", 6.1)
    add_numbered(doc, [
        "Tiếp nhận và làm rõ yêu cầu: xác định đối tượng sử dụng, mục tiêu và phạm vi.",
        "Phân tích – thiết kế: xây dựng luồng nghiệp vụ, mô hình dữ liệu và giao diện sơ bộ.",
        "Phát triển: chia chức năng thành các hạng mục nhỏ, quản lý mã nguồn theo phiên bản.",
        "Kiểm thử: kiểm tra chức năng, dữ liệu, phân quyền và các tình huống ngoại lệ.",
        "Triển khai – bàn giao: cấu hình môi trường, hướng dẫn sử dụng và tiếp nhận phản hồi.",
        "Bảo trì: sửa lỗi, theo dõi vận hành và nâng cấp theo nhu cầu mới.",
    ])
    add_page_break(doc)

    heading(doc, "CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN ĐỀ TÀI", 1)
    heading(doc, "2.1. Đặt vấn đề", 2)
    add_body(doc, "Quản trị nhân sự là một nghiệp vụ cốt lõi của doanh nghiệp. Khi số lượng nhân viên tăng, việc quản lý bằng bảng tính rời rạc dễ phát sinh trùng lặp dữ liệu, khó kiểm soát quyền truy cập, tốn thời gian tổng hợp chấm công và có nguy cơ sai lệch khi tính lương. Các yêu cầu nghỉ phép, giao việc và trao đổi nội bộ cũng thiếu tính liên kết nếu được xử lý qua nhiều kênh riêng.")
    add_body(doc, "Đề tài xây dựng một hệ thống HRM trên nền web nhằm tập trung dữ liệu nhân viên, chuẩn hóa quy trình và hỗ trợ ba nhóm người dùng: quản trị viên, nhân sự và nhân viên. Hệ thống không chỉ thực hiện các thao tác CRUD mà còn liên kết chấm công – nghỉ phép – lương, cung cấp dashboard và kiểm soát truy cập theo vai trò.")

    heading(doc, "2.2. Lý do chọn đề tài", 2)
    add_bullets(doc, [
        "Bài toán có tính thực tiễn cao và xuất hiện ở hầu hết doanh nghiệp.",
        "Phạm vi đủ rộng để vận dụng kiến thức frontend, backend, cơ sở dữ liệu và bảo mật.",
        "Các module có mối quan hệ nghiệp vụ rõ ràng, phù hợp để rèn luyện tư duy phân tích hệ thống.",
        "Sản phẩm có khả năng mở rộng thành cổng thông tin nhân sự dùng trong môi trường thật.",
    ])

    heading(doc, "2.3. Mục tiêu và phạm vi", 2)
    add_body(doc, "Mục tiêu tổng quát là xây dựng ứng dụng web quản lý nhân sự có giao diện trực quan, API rõ ràng, dữ liệu quan hệ nhất quán và cơ chế phân quyền. Phạm vi phiên bản hiện tại bao gồm quản lý hồ sơ nhân viên, cơ cấu tổ chức, chấm công, nghỉ phép cả ngày/nửa buổi, lương, tài khoản do ADMIN tạo, giao việc kèm file minh chứng, dashboard và chat nội bộ.")
    add_table(doc, ["Nhóm", "Mục tiêu cụ thể"], [
        ("Dữ liệu", "Tập trung thông tin nhân viên và các dữ liệu phát sinh liên quan."),
        ("Nghiệp vụ", "Chuẩn hóa thao tác chấm công, nghỉ phép, tạo lương và giao việc."),
        ("Bảo mật", "Xác thực JWT, mã hóa mật khẩu và phân quyền ADMIN/HR/EMPLOYEE."),
        ("Trải nghiệm", "Giao diện nhất quán, tìm kiếm/lọc dữ liệu và phản hồi trạng thái rõ ràng."),
        ("Kiểm chứng", "Build frontend và chạy kiểm thử backend trên cơ sở dữ liệu SQL Server."),
    ], widths=[3, 12], font_size=11)

    heading(doc, "2.4. Cơ sở lý thuyết", 2)
    heading(doc, "2.4.1. Kiến trúc Client – Server và REST API", 3)
    add_body(doc, "Kiến trúc Client – Server tách phần giao diện khỏi phần xử lý nghiệp vụ. Client React gửi yêu cầu HTTP đến REST API; server Spring Boot xác thực, kiểm tra quyền, xử lý nghiệp vụ và truy xuất SQL Server thông qua JPA. Dữ liệu trao đổi chủ yếu ở dạng JSON. Cách tổ chức này hỗ trợ phát triển độc lập, dễ kiểm thử và có thể thay thế client bằng ứng dụng di động trong tương lai.")

    heading(doc, "2.4.2. Xác thực JWT và phân quyền RBAC", 3)
    add_body(doc, "Sau khi đăng nhập hợp lệ, server phát hành JSON Web Token. Client lưu token và gửi trong tiêu đề Authorization cho các yêu cầu sau. Bộ lọc JWT xác định danh tính trước khi Spring Security đối chiếu quyền của endpoint. RBAC gán quyền theo vai trò, nhờ đó ADMIN, HR và EMPLOYEE chỉ nhìn thấy chức năng phù hợp.")

    heading(doc, "2.4.3. ORM và dữ liệu quan hệ", 3)
    add_body(doc, "Spring Data JPA ánh xạ lớp thực thể Java với bảng trong SQL Server. Repository cung cấp thao tác truy vấn, trong khi Service chịu trách nhiệm kiểm tra điều kiện nghiệp vụ. Các khóa ngoại từ chấm công, nghỉ phép, lương và giao việc về nhân viên giúp duy trì tính toàn vẹn dữ liệu.")

    heading(doc, "2.5. Công nghệ sử dụng", 2)
    add_table(doc, ["Thành phần", "Công nghệ", "Vai trò"], [
        ("Frontend", "React 19.2.6", "Xây dựng giao diện theo component và quản lý trạng thái."),
        ("Điều hướng", "React Router 7.18", "Định tuyến và bảo vệ route theo vai trò."),
        ("Giao diện", "Bootstrap 5.3.8 + CSS", "Bố cục responsive, biểu mẫu và bảng dữ liệu."),
        ("Gọi API", "Axios", "Gửi yêu cầu HTTP và đính kèm JWT."),
        ("Backend", "Spring Boot 3.5.15 / Java 21", "REST API và xử lý nghiệp vụ."),
        ("Bảo mật", "Spring Security + JJWT", "Xác thực, mã hóa BCrypt và phân quyền."),
        ("Dữ liệu", "Spring Data JPA + SQL Server", "Ánh xạ, truy vấn và lưu dữ liệu."),
        ("Excel", "Apache POI 5.4.1", "Nhập dữ liệu chấm công và tạo file mẫu."),
        ("Build/Test", "Vite 8 / Maven", "Đóng gói frontend và chạy kiểm thử backend."),
    ], widths=[3, 4.5, 7.5], font_size=10)
    add_page_break(doc)

    heading(doc, "CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", 1)
    heading(doc, "3.1. Phát biểu bài toán", 2)
    add_body(doc, "Doanh nghiệp cần một hệ thống thống nhất để quản lý vòng đời thông tin nhân sự. Người quản trị chịu trách nhiệm tài khoản và cấu hình tổ chức; bộ phận nhân sự cập nhật hồ sơ, chấm công, nghỉ phép, lương và giao việc; nhân viên truy cập dữ liệu cá nhân, gửi yêu cầu và cập nhật tiến độ. Hệ thống phải ngăn truy cập trái phép và đảm bảo các phép tính lương dựa trên dữ liệu đã được xác nhận.")

    heading(doc, "3.2. Yêu cầu chức năng", 2)
    add_figure(doc, DIAG / "functional.png", "Hình 3.1. Sơ đồ phân rã chức năng hệ thống HRM", 6.25)
    add_table(doc, ["Mã", "Chức năng", "Mô tả chính", "Vai trò"], [
        ("F01", "Xác thực", "Đăng nhập tài khoản do ADMIN cấp và phát hành JWT.", "Tất cả"),
        ("F02", "Nhân viên", "Thêm, xem, sửa, xóa và tìm kiếm hồ sơ.", "ADMIN, HR"),
        ("F03", "Phòng ban/chức vụ", "Quản lý cơ cấu tổ chức.", "ADMIN, HR"),
        ("F04", "Chấm công", "ADMIN/HR tạo, sửa, nhập Excel; nhân viên xem và thống kê ngày nghỉ theo tháng.", "Theo vai trò"),
        ("F05", "Nghỉ phép", "Tạo đơn cả ngày/nửa buổi, chỉnh sửa, duyệt và từ chối.", "Theo vai trò"),
        ("F06", "Bảng lương", "Tính theo tháng, lọc theo nhân viên, phụ cấp và thưởng/phạt.", "Theo vai trò"),
        ("F07", "Tài khoản", "ADMIN tạo, sửa, xóa tài khoản và gắn vai trò/hồ sơ.", "ADMIN"),
        ("F08", "Giao việc", "HR giao nhiệm vụ; nhân viên cập nhật tiến độ và đính kèm minh chứng khi hoàn thành.", "HR, EMPLOYEE"),
        ("F09", "Dashboard/chat", "Thống kê tổng quan và trao đổi nội bộ.", "Theo quyền"),
    ], widths=[1.3, 3, 7.2, 3.5], font_size=9)

    heading(doc, "3.3. Yêu cầu phi chức năng", 2)
    add_table(doc, ["Nhóm", "Yêu cầu"], [
        ("Bảo mật", "Mật khẩu BCrypt; JWT; endpoint và route được giới hạn theo vai trò."),
        ("Hiệu năng", "Phân trang/lọc ở giao diện; truy vấn có sắp xếp; chỉ trả dữ liệu cần thiết."),
        ("Toàn vẹn", "Khóa ngoại, kiểm tra ngày bắt đầu/kết thúc và validate dữ liệu đầu vào."),
        ("Khả dụng", "Giao diện rõ ràng, thông báo lỗi/thành công, thao tác nhất quán."),
        ("Bảo trì", "Tách Controller – Service – Repository; frontend chia page, component, service."),
        ("Mở rộng", "REST API cho phép bổ sung mobile app, báo cáo và tích hợp dịch vụ khác."),
    ], widths=[3.2, 11.8], font_size=11)

    heading(doc, "3.4. Tác nhân và ca sử dụng", 2)
    add_figure(doc, DIAG / "usecase.png", "Hình 3.2. Tác nhân và nhóm ca sử dụng chính", 6.25)
    add_body(doc, "ADMIN có quyền cao nhất đối với tài khoản và dữ liệu tổ chức; mọi tài khoản đều do ADMIN cấp, không có luồng tự đăng ký. HR tập trung vào nghiệp vụ nhân sự, chấm công, tính lương và giao việc. EMPLOYEE chỉ xem dữ liệu cá nhân, gửi đơn nghỉ và cập nhật công việc. Việc kiểm soát được triển khai hai lớp: ProtectedRoute ở frontend và Spring Security ở backend.")

    heading(doc, "3.5. Kiến trúc hệ thống", 2)
    add_figure(doc, DIAG / "architecture.png", "Hình 3.3. Kiến trúc Client – Server – Database", 6.25)
    add_body(doc, "Backend tổ chức theo luồng Controller → Service → Repository. Controller tiếp nhận và ánh xạ yêu cầu HTTP; Service xử lý quy tắc nghiệp vụ, quyền sở hữu dữ liệu và transaction; Repository thao tác với SQL Server. Cấu trúc này hạn chế đưa logic vào controller, giúp mã nguồn dễ đọc và dễ kiểm thử.")

    heading(doc, "3.6. Thiết kế cơ sở dữ liệu", 2)
    add_figure(doc, DIAG / "erd.png", "Hình 3.4. Sơ đồ quan hệ dữ liệu khái quát", 6.3)
    add_table(doc, ["Bảng", "Nội dung", "Quan hệ trọng tâm"], [
        ("employees", "Hồ sơ, mã nhân viên, lương cơ bản, ngày vào làm.", "Thuộc phòng ban và chức vụ."),
        ("users / roles", "Tài khoản, mật khẩu và vai trò do ADMIN quản lý.", "Có thể liên kết một nhân viên."),
        ("attendance", "Ngày chấm công, giờ vào/ra và trạng thái.", "Nhiều bản ghi thuộc một nhân viên."),
        ("leave_requests", "Khoảng nghỉ, buổi nghỉ, lý do và trạng thái.", "Nghỉ sáng/chiều được quy đổi 0,5 ngày."),
        ("salary", "Kỳ lương, ngày công, ngày nghỉ lẻ, thưởng/phạt.", "Một nhân viên có nhiều kỳ lương."),
        ("task_assignments", "Nhiệm vụ, thời hạn, trạng thái và file minh chứng.", "Giao cho một nhân viên; file tối đa 10 MB."),
        ("company_messages", "Người gửi, nội dung và thời điểm.", "Lưu luồng trao đổi nội bộ."),
    ], widths=[3.2, 6.8, 5], font_size=10)

    heading(doc, "3.7. Thiết kế quy trình nghiệp vụ", 2)
    heading(doc, "3.7.1. Quy trình nghỉ phép", 3)
    add_figure(doc, DIAG / "leave_flow.png", "Hình 3.5. Quy trình tạo và duyệt đơn nghỉ phép", 6.1)
    add_body(doc, "Nhân viên chọn hình thức nghỉ cả ngày, nửa buổi sáng hoặc nửa buổi chiều, sau đó nhập ngày và lý do. Nghỉ nửa buổi chỉ áp dụng trong một ngày và được quy đổi thành 0,5 ngày. ADMIN/HR duyệt hoặc từ chối; số ngày đã duyệt được dùng trong thống kê chấm công và tính lương.")

    heading(doc, "3.7.2. Quy trình tính lương", 3)
    add_figure(doc, DIAG / "salary_flow.png", "Hình 3.6. Luồng tổng hợp và tính lương", 6.2)
    add_body(doc, "Công thức đang triển khai: lương ngày = lương cơ bản / 26; số ngày trả lương = min(26, ngày công + ngày nghỉ được duyệt), trong đó nửa buổi tính 0,5 ngày. Tổng lương bằng lương ngày nhân số ngày trả lương, cộng phụ cấp và thưởng chuyên cần, trừ phạt đi muộn. ADMIN/HR bấm “Tính lương” và có thể lọc kết quả theo từng nhân viên.")

    heading(doc, "3.8. Ma trận phân quyền", 2)
    add_table(doc, ["Chức năng", "ADMIN", "HR", "EMPLOYEE"], [
        ("Dashboard quản trị", "Có", "Có", "Không"),
        ("Quản lý nhân viên", "CRUD", "CRUD", "Không"),
        ("Phòng ban/chức vụ", "CRUD", "CRUD", "Không"),
        ("Chấm công", "Xem/CRUD/Import", "Xem/CRUD/Import", "Chỉ xem và thống kê cá nhân"),
        ("Nghỉ phép", "Xem/duyệt/xóa", "Xem/duyệt", "Tạo/sửa/xem"),
        ("Bảng lương", "Xem/CRUD/tính lương", "Xem/CRUD/tính lương", "Xem cá nhân"),
        ("Tài khoản", "Tạo/sửa/xóa", "Không", "Không"),
        ("Giao việc", "Không theo route hiện tại", "Tạo/CRUD/tải file", "Xem/cập nhật/đính kèm"),
        ("Chat nội bộ", "Đọc/gửi/xóa", "Đọc/gửi/xóa", "Đọc/gửi"),
    ], widths=[5.2, 3.3, 3.3, 3.3], font_size=9)
    add_page_break(doc)

    heading(doc, "CHƯƠNG 4: TRIỂN KHAI VÀ KẾT QUẢ", 1)
    heading(doc, "4.1. Tổ chức mã nguồn", 2)
    add_body(doc, "Dự án gồm hai thư mục độc lập: hrm-frontend và hrm-system. Frontend đặt các màn hình trong pages, thành phần dùng chung trong components và mã gọi API trong services. Backend chia package controller, service, repository, entity, dto, security, config và exception. Việc phân tách giúp mỗi lớp có trách nhiệm rõ ràng.")
    add_table(doc, ["Lớp/thư mục", "Trách nhiệm", "Ví dụ"], [
        ("pages", "Màn hình nghiệp vụ và trạng thái giao diện.", "Employees, Attendance, Salaries"),
        ("components", "Khung trang và thành phần tái sử dụng.", "Layout, Navbar, ProtectedRoute"),
        ("services (frontend)", "Cấu hình URL, JWT và lời gọi Axios.", "employeeService, salaryService"),
        ("controller", "Endpoint REST và mã trạng thái HTTP.", "EmployeeController"),
        ("service (backend)", "Nghiệp vụ, transaction và kiểm tra quyền.", "SalaryService"),
        ("repository/entity", "Truy vấn JPA và mô hình dữ liệu.", "AttendanceRepository, Employee"),
        ("security/config", "JWT filter, user details và SecurityFilterChain.", "JwtFilter, SecurityConfig"),
    ], widths=[4, 7, 4], font_size=10)

    heading(doc, "4.2. Giao diện đăng nhập", 2)
    add_figure(doc, SHOT / "login.png", "Hình 4.1. Màn hình đăng nhập hệ thống", 6.35)
    add_body(doc, "Trang đăng nhập sử dụng bố cục hai vùng: vùng nhận diện hệ thống và biểu mẫu xác thực. Khi đăng nhập thành công, token, tên tài khoản và vai trò được lưu tại client; người dùng được chuyển đến trang phù hợp. Thông tin xác thực sai sẽ hiển thị thông báo ngay trên biểu mẫu.")

    heading(doc, "4.3. Dashboard tổng quan", 2)
    add_figure(doc, SHOT / "dashboard.png", "Hình 4.2. Dashboard thống kê nhân sự và quỹ lương", 6.35)
    add_body(doc, "Dashboard hiển thị số lượng nhân viên, phòng ban, chức vụ, đơn nghỉ phép và biểu đồ quỹ lương theo tháng. Tại thời điểm kiểm chứng, dữ liệu gồm 17 nhân viên, 6 phòng ban, 6 chức vụ và 4 đơn nghỉ. Các nút thao tác nhanh giúp rút ngắn luồng công việc thường dùng.")

    heading(doc, "4.4. Quản lý nhân viên", 2)
    add_figure(doc, SHOT / "employees.png", "Hình 4.3. Danh sách và chức năng quản lý nhân viên", 6.35)
    add_body(doc, "Module nhân viên là trung tâm của hệ thống. Mỗi hồ sơ gồm mã nhân viên, họ tên, giới tính, ngày sinh, điện thoại, email, địa chỉ, phòng ban, chức vụ, lương cơ bản, ngày vào làm và trạng thái. ADMIN/HR có thể thêm, chỉnh sửa, xóa và tra cứu.")

    heading(doc, "4.5. Quản lý phòng ban và chức vụ", 2)
    add_figure(doc, SHOT / "departments.png", "Hình 4.4. Màn hình quản lý phòng ban", 6.3)
    add_figure(doc, SHOT / "positions.png", "Hình 4.5. Màn hình quản lý chức vụ", 6.3)
    add_body(doc, "Phòng ban và chức vụ được tách thành danh mục độc lập để tránh nhập dữ liệu lặp lại trong hồ sơ nhân viên. Mã danh mục hỗ trợ nhận diện, còn tên và mô tả phục vụ hiển thị. Khi xóa cần kiểm tra ràng buộc với nhân viên để tránh mất toàn vẹn tham chiếu.")

    heading(doc, "4.6. Quản lý chấm công", 2)
    add_figure(doc, SHOT / "attendance.png", "Hình 4.6. Danh sách dữ liệu chấm công", 6.35)
    add_body(doc, "Module chấm công lưu ngày làm việc, giờ vào, giờ ra và trạng thái theo nhân viên. Chỉ ADMIN/HR được thêm, sửa, xóa hoặc nhập Excel; nhân viên không thể tự chấm công, chỉ xem lịch sử của mình. Khi chọn tháng, giao diện hiển thị số ngày đã làm, số ngày đã nghỉ và số ngày nghỉ phép được duyệt.")

    heading(doc, "4.7. Quản lý nghỉ phép", 2)
    add_figure(doc, SHOT / "leave_requests.png", "Hình 4.7. Danh sách và trạng thái đơn nghỉ phép", 6.35)
    add_body(doc, "Nhân viên gửi đơn nghỉ cả ngày, nửa buổi sáng hoặc nửa buổi chiều và theo dõi trạng thái; ADMIN/HR thực hiện phê duyệt hoặc từ chối. Dữ liệu nửa buổi được lưu bằng leave_session và quy đổi 0,5 ngày để tính lương chính xác.")

    heading(doc, "4.8. Quản lý bảng lương", 2)
    add_figure(doc, SHOT / "salaries.png", "Hình 4.8. Danh sách bảng lương và bộ lọc theo nhân viên", 6.35)
    add_body(doc, "Bảng lương tổng hợp lương cơ bản, phụ cấp, ngày công, ngày nghỉ hưởng lương, số lần đi muộn, thưởng chuyên cần, tiền phạt và tổng nhận. Nhân viên chỉ xem bản ghi của mình; ADMIN/HR bấm “Tính lương” theo tháng, lọc lương của từng nhân viên và điều chỉnh phụ cấp.")

    heading(doc, "4.9. Quản lý tài khoản", 2)
    add_figure(doc, SHOT / "accounts.png", "Hình 4.9. Màn hình quản lý tài khoản", 6.25)
    add_body(doc, "Hệ thống không cho phép nhân viên tự đăng ký và không còn quy trình duyệt tài khoản. Chỉ ADMIN có thể tạo, sửa, xóa, gán vai trò và liên kết tài khoản với hồ sơ nhân viên. Backend chỉ công khai endpoint đăng nhập; toàn bộ API quản lý tài khoản yêu cầu vai trò ADMIN.")

    heading(doc, "4.10. Giao việc và file minh chứng", 2)
    add_figure(doc, SHOT / "task_assignments.png", "Hình 4.10. Danh sách giao việc và file minh chứng", 6.25)
    add_body(doc, "HR tạo nhiệm vụ, chọn nhân viên, mức ưu tiên và hạn hoàn thành. Nhân viên cập nhật tiến độ; khi chuyển sang “Hoàn thành” phải đính kèm file minh chứng tối đa 10 MB. File được lưu trong SQL Server; HR và chính nhân viên được giao có thể tải xuống.")

    heading(doc, "4.11. API tiêu biểu", 2)
    add_table(doc, ["Nhóm", "Endpoint tiêu biểu", "Ý nghĩa"], [
        ("Auth", "POST /api/auth/login", "Xác thực tài khoản do ADMIN cấp."),
        ("Employee", "GET/POST/PUT/DELETE /api/employees", "CRUD hồ sơ nhân viên."),
        ("Attendance", "GET /summary; POST /import", "Thống kê tháng và nhập Excel."),
        ("Leave", "POST /api/leave-requests", "Gửi đơn cả ngày hoặc nửa buổi."),
        ("Salary", "POST /api/salary/generate", "Tính lương theo tháng."),
        ("Task", "PATCH /{id}/status (multipart)", "Hoàn thành và gửi file minh chứng."),
        ("Dashboard", "GET /api/dashboard/salary-statistics", "Thống kê lương theo tháng."),
        ("Chat", "GET/POST /api/company-chat", "Đọc và gửi tin nội bộ."),
    ], widths=[2.5, 7, 5.5], font_size=10)

    heading(doc, "4.12. Kiểm thử và kết quả", 2)
    add_body(doc, "Hệ thống được kiểm chứng trực tiếp trên môi trường cục bộ ngày 31/07/2026. Frontend được build bằng Vite; backend chạy Maven test và kết nối thành công với SQL Server 16. Các màn hình trong báo cáo được chụp từ ứng dụng đang chạy và dữ liệu thật của cơ sở dữ liệu.")
    add_table(doc, ["Hạng mục", "Cách kiểm chứng", "Kết quả"], [
        ("Frontend", "npm run build", "Thành công; 124 module được chuyển đổi."),
        ("Backend", "mvnw.cmd test", "Thành công; Spring context khởi động."),
        ("Database", "Kết nối JDBC SQL Server", "Thành công; Hibernate validate schema."),
        ("API mapping", "Spring RequestMappingHandlerMapping", "58 mapping được ghi nhận."),
        ("Repository", "Spring Data scan", "10 repository JPA được nhận diện."),
        ("Giao diện", "Đăng nhập và duyệt các route ADMIN/HR", "10 màn hình được chụp thành công."),
    ], widths=[3, 7, 5], font_size=10)
    add_body(doc, "Qua kiểm thử, chức năng cốt lõi hoạt động ổn định trong môi trường hiện tại. URL API frontend đã được gom vào cấu hình dùng chung, mặc định kết nối backend tại cổng 8081 và có thể ghi đè bằng biến môi trường VITE_API_URL.")
    add_page_break(doc)

    heading(doc, "CHƯƠNG 5: ĐÁNH GIÁ KẾT QUẢ THỰC TẬP", 1)
    heading(doc, "5.1. Kết quả đạt được", 2)
    add_bullets(doc, [
        "Xây dựng được hệ thống web full-stack với React, Spring Boot và SQL Server.",
        "Hoàn thiện các module nghiệp vụ chính và liên kết dữ liệu giữa chấm công, nghỉ phép, lương.",
        "Triển khai xác thực JWT, mã hóa BCrypt và phân quyền ba vai trò.",
        "Hỗ trợ nhập chấm công Excel, thống kê ngày nghỉ theo tháng và tính lương theo từng nhân viên.",
        "Bổ sung nghỉ nửa buổi với hệ số 0,5 và file minh chứng khi nhân viên hoàn thành công việc.",
        "Loại bỏ tự đăng ký, duyệt tài khoản và tự chấm công; tài khoản chỉ do ADMIN cấp.",
        "Tổ chức mã nguồn theo lớp, build frontend và chạy kiểm thử backend thành công.",
        "Rèn luyện kỹ năng phân tích yêu cầu, thiết kế dữ liệu, đọc log và xử lý lỗi tích hợp.",
    ])

    heading(doc, "5.2. Hạn chế", 2)
    add_bullets(doc, [
        "Cấu hình URL API còn được ghi trực tiếp trong các service frontend, chưa gom về biến môi trường.",
        "Bộ kiểm thử tự động hiện còn ít, chủ yếu mới kiểm tra Spring context và một số nghiệp vụ Excel.",
        "Chưa có chức năng quên mật khẩu, xác minh email và quản lý phiên đăng nhập nâng cao.",
        "Dashboard chưa cho phép người dùng tự cấu hình chỉ số hoặc xuất báo cáo PDF/Excel toàn diện.",
        "Chat nội bộ đang sử dụng cơ chế truy vấn REST, chưa triển khai WebSocket thời gian thực.",
        "Chưa đóng gói bằng Docker và chưa xây dựng quy trình CI/CD cho môi trường triển khai.",
    ])

    heading(doc, "5.3. Hướng phát triển", 2)
    add_numbered(doc, [
        "Chuẩn hóa cấu hình bằng biến môi trường và bổ sung profile development, test, production.",
        "Tăng độ phủ kiểm thử cho Service, Controller và kiểm thử luồng người dùng ở frontend.",
        "Phát triển WebSocket cho chat/thông báo và cơ chế refresh token an toàn.",
        "Bổ sung quản lý hợp đồng, tài liệu nhân sự, KPI, tuyển dụng và đào tạo.",
        "Thiết kế báo cáo động, xuất Excel/PDF và dashboard theo từng phòng ban.",
        "Đóng gói Docker, triển khai CI/CD, logging tập trung và giám sát sức khỏe hệ thống.",
    ])

    heading(doc, "5.4. Bài học và cảm nghĩ", 2)
    for text in [
        "Qua đề tài, tôi nhận thấy chất lượng phần mềm không chỉ nằm ở số lượng chức năng mà còn phụ thuộc vào cách mô hình hóa nghiệp vụ, kiểm soát quyền và xử lý dữ liệu ngoại lệ. Một thay đổi nhỏ ở chấm công có thể ảnh hưởng đến bảng lương; vì vậy cần xác định rõ nguồn dữ liệu và trách nhiệm của từng lớp.",
        "Tôi cải thiện khả năng đọc tài liệu, phân rã công việc, theo dõi lỗi qua log và kiểm chứng từng tầng thay vì chỉ dựa vào giao diện. Việc hoàn thiện một sản phẩm full-stack cũng giúp tôi hiểu rõ hơn về giao tiếp giữa frontend, API và cơ sở dữ liệu.",
        "Thời gian thực tập giúp tôi rèn luyện tính chủ động, kỷ luật và khả năng báo cáo tiến độ. Đây là nền tảng quan trọng để tôi tiếp tục phát triển theo hướng kỹ sư phần mềm và tham gia hiệu quả hơn vào các dự án thực tế.",
    ]:
        add_body(doc, text)
    add_page_break(doc)

    heading(doc, "NHẬT KÝ CÔNG VIỆC HÀNG TUẦN", 1)
    add_body(doc, "Thời gian thực tập: từ ngày 15/07/2026 đến ngày 01/08/2026 tại Trung tâm ICT. Lịch thực tập cố định vào thứ Hai, thứ Tư và thứ Sáu hàng tuần.")
    weeks = [
        ("Tuần 1 (15/07 – 17/07)", "Ngày 15/07: tiếp nhận nội dung thực tập, tìm hiểu Trung tâm ICT và xác định bài toán HRM. Ngày 17/07: khảo sát nghiệp vụ, phân tích vai trò và thiết kế dữ liệu ban đầu.", "Xác định phạm vi, các nhóm người dùng và mô hình dữ liệu chính.", "Cần làm rõ mối liên hệ giữa chấm công, nghỉ phép và tính lương."),
        ("Tuần 2 (20/07 – 24/07)", "Ngày 20/07: khởi tạo backend Spring Boot và kết nối SQL Server. Ngày 22/07: xây dựng API, xác thực JWT và phân quyền. Ngày 24/07: phát triển giao diện React và tích hợp các module quản lý.", "Hoàn thành phần nền backend, cơ sở dữ liệu và các màn hình nghiệp vụ chính.", "Chú ý bảo vệ quyền truy cập ở cả giao diện và API."),
        ("Tuần 3 (27/07 – 01/08)", "Ngày 27/07: hoàn thiện chấm công, nghỉ phép và tính lương. Ngày 29/07: tích hợp, kiểm thử và sửa lỗi. Ngày 31/07: hoàn thiện giao diện, chụp minh chứng và tổng hợp báo cáo; kết thúc đợt thực tập ngày 01/08/2026.", "Hệ thống build và kiểm thử thành công; báo cáo được hoàn thiện.", "Tổng kết hạn chế, bài học kinh nghiệm và hướng mở rộng sản phẩm."),
    ]
    for idx, (title, work, result, lesson) in enumerate(weeks, 1):
        heading(doc, title, 2)
        add_table(doc, ["Nội dung", "Chi tiết"], [
            ("Công việc thực hiện", work),
            ("Kết quả", result),
            ("Khó khăn/ghi chú", lesson),
            ("Tự đánh giá", "Hoàn thành kế hoạch tuần; chủ động trao đổi và cập nhật tiến độ."),
        ], widths=[4, 11], font_size=11)
        p = doc.add_paragraph()
        p.paragraph_format.first_line_indent = Cm(0)
        r = p.add_run("Xác nhận của người hướng dẫn: ............................................................")
        set_run_font(r, 12, italic=True)
        if idx % 2 == 0 and idx != len(weeks):
            add_page_break(doc)
    add_page_break(doc)

    heading(doc, "BẢN TỰ ĐÁNH GIÁ KẾT QUẢ CỦA SINH VIÊN THỰC TẬP", 1)
    add_table(doc, ["Tiêu chí", "Tự đánh giá", "Minh chứng"], [
        ("Ý thức kỷ luật", "Tốt", "Tuân thủ tiến độ, chủ động báo cáo."),
        ("Khả năng tự học", "Tốt", "Tự nghiên cứu React, Spring Security, JPA."),
        ("Kỹ năng chuyên môn", "Khá/Tốt", "Hoàn thiện ứng dụng full-stack và dữ liệu."),
        ("Kỹ năng giải quyết vấn đề", "Tốt", "Đọc log, kiểm tra từng lớp, sửa lỗi tích hợp."),
        ("Kỹ năng làm việc nhóm", "Khá", "Trao đổi yêu cầu và tiếp nhận góp ý."),
        ("Chất lượng sản phẩm", "Tốt", "Build/test thành công, chức năng cốt lõi hoạt động."),
        ("Chất lượng báo cáo", "Tốt", "Có phân tích, thiết kế, kết quả và đánh giá."),
    ], widths=[4, 3, 8], font_size=10)
    add_body(doc, "Tự nhận xét: Tôi đã hoàn thành các mục tiêu chính của kỳ thực tập, xây dựng được sản phẩm có tính liên kết nghiệp vụ và rút ra nhiều kinh nghiệm về phát triển phần mềm. Tôi cần tiếp tục cải thiện kiểm thử tự động, triển khai thực tế và kỹ năng ước lượng công việc.")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.first_line_indent = Cm(0)
    r = p.add_run("Sinh viên ký và ghi rõ họ tên\n\n\nLê Thanh Thiên")
    set_run_font(r, 13, True)
    add_page_break(doc)

    heading(doc, "NHẬN XÉT CỦA ĐƠN VỊ THỰC TẬP", 1)
    add_table(doc, ["Nội dung đánh giá", "Nhận xét"], [
        ("Ý thức chấp hành nội quy", "\n\n"),
        ("Thái độ và tinh thần trách nhiệm", "\n\n"),
        ("Kiến thức và kỹ năng chuyên môn", "\n\n"),
        ("Khả năng phối hợp và giao tiếp", "\n\n"),
        ("Kết quả công việc được giao", "\n\n"),
        ("Đề nghị/nhận xét khác", "\n\n"),
    ], widths=[5, 10], font_size=11)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.first_line_indent = Cm(0)
    r = p.add_run("Đà Nẵng, ngày ..... tháng ..... năm 2026\nĐẠI DIỆN ĐƠN VỊ THỰC TẬP\n(Ký, ghi rõ họ tên và đóng dấu)\n\n\n\n")
    set_run_font(r, 12, True)
    add_page_break(doc)

    heading(doc, "NHẬN XÉT CỦA GIÁO VIÊN HƯỚNG DẪN THỰC TẬP", 1)
    for title in ["Nội dung và kết quả thực hiện", "Hình thức và chất lượng báo cáo", "Ý thức, thái độ trong quá trình thực tập", "Nhận xét khác"]:
        p = doc.add_paragraph()
        p.paragraph_format.first_line_indent = Cm(0)
        r = p.add_run(title + ":")
        set_run_font(r, 13, True)
        for _ in range(4):
            add_body(doc, "................................................................................................................................................")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.first_line_indent = Cm(0)
    r = p.add_run("Đà Nẵng, ngày ..... tháng ..... năm 2026\nGIẢNG VIÊN HƯỚNG DẪN\n(Ký và ghi rõ họ tên)\n\n\n")
    set_run_font(r, 12, True)
    add_page_break(doc)

    heading(doc, "PHIẾU ĐÁNH GIÁ THỰC TẬP CHO SINH VIÊN", 1)
    add_table(doc, ["STT", "Tiêu chí", "Điểm tối đa", "Điểm đánh giá"], [
        ("1", "Chấp hành nội quy và thời gian làm việc", "1,0", ""),
        ("2", "Tinh thần trách nhiệm và chủ động", "1,0", ""),
        ("3", "Khả năng tiếp thu yêu cầu", "1,0", ""),
        ("4", "Kiến thức chuyên môn", "1,5", ""),
        ("5", "Kỹ năng phân tích và giải quyết vấn đề", "1,5", ""),
        ("6", "Kỹ năng lập trình và sử dụng công cụ", "1,5", ""),
        ("7", "Kỹ năng giao tiếp, phối hợp", "1,0", ""),
        ("8", "Chất lượng và mức độ hoàn thành sản phẩm", "1,5", ""),
        ("", "TỔNG CỘNG", "10,0", ""),
    ], widths=[1.2, 8.8, 2.5, 2.5], font_size=10)
    add_body(doc, "Nhận xét chung: ....................................................................................................................................")
    add_body(doc, "........................................................................................................................................................")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.first_line_indent = Cm(0)
    r = p.add_run("Người đánh giá\n(Ký và ghi rõ họ tên)\n\n\n\n")
    set_run_font(r, 12, True)

    doc.core_properties.title = "Báo cáo thực tập nghề nghiệp - Hệ thống quản lý nhân sự HRM"
    doc.core_properties.subject = "Báo cáo dự án React, Spring Boot và SQL Server"
    doc.core_properties.author = "Lê Thanh Thiên"
    doc.core_properties.comments = "Được xây dựng dựa trên file mẫu báo cáo thực tập người dùng cung cấp."
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build_report()
