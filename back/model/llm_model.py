from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Nl2SqlRequest(BaseModel):
    company_id: str
    user_question: str
    table_name: str

class RespondentRequest(BaseModel):
    company_id: str
    user_question: str
    sql_query: str

class HelpRequest(BaseModel):
    prompt: str
    user_question: str

class EvaluateRequest(BaseModel):
    prompt: str
    question1: str
    question2: str
    user_question: str = Field(default="")