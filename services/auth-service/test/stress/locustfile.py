import json
import random
import string
from locust import HttpUser, task, between

def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def generate_random_phone():
    return f"+1{random.randint(1000000000, 9999999999)}"

def generate_random_cpf():
    return ''.join([str(random.randint(0, 9)) for _ in range(11)])

class UserBehavior(HttpUser):
    wait_time = between(1, 3)  # Wait between 1 and 3 seconds between tasks
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None
        self.test_users = []

    def on_start(self):
        """ Initialize test data """
        self.headers = {'Content-Type': 'application/json'}

    @task(1)
    def create_user(self):
        """ Test user registration endpoint """
        email = f"test_{generate_random_string()}@example.com"
        password = generate_random_string(12)
        
        payload = {
            "email": email,
            "password": password,
            "name": f"Test User {generate_random_string(5)}",
            "phoneNumber": generate_random_phone(),
            "cpf": generate_random_cpf(),
            "role": "CUSTOMER"  # Using CUSTOMER role as it's the default for public registration
        }
        
        with self.client.post("/users", 
                            json=payload,
                            headers=self.headers,
                            catch_response=True) as response:
            if response.status_code == 201:
                self.test_users.append({"email": email, "password": password})
            else:
                response.failure(f"Failed to create user: {response.text}")

    @task(2)
    def login_user(self):
        """ Test login endpoint """
        if not self.test_users:  # If no test users available, create one
            self.create_user()
            
        if self.test_users:
            user = random.choice(self.test_users)
            payload = {
                "email": user["email"],
                "password": user["password"]
            }
            
            with self.client.post("/auth/login",
                                json=payload,
                                headers=self.headers,
                                catch_response=True) as response:
                try:
                    response_data = response.json()
                    if response.status_code in [200, 201]:
                        if "access_token" in response_data and "user" in response_data:
                            self.token = response_data["access_token"]
                            response.success()
                        else:
                            response.failure("Invalid response format")
                    else:
                        response.failure(f"Login failed with status code {response.status_code}")
                except json.JSONDecodeError:
                    response.failure("Invalid JSON response")

class WebsiteUser(HttpUser):
    tasks = [UserBehavior]
    min_wait = 1000  # Minimum wait time between tasks in milliseconds
    max_wait = 3000  # Maximum wait time between tasks in milliseconds 