from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import END, StateGraph, MessagesState

from typing import List
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent / ".env")

# initializes the language model
llm = ChatOpenAI(
    model="gpt-4.1-nano",
)

generation_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a professional LinkedIn content assistant tasked with crafting engaging, insightful, and well-structured LinkedIn posts."
            " Generate the best LinkedIn post possible for the user's request."
            " If the user provides feedback or critique, respond with a refined version of your previous attempts, improving clarity, tone, or engagement as needed.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

# Creating the generation chain for the post generation
generate_chain = generation_prompt | llm

reflection_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a professional LinkedIn content strategist and thought leadership expert. Your task is to critically evaluate the given LinkedIn post and provide a comprehensive critique. Follow these guidelines:

        1. Assess the post’s overall quality, professionalism, and alignment with LinkedIn best practices.
        2. Evaluate the structure, tone, clarity, and readability of the post.
        3. Analyze the post’s potential for engagement (likes, comments, shares) and its effectiveness in building professional credibility.
        4. Consider the post’s relevance to the author’s industry, audience, or current trends.
        5. Examine the use of formatting (e.g., line breaks, bullet points), hashtags, mentions, and media (if any).
        6. Evaluate the effectiveness of any call-to-action or takeaway.

        Provide a detailed critique that includes:
        - A brief explanation of the post’s strengths and weaknesses.
        - Specific areas that could be improved.
        - Actionable suggestions for enhancing clarity, engagement, and professionalism.

        Your critique will be used to improve the post in the next revision step, so ensure your feedback is thoughtful, constructive, and practical.
        """
    ),
    MessagesPlaceholder(variable_name="messages")
])

# Creating the reflection chain for the post critique
reflect_chain = reflection_prompt | llm

# Initialize a predefined StateGraph
graph = StateGraph(MessagesState)

# Define the structure of the LinkedIn post generation state
def generation_node(state):
    messages = state["messages"]
    generated_post = generate_chain.invoke({"messages": messages})
    return {"messages": [AIMessage(content=generated_post.content)]}

# Define the reflection node that takes user feedback and provides a critique for improvement
def reflection_node(state):
    messages = state["messages"]
    res = reflect_chain.invoke({"messages": messages})  # Passes messages as input to reflect_chain
    return {"messages": [HumanMessage(content=res.content)]} # Returns the refined message as HumanMessage for feedback

# define if the cycle generation/reflection should continue or terminate
def should_continue(state: List[BaseMessage]):
    print(state)
    print(len(state["messages"]))
    print("----------------------------------------------------------------------")
    if len(state["messages"]) > 6:
        return END
    return "reflect"

graph.add_node("generate", generation_node)
graph.add_node("reflect", reflection_node)
graph.add_edge("reflect", "generate")
graph.set_entry_point("generate")
graph.add_conditional_edges("generate", should_continue)

workflow = graph.compile()

def generate_post(user_prompt: str) -> str:
    result = workflow.invoke({
        "messages": [HumanMessage(content=user_prompt)]
    })
    return result["messages"][-3].content # this is the end message before revisor acknowledgmenmt 
