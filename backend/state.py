"""
state.py — Shared state schema for the LinkedIn Generator multi-agent graph.

Each node reads from and writes to this state. LangGraph merges partial
updates automatically, so nodes only return the fields they modify.
"""

from __future__ import annotations

from typing import Annotated
from typing_extensions import TypedDict

from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    Central state object that flows through every node in the graph.

    Fields
    ------
    user_query        : Original user request (set once at the start).
    current_draft     : The LinkedIn post produced / refined by Agent 1.
    web_research      : Structured research summary produced by Agent 2.
    evaluation        : Structured quality feedback produced by Agent 3.
    visual_content    : Renderable image/carousel payload produced at the end.
    iteration_count   : Number of full cycles completed (0-based before start).
    max_iterations    : Upper-bound on cycles; set once from config / env.
    final_post        : Populated by Agent 1 on the last iteration before END.
    messages          : Full conversation trace (auto-merged by LangGraph).
    agent_log         : Human-readable log of what each agent did each cycle.
    """

    user_query: str
    skill_1: str
    skill_2: str
    skill_3: str
    skill_4: str    
    visual_format: str
    art_style: str    
    current_draft: str
    web_research: str
    evaluation: str
    visual_content: str
    iteration_count: int
    max_iterations: int
    final_post: str
    messages: Annotated[list[BaseMessage], add_messages]
    agent_log: Annotated[list[str], lambda old, new: old + new]
