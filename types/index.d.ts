interface Job {
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
}

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
  jobKey?: string;
  version?: number;
  createdAt?: string;
  previousResumeId?: string | null;
  comparison?: ResumeComparison;
}

interface ResumeComparison {
  previousResumeId: string;
  overallDelta: number;
  atsDelta: number;
  jdMatchDelta: number | null;
}

interface Feedback {
  overallScore: number;
  actionPlan?: {
    priority: "high" | "medium" | "low";
    task: string;
    reason?: string;
  }[];
  jdMatch?: {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    priorityImprovements: string[];
  };
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}