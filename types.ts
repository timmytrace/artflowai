
export interface Painting {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
}

export interface Review {
  id: string;
  paintingTitle: string;
  name: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO String
}

export interface LessonStep {
  stepNumber: number;
  title: string;
  instruction: string;
  brushes: string[]; // e.g., ['Large Flat', 'Round']
  colors: string[]; // Hex codes needed for this step
  visualDescription: string; // Description of what the canvas should look like
}

export interface PaintingLesson {
  paintingTitle: string;
  steps: LessonStep[];
}
