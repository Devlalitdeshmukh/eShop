import api from "./api";

export interface HomeStatItem {
  label: string;
  value: number;
  suffix?: string;
  icon?: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
}

export interface HomeContent {
  bestSelling: { title: string };
  seasonal: { title: string };
  stats: HomeStatItem[];
  testimonials: TestimonialItem[];
}

const homeContentService = {
  getHomeContent: () => api.get<HomeContent>("/cms/home"),
};

export default homeContentService;
