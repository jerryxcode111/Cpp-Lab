export interface LearnStepItem {
  label: string;
  detail: string;
}

export interface LearnTable {
  headers: string[];
  rows: string[][];
}

export interface LearnCodeExample {
  title: string;
  description: string;
  code: string;
  output: string;
}

export interface LearnLesson {
  id: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  shortTitle: string;
  summary: string;
  steps: LearnStepItem[];
  quickTable?: LearnTable;
  syntaxPattern: string;
  quickSnippet: string;
  workingExampleCode: string;
  workingExampleDefaultOutput: string;
  moreExample: LearnCodeExample;
  rulesHeading: string;
  rules: Array<{ text: string; codes?: string[] }>;
  commonMistakeTitle: string;
  commonMistakeBody: string;
}

export interface LearnCategory {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  count: number;
  lessons: LearnLesson[];
}
