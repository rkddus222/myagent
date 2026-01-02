import os
from functools import lru_cache
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

@lru_cache
def get_chat_model():
    # Ensure OPENAI_API_KEY is set in environment or .env
    if "OPENAI_API_KEY" not in os.environ:
        print("Warning: OPENAI_API_KEY not found in environment.")
        # Vercel 배포 시 빌드 타임에는 키가 없을 수 있으므로, 
        # 호출 시점에 에러가 나도록 하거나 더미를 반환하지 않고 그냥 진행(LangChain이 에러 냄)
    
    return ChatOpenAI(model="gpt-4o-mini", temperature=0)
