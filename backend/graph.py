"""
graph.py — Builds and compiles the LinkedIn Generator LangGraph state machine.

Graph topology
--------------

                    ┌─────────────────────────────────┐
                    │                                 │
  START ──► [Agent 1: Draft Generator] ──► (router) ──► END
                    ▲                         │
                    │                         ▼
           [Agent 3: Evaluator]    [Agent 2: Web Researcher]
                    ▲                         │
                    └─────────────────────────┘

Routing logic (inside `should_continue`):
  • If iteration_count >= max_iterations → END  (Agent 1 set final_post)
  • Otherwise                           → Agent 2 (continue the cycle)
"""

from __future__ import annotations

from typing import Literal

from langgraph.graph import END, START, StateGraph

from agents import (
    agent_draft_generator,
    agent_quality_evaluator,
    agent_web_researcher,
)
from state import AgentState

# ---------------------------------------------------------------------------
# Node names (constants prevent typos)
# ---------------------------------------------------------------------------
DRAFT_NODE = "draft_generator"
RESEARCH_NODE = "web_researcher"
EVAL_NODE = "quality_evaluator"


# ---------------------------------------------------------------------------
# Conditional edge — decides what comes after Agent 1
# ---------------------------------------------------------------------------

def should_continue(state: AgentState) -> Literal["web_researcher", "__end__"]:
    """
    Route after Agent 1:
      - If we've completed max_iterations full cycles → END
      - Otherwise → hand off to Agent 2 for research
    """
    if state.get("iteration_count", 0) >= state.get("max_iterations", 2):
        return END
    return RESEARCH_NODE


# ---------------------------------------------------------------------------
# Graph factory
# ---------------------------------------------------------------------------

def build_graph() -> StateGraph:
    """Construct and compile the multi-agent LangGraph."""
    builder = StateGraph(AgentState)

    # Register nodes
    builder.add_node(DRAFT_NODE, agent_draft_generator)
    builder.add_node(RESEARCH_NODE, agent_web_researcher)
    builder.add_node(EVAL_NODE, agent_quality_evaluator)

    # Entry point
    builder.add_edge(START, DRAFT_NODE)

    # After Draft Generator: branch on iteration count
    builder.add_conditional_edges(
        DRAFT_NODE,
        should_continue,
        {
            RESEARCH_NODE: RESEARCH_NODE,
            END: END,
        },
    )

    # Linear edges for the research → evaluation → draft cycle
    builder.add_edge(RESEARCH_NODE, EVAL_NODE)
    builder.add_edge(EVAL_NODE, DRAFT_NODE)

    return builder.compile()


# ---------------------------------------------------------------------------
# Convenience runner (used by both CLI and Streamlit)
# ---------------------------------------------------------------------------

def run_pipeline(
    user_query: str,
    skills: list[str] | None = None,    
    max_iterations: int = 2,
) -> AgentState:
    """
    Execute the full LinkedIn generation pipeline.

    Parameters
    ----------
    user_query      : The topic / brief provided by the user.
    max_iterations  : How many full Draft → Research → Evaluate cycles to run.

    Returns
    -------
    Final AgentState with `final_post` populated.
    """
    graph = build_graph()

    skill_values = (skills or [
        "c# development",
        "AI engineering",
        "enterprise engineering",
        "best practices for production deployment",
    ])[:4]
    skill_values = skill_values + [""] * (4 - len(skill_values))

    initial_state: AgentState = {
        "user_query": user_query,
        "skill_1": skill_values[0],
        "skill_2": skill_values[1],
        "skill_3": skill_values[2],
        "skill_4": skill_values[3],        
        "current_draft": "",
        "web_research": "",
        "evaluation": "",
        "iteration_count": 0,
        "max_iterations": max_iterations,
        "final_post": "",
        "messages": [],
        "agent_log": [],
    }

    final_state = graph.invoke(initial_state)
    return final_state
