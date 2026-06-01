export interface Artifact {
  id: string;
  title: string;
  description: string;
  source: string;
  imageUrls: string[];
  thumbnailUrls?: string[];
  theme: string;
  subtheme: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  artifacts: Artifact[];
}

export interface Exhibition {
  id: string;
  title: string;
  description: string;
  prologue: string;
  units: Unit[];
  coverImage?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
}
