from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR

ROOT = Path(r"E:\HRM")
ART = ROOT / "report_artifacts"
SHOTS = ART / "screenshots"
OUT = ROOT / "BAO_CAO_THUC_TAP_HE_THONG_HRM.pptx"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
NAVY = RGBColor(12, 24, 43)
PANEL = RGBColor(22, 39, 63)
PANEL2 = RGBColor(27, 49, 75)
WHITE = RGBColor(246, 248, 251)
MUTED = RGBColor(166, 183, 204)
TEAL = RGBColor(43, 214, 185)
BLUE = RGBColor(74, 153, 255)
GOLD = RGBColor(255, 194, 92)
FONT = "Aptos"

def rect(slide, x, y, w, h, color, radius=True, line=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
                                   Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid(); shape.fill.fore_color.rgb = color
    shape.line.fill.background() if line is None else None
    if line:
        shape.line.color.rgb = line
    if radius:
        shape.adjustments[0] = 0.12
    return shape

def text(slide, value, x, y, w, h, size=16, color=WHITE, bold=False,
         align=PP_ALIGN.LEFT, valign=MSO_ANCHOR.TOP, font=FONT):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.clear(); tf.word_wrap = True
    tf.margin_left = Inches(0.02); tf.margin_right = Inches(0.02)
    tf.margin_top = Inches(0.02); tf.margin_bottom = Inches(0.02)
    tf.vertical_anchor = valign
    for i, line in enumerate(value.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line; p.alignment = align
        p.space_after = Pt(5)
        for run in p.runs:
            run.font.name = font; run.font.size = Pt(size); run.font.bold = bold
            run.font.color.rgb = color
    return box

def base(title=None, section=None):
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = NAVY
    # slim accent and footer
    rect(s, 0, 0, 0.12, 7.5, TEAL, radius=False)
    if title:
        text(s, section.upper() if section else "HRM · HỆ THỐNG QUẢN LÝ NHÂN SỰ",
             0.65, 0.36, 8, 0.28, 10, TEAL, True)
        text(s, title, 0.65, 0.78, 12, 0.65, 27, WHITE, True)
    text(s, "BÁO CÁO THỰC TẬP  ·  2025–2026", 0.68, 7.12, 7, 0.2, 9, MUTED)
    text(s, f"{len(prs.slides):02d}", 12.15, 7.08, 0.5, 0.25, 10, MUTED, align=PP_ALIGN.RIGHT)
    return s

def bullets(slide, items, x, y, w, size=16, gap=0.62, color=WHITE):
    for i, item in enumerate(items):
        yy = y + i * gap
        rect(slide, x, yy + 0.1, 0.12, 0.12, TEAL, radius=True)
        text(slide, item, x + 0.28, yy, w - 0.3, gap - 0.04, size, color)

def card(slide, x, y, w, h, heading, body, accent=TEAL, body_size=14):
    rect(slide, x, y, w, h, PANEL)
    rect(slide, x, y, 0.06, h, accent, radius=False)
    text(slide, heading, x + 0.22, y + 0.18, w - 0.42, 0.35, 16, WHITE, True)
    text(slide, body, x + 0.22, y + 0.65, w - 0.42, h - 0.78, body_size, MUTED)

def screenshot(slide, name, x, y, w, h):
    path = SHOTS / name
    slide.shapes.add_picture(str(path), Inches(x), Inches(y), width=Inches(w), height=Inches(h))

# 1 Cover
s = prs.slides.add_slide(BLANK); s.background.fill.solid(); s.background.fill.fore_color.rgb = NAVY
rect(s, 0, 0, 0.14, 7.5, TEAL, radius=False)
rect(s, 8.45, 0.65, 4.25, 6.1, PANEL, radius=True)
text(s, "ĐỒ ÁN / THỰC TẬP · 2025–2026", 0.9, 0.92, 6.8, 0.35, 12, TEAL, True)
text(s, "XÂY DỰNG\nHỆ THỐNG QUẢN LÝ\nNHÂN SỰ HRM", 0.88, 1.7, 7.5, 2.6, 33, WHITE, True)
text(s, "Quản lý nhân sự · chấm công · nghỉ phép · tiền lương", 0.92, 4.56, 7.1, 0.55, 16, MUTED)
rect(s, 0.92, 5.45, 0.72, 0.06, TEAL, radius=False)
text(s, "Sinh viên  Lê Thanh Thiên\nGV hướng dẫn  ThS. Nguyễn Quốc Vương\nĐơn vị thực tập  IZI Software", 0.92, 5.72, 7.1, 1.0, 13, WHITE)
screenshot(s, "dashboard.png", 8.72, 1.2, 3.72, 2.55)
text(s, "HRM", 8.95, 4.1, 3.2, 0.8, 46, TEAL, True, PP_ALIGN.CENTER, MSO_ANCHOR.MIDDLE)
text(s, "Từ dữ liệu nhân sự\nđến vận hành mỗi ngày", 8.95, 5.0, 3.2, 0.75, 15, WHITE, False, PP_ALIGN.CENTER)
text(s, "TRƯỜNG ĐẠI HỌC ĐÔNG Á  ·  KHOA CÔNG NGHỆ THÔNG TIN", 0.92, 7.08, 8, 0.2, 9, MUTED)

# 2 Problem and objective
s=base("Bài toán và mục tiêu", "01 · TỔNG QUAN")
card(s, .7, 1.75, 3.85, 3.95, "THỰC TRẠNG", "Thông tin nhân sự, công, phép và lương thường nằm ở nhiều quy trình riêng.\n\nTổng hợp thủ công làm chậm tra cứu, đối soát và báo cáo.", BLUE, 16)
card(s, 4.75, 1.75, 3.85, 3.95, "MỤC TIÊU", "Xây dựng một ứng dụng web tập trung dữ liệu nhân sự và hỗ trợ các nghiệp vụ thường ngày.\n\nPhân quyền theo vai trò và theo dõi trạng thái xử lý.", TEAL, 16)
card(s, 8.8, 1.75, 3.85, 3.95, "GIÁ TRỊ", "Giảm thao tác lặp khi quản lý hồ sơ, chấm công và bảng lương.\n\nGiúp nhân viên và bộ phận quản trị cùng làm việc trên một hệ thống.", GOLD, 16)
text(s, "Phạm vi triển khai: ứng dụng web nội bộ cho ADMIN, HR và EMPLOYEE", .85, 6.15, 11.8, .4, 15, MUTED, False, PP_ALIGN.CENTER)

# 3 Functional map
s=base("Các phân hệ chính", "02 · CHỨC NĂNG")
modules=[("01", "Tổ chức", "Nhân viên · phòng ban · chức vụ"), ("02", "Thời gian", "Chấm công · nhập Excel · nghỉ phép"), ("03", "Thu nhập", "Bảng lương · tạo lương theo tháng"), ("04", "Công việc", "Giao việc · cập nhật trạng thái"), ("05", "Quản trị", "Tài khoản · đăng ký · phân quyền"), ("06", "Kết nối", "Dashboard · chat nội bộ")]
for i,(n,h,b) in enumerate(modules):
    col=i%3; row=i//3
    x=.75+col*4.18; y=1.78+row*2.05
    rect(s,x,y,3.85,1.65,PANEL)
    text(s,n,x+.2,y+.18,.55,.4,15,TEAL,True)
    text(s,h,x+.9,y+.15,2.6,.4,19,WHITE,True)
    text(s,b,x+.9,y+.7,2.65,.68,13,MUTED)

# 4 People / org
s=base("Quản lý nhân sự và cơ cấu tổ chức", "02 · CHỨC NĂNG")
screenshot(s,"employees.png",.8,1.72,6.15,3.72)
text(s,"HỒ SƠ NHÂN VIÊN",7.45,1.8,4.8,.35,12,TEAL,True)
bullets(s,["Tập trung thông tin và trạng thái nhân viên","Liên kết nhân viên với phòng ban, chức vụ","Tạo mới, cập nhật và tra cứu hồ sơ","Quản lý tài khoản gắn với người dùng hệ thống"],7.45,2.3,4.95,16,.72)
text(s,"CƠ CẤU TỔ CHỨC",7.45,5.55,4.8,.32,12,BLUE,True)
text(s,"Phòng ban  →  chức vụ  →  nhân viên",7.45,5.98,4.7,.42,18,WHITE,True)

# 5 Attendance and leave
s=base("Chấm công và quy trình nghỉ phép", "02 · CHỨC NĂNG")
card(s,.8,1.75,3.75,1.55,"CHẤM CÔNG","Ghi nhận ngày công và giờ làm.",TEAL,14)
card(s,.8,3.52,3.75,1.55,"IMPORT EXCEL","Nhập dữ liệu chấm công và tải file mẫu.",BLUE,14)
card(s,.8,5.29,3.75,1.25,"NGHỈ PHÉP","Nhân viên gửi đơn; người có quyền xử lý duyệt hoặc từ chối.",GOLD,13)
text(s,"LUỒNG XỬ LÝ ĐƠN",5.1,1.8,6.5,.32,12,TEAL,True)
steps=[("01","Gửi đơn"),("02","Chờ duyệt"),("03","Duyệt / từ chối"),("04","Cập nhật trạng thái")]
for i,(n,label) in enumerate(steps):
    x=5.1+i*1.85
    rect(s,x,2.65,1.55,1.45,PANEL2)
    text(s,n,x,2.88,1.55,.32,13,TEAL,True,PP_ALIGN.CENTER)
    text(s,label,x+.08,3.35,1.39,.58,13,WHITE,True,PP_ALIGN.CENTER,MSO_ANCHOR.MIDDLE)
    if i<3:
        text(s,"→",x+1.55,3.12,.3,.4,20,MUTED,True,PP_ALIGN.CENTER)
screenshot(s,"leave_requests.png",5.15,4.55,6.6,1.8)

# 6 Payroll
s=base("Tính lương theo tháng", "02 · CHỨC NĂNG")
screenshot(s,"salaries.png",.8,1.78,6.25,3.8)
text(s,"CẤU HÌNH NGHIỆP VỤ",7.55,1.9,4.5,.32,12,TEAL,True)
card(s,7.5,2.4,4.7,1.0,"26 ngày công chuẩn","Cấu hình mặc định dùng để quy đổi ngày công.",BLUE,12)
card(s,7.5,3.62,4.7,1.0,"500.000₫ thưởng chuyên cần","Mức mặc định trong cấu hình hệ thống.",TEAL,12)
card(s,7.5,4.84,4.7,1.0,"100.000₫ phạt đi muộn/ngày","Giá trị mặc định theo cấu hình.",GOLD,12)
text(s,"Bảng lương có thể được tạo tự động theo tháng; HR có thể theo dõi và quản lý dữ liệu lương.",.9,6.15,11.4,.45,14,MUTED,False,PP_ALIGN.CENTER)

# 7 roles
s=base("Vai trò và trải nghiệm người dùng", "03 · VẬN HÀNH")
roles=[("ADMIN","Quản trị hệ thống","Tài khoản · phân quyền\nTổ chức · dashboard",TEAL),("HR","Nghiệp vụ nhân sự","Nhân viên · chấm công\nNghỉ phép · lương · công việc",BLUE),("EMPLOYEE","Tự phục vụ","Xem thông tin liên quan\nGửi đơn · cập nhật công việc",GOLD)]
for i,(r,h,b,c) in enumerate(roles):
    x=.8+i*4.18
    rect(s,x,1.9,3.75,3.85,PANEL)
    rect(s,x+.24,2.18,.12,.62,c)
    text(s,r,x+.52,2.2,2.9,.5,21,c,True)
    text(s,h,x+.28,3.0,3.1,.45,17,WHITE,True)
    text(s,b,x+.28,3.75,3.12,1.2,15,MUTED)
text(s,"Chức năng truy cập phụ thuộc vai trò; luồng thực tế được bảo vệ bằng xác thực JWT.",1,6.15,11,.42,14,MUTED,False,PP_ALIGN.CENTER)

# 8 architecture
s=base("Kiến trúc triển khai", "04 · CÔNG NGHỆ")
layers=[(.85,"FRONTEND","React 19 · React Router\nBootstrap · Axios · Vite",BLUE),(4.95,"BACKEND","Spring Boot 3.5 · REST API\nController → Service → Repository",TEAL),(9.05,"DATABASE","Microsoft SQL Server\nJPA / Hibernate",GOLD)]
for x,h,b,c in layers:
    rect(s,x,2.2,3.4,2.2,PANEL)
    rect(s,x,2.2,3.4,.1,c,radius=False)
    text(s,h,x+.22,2.58,2.95,.45,18,c,True,PP_ALIGN.CENTER)
    text(s,b,x+.25,3.22,2.9,.85,14,WHITE,False,PP_ALIGN.CENTER)
text(s,"HTTP / JSON",4.22,2.95,.68,.45,10,MUTED,True,PP_ALIGN.CENTER)
text(s,"JPA",8.34,2.95,.5,.45,10,MUTED,True,PP_ALIGN.CENTER)
text(s,"Kiến trúc phân lớp giúp tách giao diện, nghiệp vụ và truy cập dữ liệu.",1.1,5.25,11,.45,16,MUTED,False,PP_ALIGN.CENTER)
text(s,"Apache POI hỗ trợ xử lý file Excel cho nghiệp vụ chấm công.",1.1,5.92,11,.45,14,TEAL,False,PP_ALIGN.CENTER)

# 9 security & data
s=base("Xác thực, dữ liệu và bảo vệ truy cập", "04 · CÔNG NGHỆ")
security=[("Đăng nhập","Backend xác thực thông tin và cấp JWT."),("Mật khẩu","Lưu dạng BCrypt hash."),("Token","Frontend gửi JWT để gọi API được bảo vệ."),("Phân quyền","Ba vai trò ADMIN · HR · EMPLOYEE."),("Lưu trữ","SQL Server, ánh xạ qua Spring Data JPA.")]
for i,(h,b) in enumerate(security):
    y=1.65+i*.91
    rect(s,.95,y,1.85,.62,PANEL2)
    text(s,h,.95,y+.13,1.85,.3,14,TEAL,True,PP_ALIGN.CENTER)
    rect(s,3.05,y+.28,.45,.04,BLUE,False)
    text(s,b,3.75,y+.08,8.2,.46,16,WHITE)
text(s,"Luồng tổng quát: Người dùng → React → API Spring Boot → SQL Server",1,6.45,11,.35,14,MUTED,False,PP_ALIGN.CENTER)

# 10 real screens showcase
s=base("Giao diện hệ thống", "05 · SẢN PHẨM")
screens=[("dashboard.png","Dashboard"),("attendance.png","Chấm công"),("departments.png","Phòng ban"),("task_assignments.png","Giao việc")]
for i,(file,label) in enumerate(screens):
    col=i%2; row=i//2; x=.85+col*6.05; y=1.62+row*2.55
    screenshot(s,file,x,y,5.5,1.85)
    text(s,label,x,y+1.92,5.5,.32,12,TEAL,True,PP_ALIGN.CENTER)

# 11 results and limitations
s=base("Kết quả và hướng phát triển", "06 · TỔNG KẾT")
card(s,.85,1.8,5.55,3.9,"ĐÃ TRIỂN KHAI","• Quản lý hồ sơ và cơ cấu tổ chức\n• Chấm công, nhập Excel, nghỉ phép\n• Bảng lương, tài khoản, giao việc\n• Dashboard và chat nội bộ\n• Đăng nhập JWT, phân quyền theo vai trò",TEAL,15)
card(s,6.75,1.8,5.55,3.9,"CÓ THỂ MỞ RỘNG","• Bổ sung thông báo theo thời gian thực\n• Mở rộng báo cáo và bộ lọc phân tích\n• Tăng cường kiểm thử nghiệp vụ và tải\n• Hoàn thiện triển khai, sao lưu, giám sát\n• Tinh chỉnh giao diện cho thiết bị di động",BLUE,15)
text(s,"Hệ thống tạo nền tảng số hóa các nghiệp vụ HRM phổ biến trong một ứng dụng thống nhất.",1,6.25,11,.48,15,MUTED,False,PP_ALIGN.CENTER)

# 12 end
s=prs.slides.add_slide(BLANK); s.background.fill.solid(); s.background.fill.fore_color.rgb=NAVY
rect(s,0,0,.14,7.5,TEAL,False)
text(s,"CẢM ƠN",.9,1.45,11.5,.8,16,TEAL,True,PP_ALIGN.CENTER)
text(s,"CÂU HỎI &\nTHẢO LUẬN",1.0,2.3,11.2,1.7,38,WHITE,True,PP_ALIGN.CENTER,MSO_ANCHOR.MIDDLE)
rect(s,5.6,4.55,2.1,.07,TEAL,False)
text(s,"XÂY DỰNG HỆ THỐNG QUẢN LÝ NHÂN SỰ HRM",1,5.0,11.2,.45,15,MUTED,False,PP_ALIGN.CENTER)
text(s,"Lê Thanh Thiên  ·  Đại học Đông Á",1,5.65,11.2,.38,13,WHITE,False,PP_ALIGN.CENTER)
text(s,"12",12.15,7.08,.5,.25,10,MUTED,align=PP_ALIGN.RIGHT)

prs.save(OUT)
print(f"Created {OUT} ({len(prs.slides)} slides)")
