// agent-notes: { ctx: "Prompts category page disabled and hidden from marketplace", deps: ["next/navigation"], state: active, last: "sato@2026-08-21" }
import { notFound } from 'next/navigation';

export default function PromptsPage() {
    // Prompts section is hidden/disabled
    return notFound();
}
