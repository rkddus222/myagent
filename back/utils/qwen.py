import requests
from langchain.llms import BaseLLM
from typing import List, Optional, Any, Dict
from langchain_core.outputs import LLMResult, Generation
from langchain_core.messages import AIMessage
from pydantic import Field, BaseModel

from dotenv import load_dotenv
import os

load_dotenv()

class CustomChatLLM(BaseLLM, BaseModel):
    api_url: str = Field(default_factory=lambda: os.getenv("LLM_URL", "http://121.78.125.134:8000/v1/chat/completions"))
    model: str = Field(...)
    temperature: float = Field(0.0)
    max_tokens: int = Field(5000)

    class Config:
        arbitrary_types_allowed = True

    # max_token 설정 안 하면 기본값 125
    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
        }

        # print("API Payload:", json.dumps(payload, indent=2))
        try:
            response = requests.post(self.api_url, json=payload)
            response.raise_for_status()

            response_data = response.json()
            choices = response_data.get("choices", [])
            if not choices:
                raise ValueError("Empty choices in API response")

            message = choices[0].get("message", {})
            if 'content' not in message:
                raise ValueError("No content in message")

            content = message["content"]
            if not isinstance(content, str):
                raise TypeError("Content is not a string")

            return content.strip()

        except requests.RequestException as e:
            raise ValueError(f"HTTP request error: {str(e)}")
        except (ValueError, KeyError, TypeError) as e:
            raise ValueError(f"API response error: {str(e)}")

    def _generate(self, prompts: List[str], stop: Optional[List[str]] = None) -> LLMResult:
        generations = []
        for prompt in prompts:
            try:
                response = self._call(prompt, stop)
                # 여기서 AIMessage 객체를 생성하지 않고 직접 Generation 객체를 생성
                generations.append([Generation(text=response)])
            except Exception as e:
                raise ValueError(f"Generation error: {str(e)}")
        return LLMResult(generations=generations)

    @property
    def _llm_type(self) -> str:
        return "custom_llama"

    @property
    def _identifying_params(self) -> Dict[str, Any]:
        return {
            "model": self.model,
            "max_tokens": self.max_tokens
        }

# Create model instances, max_token 설정 안 하면 기본값 125
qwen_llm = CustomChatLLM(model="Qwen/Qwen2.5-Coder-14B-Instruct-AWQ", temperature=0.01, max_tokens=1000)
planner = CustomChatLLM(model="planner", temperature=0.01, max_tokens=1000)
nl2sql = CustomChatLLM(model="nl2sql", temperature=0.01, max_tokens=1000)
solver = CustomChatLLM(model="solver", temperature=0.01, max_tokens=1000)

# from langchain_openai import ChatOpenAI
# gpt_fouro_mini = ChatOpenAI(model="gpt-4o-mini", temperature=0, top_p=1)
# gpt_fouro = ChatOpenAI(model="gpt-4o", temperature=0, top_p=1)
# gpt_four1_mini = ChatOpenAI(model="gpt-4.1-mini", temperature=0, top_p=1)
# gpt_four1_nano = ChatOpenAI(model="gpt-4.1-nano", temperature=0, top_p=1)