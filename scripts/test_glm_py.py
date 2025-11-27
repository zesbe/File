import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["ZAI_API_KEY"])
client._base_url = os.environ["ZAI_BASE_URL"]

resp = client.chat.completions.create(
    model="glm-4.6",
    messages=[
        {"role": "user", "content": "Halo GLM dari Python Termux!"}
    ]
)

print(resp.choices[0].message.content)
