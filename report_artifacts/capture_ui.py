from pathlib import Path
from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5173"
OUT_DIR = Path(r"E:\HRM\report_artifacts\screenshots")
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def wait_for_page(page):
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_timeout(1600)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    routes = [
        ("dashboard", "/dashboard"),
        ("employees", "/employees"),
        ("departments", "/departments"),
        ("positions", "/positions"),
        ("attendance", "/attendance"),
        ("leave_requests", "/leave-requests"),
        ("salaries", "/salaries"),
        ("accounts", "/accounts"),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=EDGE,
            headless=True,
            args=["--disable-gpu", "--hide-scrollbars"],
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
            locale="vi-VN",
        )
        page = context.new_page()

        page.goto(f"{BASE_URL}/login")
        wait_for_page(page)
        page.screenshot(path=str(OUT_DIR / "login.png"), full_page=True)

        page.locator("form input").first.fill("admin")
        page.locator('input[type="password"]').first.fill("123456")
        page.locator("form button").click()
        page.wait_for_url("**/dashboard", timeout=15000)
        wait_for_page(page)

        for name, route in routes:
            page.goto(f"{BASE_URL}{route}")
            wait_for_page(page)
            page.screenshot(path=str(OUT_DIR / f"{name}.png"), full_page=True)

        context.clear_cookies()
        page.goto(f"{BASE_URL}/login")
        page.evaluate("localStorage.clear()")
        page.reload()
        wait_for_page(page)
        page.locator("form input").first.fill("hr")
        page.locator('input[type="password"]').first.fill("123456")
        page.locator("form button").click()
        page.wait_for_url("**/dashboard", timeout=15000)
        page.goto(f"{BASE_URL}/task-assignments")
        wait_for_page(page)
        page.screenshot(path=str(OUT_DIR / "task_assignments.png"), full_page=True)

        browser.close()


if __name__ == "__main__":
    main()
