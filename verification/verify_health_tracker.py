from playwright.sync_api import sync_playwright, expect
import time

def verify_health_tracker():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Wait for server to be ready
            time.sleep(5)

            base_url = "http://127.0.0.1:5173"

            # Ensure we have a client to select
            api_context = context.request
            client_data = {
                "name": "Health Tracker Test Client",
                "email": "health@test.com",
                "phone": "1234567890",
                "age": 25,
                "weight": 80,
                "height": 180,
                "goal": "endurance",
                "fitnessLevel": "advanced",
                "notes": "Test notes"
            }
            api_context.post(f"{base_url}/api/clients", data=client_data)

            # Navigate to Health Tracker
            page.goto(f"{base_url}/health")

            # Select Client
            page.get_by_text("Select client...").click()
            page.get_by_text("Health Tracker Test Client").first.click()

            # Verify Content Loaded - Check for tabs which are always there
            expect(page.get_by_role("tab", name="Body Measurements")).to_be_visible()

            # Take Screenshot
            page.screenshot(path="verification/health_tracker.png")
            print("Screenshot taken at verification/health_tracker.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/health_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_health_tracker()
