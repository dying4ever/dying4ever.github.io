from pathlib import Path
import os
import sys


BASE_URL = os.environ.get("BLOG_PREVIEW_URL", "http://127.0.0.1:4173/").rstrip("/")
ROOT = Path(__file__).resolve().parents[1]
PREVIEWS = ROOT / "previews"
PREVIEWS.mkdir(exist_ok=True)
PLAYWRIGHT_DEPS = Path(r"F:\hugo\hexo\new\work\.deps")
EDGE_PATH = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

sys.path.insert(0, str(PLAYWRIGHT_DEPS))

from playwright.sync_api import sync_playwright  # noqa: E402


def route_url(route="/"):
    return f"{BASE_URL}/{route.lstrip('/')}"


def assert_no_horizontal_overflow(page, label):
    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    offenders = page.evaluate(
        """
        () => [...document.querySelectorAll('body *')]
          .map(element => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className: typeof element.className === 'string' ? element.className : '',
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
            };
          })
          .filter(item => item.right > innerWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 1)
          .sort((a, b) => Math.max(b.right - innerWidth, b.scrollWidth - b.clientWidth)
            - Math.max(a.right - innerWidth, a.scrollWidth - a.clientWidth))
          .slice(0, 8)
        """
    )
    assert overflow <= 1, f"{label} has {overflow}px horizontal overflow: {offenders}"


def attach_diagnostics(page):
    diagnostics = {"console": [], "requests": [], "responses": []}
    page.on(
        "console",
        lambda message: diagnostics["console"].append(message.text)
        if message.type == "error"
        else None,
    )
    page.on(
        "requestfailed",
        lambda request: diagnostics["requests"].append(
            f"{request.url}: {request.failure or 'request failed'}"
        ),
    )
    page.on(
        "response",
        lambda response: diagnostics["responses"].append(
            f"{response.status} {response.url}"
        )
        if response.status >= 400
        else None,
    )
    return diagnostics


def assert_clean(diagnostics, label):
    assert not diagnostics["console"], f"{label} console errors: {diagnostics['console']}"
    assert not diagnostics["requests"], f"{label} failed requests: {diagnostics['requests']}"
    assert not diagnostics["responses"], f"{label} error responses: {diagnostics['responses']}"


def exercise_home_desktop(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    diagnostics = attach_diagnostics(page)
    page.goto(route_url(), wait_until="networkidle")

    assert page.locator("#cover-title").inner_text().replace("\n", "") == "终南山下，活死人墓"
    title_contract = page.evaluate(
        """
        () => {
          const cover = document.querySelector('#cover-title');
          const home = document.querySelector('#home-heading');
          const coverStyle = getComputedStyle(cover);
          const homeStyle = getComputedStyle(home);
          return {
            coverLines: cover.querySelectorAll('.site-title__line').length,
            homeLines: home.querySelectorAll('.site-title__line').length,
            sameFont: coverStyle.fontFamily === homeStyle.fontFamily,
            sameFill: coverStyle.backgroundImage === homeStyle.backgroundImage,
          };
        }
        """
    )
    assert title_contract == {
        "coverLines": 2,
        "homeLines": 2,
        "sameFont": True,
        "sameFill": True,
    }
    page.screenshot(path=PREVIEWS / "desktop-cover.png", full_page=False)
    assert_no_horizontal_overflow(page, "desktop cover")

    page.mouse.wheel(0, 520)
    page.wait_for_function(
        "document.documentElement.classList.contains('is-open')", timeout=6500
    )
    assert page.locator("#cover").evaluate(
        "element => getComputedStyle(element).visibility"
    ) == "hidden"
    assert page.locator("#recent").is_visible()
    recent_items = page.locator("[data-recent-list] li")
    assert recent_items.count() == 3
    assert recent_items.first.locator("a").get_attribute("href").startswith(
        f"{BASE_URL}/2026/07/17/"
    )
    assert recent_items.first.locator("time").inner_text() == "2026.07.17"
    assert page.locator("[data-portal]").count() == 4
    assert not any(page.locator("[data-portal]").nth(index).is_visible() for index in range(4))
    page.screenshot(path=PREVIEWS / "desktop-home.png", full_page=False)
    assert_no_horizontal_overflow(page, "desktop home")

    story = page.locator("#scroll-story").evaluate(
        "element => ({ top: element.offsetTop, range: element.offsetHeight - innerHeight })"
    )
    page.evaluate("value => scrollTo(0, value.top + value.range * .40)", story)
    page.wait_for_timeout(1300)
    assert abs(page.locator(".scroll-story__sticky").evaluate(
        "element => element.getBoundingClientRect().top"
    )) <= 1
    assert page.locator("[data-story-landscape]").evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    ) > 0.72
    assert page.locator("[data-bird-flock]").evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    ) > 0.6
    midpoint_title = page.locator(".story-world__focus-title")
    midpoint_metrics = midpoint_title.evaluate(
        """
        element => {
          const style = getComputedStyle(element);
          const range = document.createRange();
          range.selectNodeContents(element);
          return {
            whiteSpace: style.whiteSpace,
            lineRects: range.getClientRects().length,
          };
        }
        """
    )
    assert midpoint_metrics["whiteSpace"] == "nowrap"
    assert midpoint_metrics["lineRects"] == 1, midpoint_metrics
    page.screenshot(path=PREVIEWS / "desktop-story-world.png", full_page=False)

    page.evaluate("value => scrollTo(0, value.top + value.range * .62)", story)
    page.wait_for_timeout(1300)
    paragraphs = page.locator(".prologue-panel__body p")
    assert paragraphs.count() == 3
    opacities = paragraphs.evaluate_all(
        "elements => elements.map(element => Number.parseFloat(getComputedStyle(element).opacity))"
    )
    assert min(opacities) >= 0.72, opacities
    assert page.locator(".prologue-panel__title-char").count() == 6
    assert page.locator("#prologue-title").get_attribute("aria-label") == "出名要趁早呀"
    highlight = page.locator(".prologue-panel__highlight")
    assert highlight.inner_text() == (
        "呵，出名要趁早呀！来得太晚的话，快乐也不那么痛快。"
    )
    highlight_layout = highlight.evaluate(
        """
        element => ({
          rects: [...element.getClientRects()].map(rect => ({ left: rect.left, width: rect.width })),
          hasBreakBefore: element.previousSibling?.nodeName === 'BR',
          hasTextBefore: element.previousSibling?.nodeType === Node.TEXT_NODE
            && element.previousSibling.textContent.trim().length > 0,
        })
        """
    )
    assert len(highlight_layout["rects"]) >= 1, highlight_layout
    assert not highlight_layout["hasBreakBefore"], highlight_layout
    assert highlight_layout["hasTextBefore"], highlight_layout
    quote_indent = paragraphs.first.evaluate(
        """
        element => {
          const style = getComputedStyle(element);
          return {
            indent: Number.parseFloat(style.textIndent),
            fontSize: Number.parseFloat(style.fontSize),
          };
        }
        """
    )
    assert abs(quote_indent["indent"] - quote_indent["fontSize"] * 2) <= 1
    attribution = page.locator(".prologue-panel__attribution")
    assert attribution.evaluate("element => element.parentElement.matches('blockquote')")
    assert attribution.evaluate("element => getComputedStyle(element).textAlign") == "right"
    assert attribution.evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    ) > 0.6
    title_overlap = page.locator(".prologue-panel__title-char").evaluate_all(
        """
        elements => elements.some((element, index) => {
          const next = elements[index + 1];
          if (!next) return false;
          const currentRect = element.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();
          return currentRect.bottom - nextRect.top > currentRect.height * .12;
        })
        """
    )
    assert not title_overlap, "prologue title characters overlap"
    assert page.locator('[data-atmosphere="petal"]').evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    ) > 0.3
    overlap = paragraphs.evaluate_all(
        """
        elements => elements.some((element, index) => {
          const a = element.getBoundingClientRect();
          return elements.slice(index + 1).some(other => {
            const b = other.getBoundingClientRect();
            return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
              && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
          });
        })
        """
    )
    assert not overlap, "prologue paragraphs overlap"
    page.screenshot(path=PREVIEWS / "standalone-prologue.png", full_page=False)

    page.evaluate("value => scrollTo(0, value.top + value.range * .97)", story)
    page.wait_for_timeout(1300)
    assert page.locator("#about-story-title").is_visible()
    about_name_lines = page.locator("#about-story-title").evaluate(
        """
        element => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getClientRects().length;
        }
        """
    )
    assert about_name_lines == 1
    assert page.locator("#about-story").evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    ) >= 0.92
    portrait = page.locator(".about-story__portrait img")
    page.wait_for_function(
        "element => element.complete && element.naturalWidth > 0", arg=portrait.element_handle()
    )
    assert page.locator('[data-atmosphere="snow"]').evaluate(
        "element => Number.parseFloat(getComputedStyle(element).opacity)"
    ) > 0.12
    portrait_metrics = portrait.evaluate(
        """
        element => ({
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
          radius: getComputedStyle(element).borderRadius,
        })
        """
    )
    assert portrait_metrics["width"] <= 150, portrait_metrics
    assert abs(portrait_metrics["width"] - portrait_metrics["height"]) <= 1, portrait_metrics
    assert portrait_metrics["radius"] == "50%", portrait_metrics
    assert page.locator("[data-about-note]").count() == 2
    assert all(page.locator("[data-about-note]").nth(index).inner_text() for index in range(2))
    assert page.locator(".about-story__socials a").count() == 3
    assert page.locator(".about-story__socials svg").count() == 3

    page.locator(".about-story__portrait").hover()
    page.wait_for_timeout(700)
    portals = page.locator(".about-story__portal")
    assert portals.count() == 4
    assert all(portals.nth(index).is_visible() for index in range(4))
    assert min(portals.nth(index).evaluate(
        "element => element.getBoundingClientRect().width"
    ) for index in range(4)) >= 300
    page.screenshot(path=PREVIEWS / "desktop-about.png", full_page=False)
    assert_no_horizontal_overflow(page, "desktop About portals")
    page.wait_for_timeout(900)
    assert not any(portals.nth(index).is_visible() for index in range(4))
    assert_clean(diagnostics, "desktop home")
    context.close()


def exercise_content_desktop(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    diagnostics = attach_diagnostics(page)
    route_contracts = {
        "about/": "body.standalone-page--about",
        "categories/": "body.taxonomy-page",
        "archives/": "body.archive-page",
        "projects/": "body.listing-page",
        "friends/": "body.standalone-page--friends",
        "changelog/": "body.standalone-page--changelog",
        "notes/": "body.listing-page",
        "film/": "body.listing-page",
        "life/": "body.listing-page",
    }
    for route, selector in route_contracts.items():
        response = page.goto(route_url(route), wait_until="networkidle")
        assert response and response.ok, f"{route} returned {response.status if response else 'no response'}"
        assert page.locator(selector).count() == 1, f"{route} did not render {selector}"
        assert page.locator(".content-nav").count() == 1
        assert_no_horizontal_overflow(page, f"desktop {route}")

    page.goto(route_url("notes/"), wait_until="networkidle")
    assert page.locator(".entry-card").count() == 131
    first_article = page.locator(".entry-card a").first.get_attribute("href")
    assert first_article and first_article.startswith("/20")
    response = page.goto(f"{BASE_URL}{first_article}", wait_until="networkidle")
    assert response and response.ok
    assert page.locator("body.article-page").count() == 1
    assert page.locator(".article-paper .markdown-body").count() == 1
    page.screenshot(path=PREVIEWS / "standalone-article.png", full_page=False)

    page.goto(route_url("archives/"), wait_until="networkidle")
    assert page.locator(".archive-group li a").count() == 134
    page.goto(route_url("categories/"), wait_until="networkidle")
    assert page.locator(".taxonomy-card").count() >= 4
    page.screenshot(path=PREVIEWS / "standalone-categories.png", full_page=False)

    image_route = "2026/01/15/围攻光明顶/"
    page.goto(route_url(image_route), wait_until="networkidle")
    image = page.locator(".markdown-body img").first
    assert image.count() == 1
    image.scroll_into_view_if_needed()
    page.wait_for_function(
        "element => element.complete && element.naturalWidth > 0", arg=image.element_handle()
    )
    assert_clean(diagnostics, "desktop content")
    context.close()


def exercise_mobile(browser):
    context = browser.new_context(
        viewport={"width": 390, "height": 844}, reduced_motion="reduce"
    )
    page = context.new_page()
    diagnostics = attach_diagnostics(page)
    page.goto(route_url(), wait_until="networkidle")
    page.locator("#enter-button").click()
    page.wait_for_function(
        "document.documentElement.classList.contains('is-open')", timeout=3500
    )
    assert page.locator("[data-recent-list] li").count() == 3
    assert_no_horizontal_overflow(page, "mobile home")
    page.screenshot(path=PREVIEWS / "standalone-mobile-home.png", full_page=False)

    page.locator("#about-story").scroll_into_view_if_needed()
    page.wait_for_timeout(400)
    assert page.locator("#about-story-title").is_visible()
    assert page.locator(".prologue-panel__title-char").count() == 6
    mobile_portrait = page.locator(".about-story__portrait img")
    page.wait_for_function(
        "element => element.complete && element.naturalWidth > 0",
        arg=mobile_portrait.element_handle(),
    )
    page.locator(".about-story__portrait").click()
    assert page.locator(".about-story__portal-disclosure").get_attribute("open") is not None
    assert page.locator(".about-story__portal").count() == 4
    assert all(page.locator(".about-story__portal").nth(index).is_visible() for index in range(4))
    assert_no_horizontal_overflow(page, "mobile story and About")
    page.screenshot(path=PREVIEWS / "mobile-about.png", full_page=False)

    for route in ("about/", "categories/", "archives/", "notes/"):
        response = page.goto(route_url(route), wait_until="networkidle")
        assert response and response.ok
        assert page.locator(".content-nav").count() == 1
        assert_no_horizontal_overflow(page, f"mobile {route}")

    page.locator(".content-menu").click()
    assert page.locator(".content-menu").get_attribute("aria-expanded") == "true"
    assert page.locator("#content-navigation").is_visible()
    page.screenshot(path=PREVIEWS / "standalone-mobile-notes.png", full_page=False)

    first_article = page.locator(".entry-card a").first.get_attribute("href")
    page.goto(f"{BASE_URL}{first_article}", wait_until="networkidle")
    assert page.locator("body.article-page").count() == 1
    assert page.locator(".markdown-body").is_visible()
    assert_no_horizontal_overflow(page, "mobile article")
    assert_clean(diagnostics, "mobile")
    context.close()


with sync_playwright() as playwright:
    assert EDGE_PATH.is_file(), f"Microsoft Edge was not found at {EDGE_PATH}"
    browser = playwright.chromium.launch(executable_path=str(EDGE_PATH), headless=True)
    exercise_home_desktop(browser)
    exercise_content_desktop(browser)
    exercise_mobile(browser)
    browser.close()

print("Smoke checks passed: immersive home, 131 Notes plus 3 section samples, routes, assets, desktop, and mobile.")
