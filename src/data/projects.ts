export interface PortfolioProject {
  slug: string;
  title: string;
  productName: string;
  category: string;
  summary: string;
  problem: string;
  motivation: string;
  solution: string;
  architecture: string[];
  architectureFlow: { label: string; detail: string }[];
  features: string[];
  technologies: string[];
  contribution: string;
  repositoryUrl: string;
  demoUrl?: string;
}

export const projects: PortfolioProject[] = [
  {
    slug: "ai-interview-coach",
    title: "AI Interview Coach Fullstack",
    productName: "InterviewAI",
    category: "AI PRODUCT / FULL-STACK",
    summary:
      "A full-stack interview-practice app with guided mock sessions and a conversational AI interviewer.",
    problem:
      "Interview preparation benefits from both structured practice and room for follow-up conversation. This project brings those two practice modes together in one application.",
    motivation:
      "Built and maintained as part of a hands-on development and learning journey.",
    solution:
      "A role-aware interview practice experience pairs guided mock interviews with answer-by-answer feedback and a one-on-one AI chat interviewer that can ask follow-up questions and review a complete session.",
    architecture: [
      "A React and TypeScript frontend, bundled and served with Vite.",
      "A Python FastAPI backend handles the application API; local Vite development proxies /api requests to it.",
      "SQLAlchemy with SQLite provides the default local persistence.",
      "An OpenAI integration is optional; built-in question banks and local estimated feedback let the app run without a provider key.",
    ],
    architectureFlow: [
      { label: "Client", detail: "React · TypeScript · Vite" },
      { label: "API", detail: "Python · FastAPI" },
      { label: "Persistence", detail: "SQLAlchemy · SQLite" },
      { label: "Interview logic", detail: "Built-in banks · Optional OpenAI" },
    ],
    features: [
      "Guided mock interviews with feedback after each answer.",
      "AI chat interviews with follow-up questions and session reviews.",
      "Role-aware questions for a range of professional fields.",
      "Saved interview history and session analytics.",
      "Optional browser speech input and output.",
    ],
    technologies: [
      "React",
      "TypeScript",
      "Vite",
      "Python",
      "FastAPI",
      "SQLAlchemy",
      "SQLite",
      "OpenAI API (optional)",
    ],
    contribution:
      "Built and maintained the full-stack project, bringing together its interview workflows, frontend experience, backend API, and local data layer.",
    repositoryUrl:
      "https://github.com/Vijay-1420/ai-interview-coach-fullstack",
  },
];
