import React from 'react';
import PageHero from '../components/PageHero';
import BestSellingProducts from '../components/home/BestSellingProducts';
import SeasonalPopularProducts from '../components/home/SeasonalPopularProducts';
import AnimatedStats from '../components/home/AnimatedStats';
import Testimonials from '../components/home/Testimonials';
import homeContentService, { HomeContent } from '../services/homeContentService';

const Home = () => {
  const [homeContent, setHomeContent] = React.useState<HomeContent | null>(null);

  React.useEffect(() => {
    const loadHomeContent = async () => {
      try {
        const { data } = await homeContentService.getHomeContent();
        setHomeContent(data);
      } catch {
        setHomeContent(null);
      }
    };
    loadHomeContent();
  }, []);

  return (
    <div>
      {/* HeroSection */}
      <PageHero
        title="Taste the Love of Homemade Tradition"
        subtitle="Authentic Achars, Crispy Papads, and Spicy Namkeens made from generations-old recipes."
        imageUrl="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1800&q=80"
        ctaLabel="Shop Now"
        ctaTo="/shop"
      />

      {/* BestSellingProducts */}
      <BestSellingProducts title={homeContent?.bestSelling?.title} />

      {/* SeasonalPopularProducts */}
      <SeasonalPopularProducts title={homeContent?.seasonal?.title} />

      {/* AnimatedStats */}
      <AnimatedStats stats={homeContent?.stats} />

      {/* Testimonials */}
      <Testimonials testimonials={homeContent?.testimonials} />
    </div>
  );
};

export default Home;
