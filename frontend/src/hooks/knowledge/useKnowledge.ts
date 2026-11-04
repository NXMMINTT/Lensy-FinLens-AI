"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { KnowledgeTopic, TopicScript } from "@/types/knowledge";

/** The knowledge library (title, category, outline) — served from mock data, no AI cost. */
export function useKnowledgeTopics() {
  return useQuery({
    queryKey: ["knowledge", "topics"],
    queryFn: () => apiFetch<KnowledgeTopic[]>("/api/knowledge/topics"),
    staleTime: 60 * 60 * 1000,
  });
}

/** On-demand: U-Fox writes a short briefing for one topic (Gemini, cached on the server). */
export function useTopicScript() {
  return useMutation({
    mutationFn: (topicId: string) => apiFetch<TopicScript>(`/api/knowledge/topics/${topicId}/script`),
  });
}

export type TopicAudio = TopicScript & { audio_base64: string; audio_mime: string };

/** On-demand: the briefing read aloud (Gemini + ElevenLabs). Needs voice keys on the server. */
export function useTopicAudio() {
  return useMutation({
    mutationFn: ({ topicId, lang = "th" }: { topicId: string; lang?: string }) =>
      apiFetch<TopicAudio>(`/api/knowledge/topics/${topicId}/audio?lang=${lang}`),
  });
}
