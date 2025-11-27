import os
from locust import HttpUser, between, task


class WebsiteUser(HttpUser):
    wait_time = between(5, 15)
    host = "http://localhost:8000"

    def on_start(self):
        # Load once when user starts
        image_path = "../data/raw/cats/0_0006.jpg"
        self.image_file = open(image_path, "rb")
        self.filename = os.path.basename(image_path)
    
    @task
    def status(self):
        self.client.get("/status", name="/status")

    @task
    def predictions(self):
        self.client.post(
            "/predict", 
            files={"file": (self.filename, self.image_file, "image/jpeg")},
            name="/predict"
        )
        
    @task
    def visualizations(self):
        self.client.get("/visualizations", name="/visualizations")