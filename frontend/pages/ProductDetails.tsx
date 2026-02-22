import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  User as UserIcon,
  Send,
  Package,
  ShieldCheck,
  Truck,
  BadgeCheck,
} from "lucide-react";
import { useStore } from "../store";
import { useToast } from "../context/ToastContext";
import GeminiChef from "../components/GeminiChef";
import { Review, ProductVariant } from "../types";
import api from "../services/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, user, addReview } = useStore();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch(() => undefined);
  }, [id]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  if (!product) {
    return (
      <div className="p-10 text-center">
        Product not found{" "}
        <button onClick={() => navigate("/shop")} className="text-brand-600 underline">
          Go Back
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? (product.discountPrice || product.price);
  const currentStock = selectedVariant?.stock ?? product.stock;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant || undefined);
    addToast(
      `Added ${quantity} ${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ""} to cart!`,
      "success"
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);

    try {
      await addReview(id, rating, comment);
      const newReview: Review = {
        id: Date.now().toString(),
        userId: String(user?.id || ""),
        userName: user?.name || "You",
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(5);
      addToast("Review submitted successfully!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-brand-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="relative h-[420px] md:h-[520px] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-8">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full max-h-[500px] object-contain transition-transform hover:scale-105 duration-500"
              />
              {product.discountPrice && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Save ₹{product.price - product.discountPrice}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 border-t border-gray-100 text-center">
              <div className="p-3">
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-semibold text-gray-900">{product.category}</p>
              </div>
              <div className="p-3 border-x border-gray-100">
                <p className="text-xs text-gray-500">Brand</p>
                <p className="font-semibold text-gray-900">{product.brand}</p>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">Stock</p>
                <p className={`font-semibold ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}>
                  {currentStock > 0 ? `${currentStock} Left` : "Out"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-brand-700 bg-brand-50 border border-brand-100 font-bold tracking-wider uppercase text-xs px-2 py-1 rounded-full">
                {product.category}
              </span>
              <span className="text-blue-700 bg-blue-50 border border-blue-100 font-bold tracking-wider uppercase text-xs px-2 py-1 rounded-full">
                {product.brand}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(product.rating) ? "fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm">{product.reviews} reviews</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">Freshly packed and hygienic</span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-black text-gray-900">₹{currentPrice}</span>
              {product.discountPrice && !selectedVariant?.price && (
                <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
              )}
            </div>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">{product.description}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Choose Size / Weight
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedVariant?.id === v.id
                          ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-brand-200 hover:bg-gray-50"
                      }`}
                    >
                      {v.name} {v.price ? `(₹${v.price})` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-xl w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-brand-600 disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 font-bold text-lg w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-brand-600">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200 disabled:bg-gray-300 disabled:shadow-none"
              >
                <ShoppingCart className="w-5 h-5" /> {currentStock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-700">
                <Truck className="w-4 h-4 text-brand-600" />
                Fast shipping
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-700">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Hygienic packing
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2 text-sm text-gray-700">
                <BadgeCheck className="w-4 h-4 text-brand-600" />
                Quality assured
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Availability:</span>
                  <span className={`font-medium ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {currentStock > 0 ? `In Stock (${currentStock})` : "Out of Stock"}
                  </span>
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-500">Delivery:</span>
                  <span className="ml-2 font-medium">Estimated 2-4 Days</span>
                </div>
              </div>
            </div>

            <GeminiChef productName={product.name} />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white border border-gray-100 p-6 rounded-2xl h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Review</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                          <Star className={`w-8 h-8 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      rows={4}
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you think about this product?"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please login to write a review.</p>
                  <Link to="/login" className="text-brand-600 font-bold hover:underline">
                    Login Now
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900">{review.userName}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No reviews yet. Be the first to review this product!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
