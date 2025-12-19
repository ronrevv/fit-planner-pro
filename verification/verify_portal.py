from playwright.sync_api import sync_playwright, expect
import time

def verify_portal_resources():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Wait for server to be ready
            time.sleep(5)

            api_context = context.request
            base_url = "http://127.0.0.1:5173"

            # Create a client
            client_data = {
                "name": "Test Client",
                "email": "test@example.com",
                "phone": "1234567890",
                "age": 30,
                "weight": 70,
                "height": 175,
                "goal": "muscle_gain",
                "fitnessLevel": "intermediate",
                "notes": "Test notes"
            }
            response = api_context.post(f"{base_url}/api/clients", data=client_data)
            if not response.ok:
                print(f"Failed to create client: {response.status} {response.text()}")
                return

            client = response.json()
            client_id = client['id']
            token = client['token']
            print(f"Created client with ID: {client_id} and Token: {token}")

            # Create a resource for this client
            resource_data = {
                "title": "Test Resource Video",
                "type": "link",
                "url": "https://example.com/video",
                "description": "A sample video for testing",
                "clientId": client_id
            }
            res_response = api_context.post(f"{base_url}/api/clients/{client_id}/resources", data=resource_data)
            if not res_response.ok:
                 print(f"Failed to create resource: {res_response.status} {res_response.text()}")

            # Update trainer profile
            profile_data = {
                "name": "Super Trainer",
                "email": "trainer@fitpro.com",
                "phone": "1234567890",
                "bio": "I am the best trainer."
            }
            prof_response = api_context.post(f"{base_url}/api/trainer/profile", data=profile_data)
            if not prof_response.ok:
                print(f"Failed to update profile: {prof_response.status} {prof_response.text()}")

            # 2. Navigate to the Portal
            portal_url = f"{base_url}/portal/{token}"
            print(f"Navigating to {portal_url}")
            page.goto(portal_url)

            # 3. Click on "Resources & Info" tab
            # Wait for tab to appear
            page.get_by_text("Resources & Info").click()

            # 4. Verify Content
            # Check for Trainer Name
            expect(page.get_by_text("Super Trainer")).to_be_visible()
            # Check for Trainer Bio
            expect(page.get_by_text('"I am the best trainer."')).to_be_visible()
            # Check for Resource Title
            expect(page.get_by_text("Test Resource Video")).to_be_visible()

            # 5. Take Screenshot
            page.screenshot(path="verification/portal_resources.png")
            print("Screenshot taken at verification/portal_resources.png")

        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot on error too
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_portal_resources()
