
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { useStore } from '../store';
import ProductCard from '../components/ProductCard';
import PageHero from '../components/PageHero';

const About = () => {

    const { products, aboutus, refreshAboutus } = useStore();
    const featuredProducts = products.slice(0, 4);

    React.useEffect(() => {
        refreshAboutus();
    }, []);

    return (
        <div>
              <PageHero
                title="Healthy Foods for a Happy Life"
                subtitle="Discover our story, our values, and our authentic homemade taste."
                imageUrl="https://images.unsplash.com/photo-1464219222984-216ebffaaf85?auto=format&fit=crop&w=1800&q=80"
                ctaLabel="Shop Now"
                ctaTo="/shop"
              />

              <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                    {/* Dynamic About Us Content */}
                    {aboutus.length > 0 ? (
                        <div className="space-y-8 mb-8">
                            {aboutus.map((section) => (
                                <div key={section.id}>
                                    <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">{section.title}</h2>
                                    <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {section.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            100% Natural Products
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            100% Natural Products
                            </p>
                        </>
                    )}
                  </div>
              </section>
        
              {/* Features */}
              <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <Leaf className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">100% Natural</h3>
                      <p className="text-gray-500">No artificial preservatives or colors. Just like Mom makes it.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">Hygienically Packed</h3>
                      <p className="text-gray-500">Vacuum sealed jars ensuring freshness and safety delivered to you.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">Fast Delivery</h3>
                      <p className="text-gray-500">Shipping across India. Get your cravings fixed in 2-3 days.</p>
                    </div>
                  </div>
                </div>
              </section>
        
              {/* Featured Products */}
              <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Customer Favorites</span>
                      <h2 className="font-serif text-3xl font-bold text-gray-900 mt-2">Trending Delights</h2>
                    </div>
                    <Link to="/shop" className="hidden md:flex items-center text-brand-600 font-semibold hover:text-brand-700">
                      View All <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  <div className="mt-12 text-center md:hidden">
                    <Link to="/shop" className="inline-flex items-center text-brand-600 font-semibold hover:text-brand-700">
                      View All <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </section>
            </div>
    );
};

export default About;   
