"""
agents.py — The three specialist agents in the LinkedIn Generator pipeline.

Agent 1 — Draft Generator  : Writes / refines the LinkedIn post.
Agent 2 — Web Researcher   : Enriches the draft with live web data.
Agent 3 — Quality Evaluator: Scores the draft and sends feedback to Agent 1.
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import END, StateGraph, MessagesState

import json
import os
from typing import List, Any
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
from pathlib import Path
from state import AgentState
from langchain_community.tools.tavily_search import TavilySearchResults

load_dotenv(Path(__file__).resolve().parent / ".env")

# initializes the language model
llm = ChatOpenAI(
    model="gpt-4.1-nano",
)

# ---------------------------------------------------------------------------
# Agent 1 — Draft Generator / Refiner
# ---------------------------------------------------------------------------

DRAFT_SYSTEM = """You are a world-class LinkedIn content strategist and copywriter.
Your job is to craft compelling, authentic LinkedIn posts that drive engagement.

Guidelines for a great LinkedIn post:
- Hook: Start with a powerful first line (no greetings, no "I'm excited to share").
- Story or insight: Give the reader something genuinely useful or thought-provoking.
- Structure: Short paragraphs, white space, scannable. 150–300 words is ideal.
- CTA: End with a question or clear call-to-action that invites comments.
- Tone: Professional but human — avoid corporate speak and clichés.
- Emojis: Use sparingly (0-3 max) only if they add clarity or warmth.
- Hashtags: 3-5 relevant hashtags at the very end.

When you receive evaluation feedback, incorporate it precisely before producing
the next draft. Acknowledge every point of criticism.

Return ONLY the finished LinkedIn post text — no preamble, no meta-commentary."""


def agent_draft_generator(state: AgentState) -> dict[str, Any]:
    """
    Agent 1: Generates an initial draft on the first iteration.
    On subsequent iterations it refines the draft using feedback from Agent 3.
    On the final iteration it sets `final_post` and signals completion.
    """
    iteration = state.get("iteration_count", 0)
    max_iter = state.get("max_iterations", 2)
    evaluation = state.get("evaluation", "")
    web_research = state.get("web_research", "")

    log_prefix = f"[Cycle {iteration + 1}/{max_iter}] Agent 1 (Draft Generator)"

    # ---- Build the prompt ------------------------------------------------
    if iteration == 0:
        # First pass — cold start
        user_prompt = (
            f"Write a LinkedIn post about the following topic:\n\n{state['user_query']}"
        )
        log_msg = f"{log_prefix}: Generating initial draft."
    else:
        # Refinement pass — incorporate research + evaluation
        user_prompt = (
            f"Topic: {state['user_query']}\n\n"
            f"Previous draft:\n{state['current_draft']}\n\n"
            f"Web research to incorporate:\n{web_research}\n\n"
            f"Quality evaluation & feedback to address:\n{evaluation}\n\n"
            "Rewrite the post addressing all feedback and weaving in the research."
        )
        log_msg = (
            f"{log_prefix}: Refining draft based on evaluation feedback "
            f"(iteration {iteration})."
        )

    messages = [
        SystemMessage(content=DRAFT_SYSTEM),
        HumanMessage(content=user_prompt),
    ]
    response = llm.invoke(messages)
    new_draft = response.content.strip()

    new_iteration = iteration + 1
    is_final = new_iteration >= max_iter

    result: dict[str, Any] = {
        "current_draft": new_draft,
        "iteration_count": new_iteration,
        "messages": [AIMessage(content=new_draft, name="DraftGenerator")],
        "agent_log": [log_msg],
    }

    if is_final:
        result["final_post"] = new_draft
        result["agent_log"] = result["agent_log"] + [
            f"{log_prefix}: Max iterations reached — finalising post."
        ]

    return result


# ---------------------------------------------------------------------------
# Agent 2 — Web Researcher
# ---------------------------------------------------------------------------

RESEARCH_SYSTEM = """You are a meticulous research analyst supporting a LinkedIn
content team. Given a draft LinkedIn post and a set of web search results,
your job is to:

1. Identify any factual claims in the draft that need verification.
2. Extract relevant statistics, quotes, trends, or examples from the search
   results that could strengthen the post.
3. Flag anything that appears inaccurate or outdated.
4. Suggest 2–3 specific improvements backed by the research.

Return a structured research report in this exact JSON format (no markdown fences):
{
  "verified_facts": ["...", "..."],
  "suggested_additions": ["...", "..."],
  "accuracy_flags": ["...", "..."],
  "research_summary": "2-3 sentence plain-English summary"
}"""


def agent_web_researcher(state: AgentState) -> dict[str, Any]:
    """
    Agent 2: Searches the web for information relevant to the current draft
    and returns a structured research report.
    """
    draft = state["current_draft"]
    query = state["user_query"]
    iteration = state.get("iteration_count", 1)
    max_iter = state.get("max_iterations", 2)

    log_prefix = f"[Cycle {iteration}/{max_iter}] Agent 2 (Web Researcher)"

    # ---- Web search -------------------------------------------------------
    search_tool = TavilySearchResults(
        max_results=5,
        tavily_api_key=os.environ["TAVILY_API_KEY"],
    )
    search_results = search_tool.invoke({"query": f"{query} latest insights statistics"})
    formatted_results = "\n\n".join(
        f"Source: {r.get('url', 'N/A')}\n{r.get('content', '')}"
        for r in search_results
    )

    # ---- Analysis via LLM -------------------------------------------------
    messages = [
        SystemMessage(content=RESEARCH_SYSTEM),
        HumanMessage(
            content=(
                f"Draft LinkedIn post:\n{draft}\n\n"
                f"Web search results:\n{formatted_results}"
            )
        ),
    ]
    response = llm.invoke(messages)

    # Safely parse JSON; fall back to raw text
    try:
        report = json.loads(response.content.strip())
        web_research = json.dumps(report, indent=2)
    except json.JSONDecodeError:
        web_research = response.content.strip()

    log_msg = (
        f"{log_prefix}: Searched the web and produced a research report. "
        f"Found {len(search_results)} sources."
    )

    return {
        "web_research": web_research,
        "messages": [AIMessage(content=web_research, name="WebResearcher")],
        "agent_log": [log_msg],
    }


# ---------------------------------------------------------------------------
# Agent 3 — Quality Evaluator
# ---------------------------------------------------------------------------

EVALUATION_SYSTEM = """You are a senior LinkedIn content coach and editor.
Your role is to critically evaluate a LinkedIn post draft and provide
actionable, specific feedback so the writer can improve it.

Evaluate across these five dimensions (score each 1–10):
1. Hook strength    — Does the first line demand attention?
2. Value delivery   — Does the post teach, inspire, or provoke thought?
3. Readability      — Is it scannable? Right length? Good white space?
4. Authenticity     — Does it sound human, not corporate or AI-generated?
5. Call-to-action   — Is the CTA clear and likely to generate comments?

Return ONLY valid JSON (no markdown fences) in this exact format:
{
  "scores": {
    "hook": <1-10>,
    "value": <1-10>,
    "readability": <1-10>,
    "authenticity": <1-10>,
    "cta": <1-10>
  },
  "overall_score": <average, 1 decimal>,
  "strengths": ["...", "..."],
  "improvements": [
    {"issue": "...", "suggestion": "..."},
    {"issue": "...", "suggestion": "..."}
  ],
  "verdict": "one sentence overall verdict"
}"""


def agent_quality_evaluator(state: AgentState) -> dict[str, Any]:
    """
    Agent 3: Scores the current draft across five quality dimensions and
    produces structured feedback for Agent 1 to act on.
    """
    draft = state["current_draft"]
    web_research = state.get("web_research", "No research available.")
    iteration = state.get("iteration_count", 1)
    max_iter = state.get("max_iterations", 2)

    log_prefix = f"[Cycle {iteration}/{max_iter}] Agent 3 (Quality Evaluator)"

    messages = [
        SystemMessage(content=EVALUATION_SYSTEM),
        HumanMessage(
            content=(
                f"LinkedIn post draft to evaluate:\n{draft}\n\n"
                f"Research context (use this to assess accuracy):\n{web_research}"
            )
        ),
    ]
    response = llm.invoke(messages)

    try:
        report = json.loads(response.content.strip())
        evaluation = json.dumps(report, indent=2)
        score = report.get("overall_score", "N/A")
    except json.JSONDecodeError:
        evaluation = response.content.strip()
        score = "N/A"

    log_msg = (
        f"{log_prefix}: Evaluated draft — overall score: {score}/10. "
        "Feedback sent back to Agent 1."
    )

    return {
        "evaluation": evaluation,
        "messages": [AIMessage(content=evaluation, name="QualityEvaluator")],
        "agent_log": [log_msg],
    }
