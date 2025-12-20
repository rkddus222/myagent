import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

# Ensure OPENAI_API_KEY is set in environment or .env
if "OPENAI_API_KEY" not in os.environ:
    # Warning or fallback
    print("Warning: OPENAI_API_KEY not found in environment.")

gpt_4o_mini = ChatOpenAI(model="gpt-4o-mini", temperature=0)
