import React from 'react';
import { TestimonialItem } from '../../services/homeContentService';

interface TestimonialsProps {
  testimonials?: TestimonialItem[];
}

const Testimonials = ({ testimonials = [] }: TestimonialsProps) => {
  const list = testimonials;

  if (!list.length) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          Testimonials are not configured yet.
        </div>
      </section>
    );
  }

  const row = [...list, ...list];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
          What Customers Say
        </h2>

        <div className="overflow-hidden">
          <div className="marquee-left flex flex-nowrap gap-4 w-max">
            {row.map((t, idx) => (
              <article key={`a-${idx}`} className="w-[320px] md:w-[380px] shrink-0 p-6 rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                <p className="text-gray-700 leading-relaxed">"{t.text}"</p>
                <p className="mt-4 font-bold text-gray-900">{t.name}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-left {
          animation: marqueeLeft 35s linear infinite;
        }
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
