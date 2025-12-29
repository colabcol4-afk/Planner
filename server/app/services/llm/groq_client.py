"""
Groq LLM Client with streaming and tool calling support.
Uses openai/gpt-oss-120b model.
"""
from groq import Groq, AsyncGroq
from typing import AsyncGenerator, List, Dict, Any, Optional
import json
from datetime import datetime

from app.config import settings
from app.services.tools.schemas import TOOL_SCHEMAS
from app.services.llm.prompts import get_system_prompt


class GroqLLMClient:
    """Client for Groq API with GPT-OSS-120B model."""

    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.async_client = AsyncGroq(api_key=api_key)
        self.model = settings.llm_model

    def build_messages(
        self,
        user_message: str,
        conversation_history: List[Dict[str, Any]],
        user_context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Build the full message list for the API call."""
        system_prompt = get_system_prompt(
            user_context=user_context,
            current_date=datetime.now().strftime("%Y-%m-%d"),
            current_time=datetime.now().strftime("%H:%M")
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last N messages)
        max_history = 20
        if conversation_history:
            messages.extend(conversation_history[-max_history:])

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        return messages

    async def chat_stream(
        self,
        user_message: str,
        conversation_history: List[Dict[str, Any]],
        user_context: Dict[str, Any],
        reasoning_effort: str = "medium"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream chat completion with tool calling support.

        Yields chunks with type: 'content', 'tool_call', or 'done'
        """
        messages = self.build_messages(user_message, conversation_history, user_context)

        try:
            stream = await self.async_client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                stream=True,
                max_tokens=settings.llm_max_tokens,
                temperature=settings.llm_temperature,
            )

            tool_calls_buffer: Dict[int, Dict[str, Any]] = {}
            accumulated_content = ""

            async for chunk in stream:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta
                finish_reason = chunk.choices[0].finish_reason

                # Handle content streaming
                if delta.content:
                    accumulated_content += delta.content
                    yield {
                        "type": "content",
                        "content": delta.content,
                        "is_final": False
                    }

                # Handle tool calls
                if delta.tool_calls:
                    for tool_call in delta.tool_calls:
                        idx = tool_call.index
                        if idx not in tool_calls_buffer:
                            tool_calls_buffer[idx] = {
                                "id": tool_call.id or "",
                                "name": "",
                                "arguments": ""
                            }

                        if tool_call.function:
                            if tool_call.function.name:
                                tool_calls_buffer[idx]["name"] = tool_call.function.name
                            if tool_call.function.arguments:
                                tool_calls_buffer[idx]["arguments"] += tool_call.function.arguments

                # Check for finish
                if finish_reason:
                    if finish_reason == "tool_calls":
                        for idx, tc in sorted(tool_calls_buffer.items()):
                            try:
                                args = json.loads(tc["arguments"]) if tc["arguments"] else {}
                            except json.JSONDecodeError:
                                args = {}

                            yield {
                                "type": "tool_call",
                                "id": tc["id"],
                                "name": tc["name"],
                                "arguments": args
                            }

                    yield {
                        "type": "done",
                        "finish_reason": finish_reason,
                        "full_content": accumulated_content
                    }

        except Exception as e:
            yield {
                "type": "error",
                "error": str(e)
            }

    async def chat(
        self,
        user_message: str,
        conversation_history: List[Dict[str, Any]],
        user_context: Dict[str, Any],
        reasoning_effort: str = "medium"
    ) -> Dict[str, Any]:
        """Non-streaming chat completion."""
        messages = self.build_messages(user_message, conversation_history, user_context)

        try:
            response = await self.async_client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                max_tokens=settings.llm_max_tokens,
                temperature=settings.llm_temperature,
            )

            choice = response.choices[0]
            result = {
                "content": choice.message.content or "",
                "finish_reason": choice.finish_reason,
                "tool_calls": []
            }

            if choice.message.tool_calls:
                for tc in choice.message.tool_calls:
                    try:
                        args = json.loads(tc.function.arguments) if tc.function.arguments else {}
                    except json.JSONDecodeError:
                        args = {}

                    result["tool_calls"].append({
                        "id": tc.id,
                        "name": tc.function.name,
                        "arguments": args
                    })

            return result

        except Exception as e:
            return {
                "content": "",
                "finish_reason": "error",
                "tool_calls": [],
                "error": str(e)
            }

    async def continue_with_tool_results(
        self,
        conversation_history: List[Dict[str, Any]],
        tool_results: List[Dict[str, Any]],
        user_context: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Continue conversation after tool execution."""
        system_prompt = get_system_prompt(
            user_context=user_context,
            current_date=datetime.now().strftime("%Y-%m-%d"),
            current_time=datetime.now().strftime("%H:%M")
        )

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)

        # Add tool results
        for result in tool_results:
            messages.append({
                "role": "tool",
                "tool_call_id": result["tool_call_id"],
                "content": json.dumps(result["result"])
            })

        try:
            stream = await self.async_client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
                stream=True,
                max_tokens=settings.llm_max_tokens,
                temperature=settings.llm_temperature,
            )

            async for chunk in stream:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta
                finish_reason = chunk.choices[0].finish_reason

                if delta.content:
                    yield {
                        "type": "content",
                        "content": delta.content,
                        "is_final": False
                    }

                if finish_reason:
                    yield {
                        "type": "done",
                        "finish_reason": finish_reason
                    }

        except Exception as e:
            yield {
                "type": "error",
                "error": str(e)
            }
