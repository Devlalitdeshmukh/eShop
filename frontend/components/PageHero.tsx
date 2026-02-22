import React from 'react';
import { Link } from 'react-router-dom';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaTo?: string;
}

const PageHero = ({ title, subtitle, imageUrl, ctaLabel, ctaTo }: PageHeroProps) => {
  return (
    <section className="relative min-h-[320px] md:min-h-[380px] overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg md:text-xl text-gray-100 leading-relaxed">
              {subtitle}
            </p>
          )}

          {ctaLabel && ctaTo && (
            <Link
              to={ctaTo}
              className="inline-flex mt-8 items-center justify-center px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
