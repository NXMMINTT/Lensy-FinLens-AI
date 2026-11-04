export type KnowledgeTopic = {
  topic_id: string;
  title: string;
  category: string;
  outline: string[];
};

export type TopicScript = KnowledgeTopic & { script: string };
