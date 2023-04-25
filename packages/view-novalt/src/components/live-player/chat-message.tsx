import { LiveEventStruct } from "@sopia-bot/core";

export type ChatMessageProps = {
  value: LiveEventStruct,
};

export default function ChatMessage(props: ChatMessageProps) {
  return <div>{props.value.event}</div>
}