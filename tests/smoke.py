from pathlib import Path
import sys


BASE_URL = "http://127.0.0.1:4173/"
ROOT = Path(__file__).resolve().parents[1]
PREVIEWS = ROOT / "previews"
PREVIEWS.mkdir(exist_ok=True)
PLAYWRIGHT_DEPS = Path(r"F:\hugo\hexo\new\work\.deps")
EDGE_PATH = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

sys.path.insert(0, str(PLAYWRIGHT_DEPS))

from playwright.sync_api import sync_playwright  # noqa: E402


def assert_no_horizontal_overflow(page, label):
    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"{label} has {overflow}px horizontal overflow"


def exercise_desktop(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    console_errors = []
    failed_requests = []
    error_responses = []
    page.on(
        "console",
        lambda message: console_errors.append(
            f"{message.text} @ {message.location.get('url', '')}"
        )
        if message.type == "error"
        else None,
    )
    page.on(
        "requestfailed",
        lambda request: failed_requests.append(
            f"{request.url}: {request.failure or 'request failed'}"
        ),
    )
    page.on(
        "response",
        lambda response: error_responses.append(f"{response.status} {response.url}")
        if response.status >= 400
        else None,
    )

    page.goto(BASE_URL, wait_until="networkidle")
    assert page.locator("#cover-title").inner_text() == "终南山下，活死人墓"
    page.screenshot(path=PREVIEWS / "desktop-cover.png", full_page=False)
    assert_no_horizontal_overflow(page, "desktop cover")

    page.mouse.wheel(0, 520)
    page.wait_for_timeout(1900)
    assert page.evaluate(
        "document.documentElement.classList.contains('is-transitioning')"
    ), "transition completed before the cinematic bridge could be observed"
    transition_title_opacity = page.locator("[data-transition-title]").evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    )
    home_landscape_opacity = page.locator(".home-hero__landscape").evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    )
    cover_opacity = page.locator("#cover").evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    )
    assert transition_title_opacity > 0.45
    assert home_landscape_opacity > 0.2
    assert cover_opacity > 0
    page.screenshot(path=PREVIEWS / "desktop-transition.png", full_page=False)

    page.wait_for_function(
        "document.documentElement.classList.contains('is-open')", timeout=5000
    )
    cover_visibility = page.locator("#cover").evaluate(
        "element => getComputedStyle(element).visibility"
    )
    assert cover_visibility == "hidden", (
        f"cover still blocks the home after opening: {cover_visibility}"
    )
    assert page.locator("[data-portal]").count() == 4
    assert all(page.locator("[data-portal]").nth(index).is_visible() for index in range(4))
    page.wait_for_function(
        """
        ['.site-header', '.home-hero__copy', '#portal-grid'].every(selector =>
          Number.parseFloat(getComputedStyle(document.querySelector(selector)).opacity) > .98
        )
        """,
        timeout=4000,
    )
    assert page.locator("[data-portal='notes']").inner_text().find("NOTES") >= 0
    page.screenshot(path=PREVIEWS / "desktop-home.png", full_page=False)
    assert_no_horizontal_overflow(page, "desktop home")

    initial_scroll = page.evaluate("window.scrollY")
    page.mouse.wheel(0, 360)
    page.wait_for_timeout(300)
    assert page.evaluate("window.scrollY") > initial_scroll, "wheel remained locked after opening"

    page.locator("#overview").scroll_into_view_if_needed()
    page.wait_for_timeout(350)
    assert page.locator("#overview-title").is_visible()
    assert page.locator("[data-log-list] li").count() == 3

    assert not failed_requests, f"failed requests: {failed_requests}"
    assert not error_responses, f"error responses: {error_responses}"
    assert not console_errors, f"console errors: {console_errors}"
    context.close()


def exercise_mobile_reduced_motion(browser):
    context = browser.new_context(
        viewport={"width": 390, "height": 844}, reduced_motion="reduce"
    )
    page = context.new_page()
    console_errors = []
    page.on(
        "console",
        lambda message: console_errors.append(
            f"{message.text} @ {message.location.get('url', '')}"
        )
        if message.type == "error"
        else None,
    )
    page.goto(BASE_URL, wait_until="networkidle")
    page.locator("#enter-button").click()
    page.wait_for_function(
        "document.documentElement.classList.contains('is-open')", timeout=3000
    )
    assert page.locator("#cover").evaluate(
        "element => getComputedStyle(element).visibility"
    ) == "hidden"
    assert page.locator("[data-portal]").count() == 4
    assert all(page.locator("[data-portal]").nth(index).is_visible() for index in range(4))
    page.wait_for_function(
        """
        ['.site-header', '.home-hero__copy', '#portal-grid'].every(selector =>
          Number.parseFloat(getComputedStyle(document.querySelector(selector)).opacity) > .98
        )
        """,
        timeout=3000,
    )
    assert_no_horizontal_overflow(page, "mobile home")
    page.screenshot(path=PREVIEWS / "mobile-home.png", full_page=True)
    assert not console_errors, f"mobile console errors: {console_errors}"
    context.close()


with sync_playwright() as playwright:
    assert EDGE_PATH.is_file(), f"Microsoft Edge was not found at {EDGE_PATH}"
    browser = playwright.chromium.launch(
        executable_path=str(EDGE_PATH), headless=True
    )
    exercise_desktop(browser)
    exercise_mobile_reduced_motion(browser)
    browser.close()

print("Smoke checks passed: desktop opening, overview, and reduced-motion mobile.")
