"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Loader2, CheckCircle2, LogIn, PenLine } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { productService } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  onSuccess: (newReview: any) => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const validate = () => {
    const newErrors: { rating?: string; comment?: string } = {};
    if (rating === 0) newErrors.rating = "Please select a star rating.";
    if (comment.trim().length > 0 && comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const newReview = await productService.submitReview(productId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      });

      setSubmitted(true);
      toast.success("Thank you! Your review has been posted.");

      // Map backend shape → frontend review shape
      const mapped = {
        id: newReview.id,
        userId: newReview.userId,
        userName: newReview.user?.name || user?.name || "You",
        userAvatar: newReview.user?.avatarUrl || null,
        rating: newReview.rating,
        title: newReview.title || "",
        comment: newReview.comment || "",
        date: newReview.createdAt,
        verified: false,
      };
      onSuccess(mapped);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setAlreadyReviewed(true);
      } else {
        toast.error(
          err?.response?.data?.message || "Failed to submit review. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#FFA41C]/10 flex items-center justify-center shrink-0">
          <LogIn size={18} className="text-[#FFA41C]" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-bold text-gray-800 mb-0.5">
            Share your experience
          </p>
          <p className="text-xs text-gray-500">
            Log in to write a review for this product.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-xl bg-[#1E1E1E] text-white hover:bg-black font-bold shrink-0"
        >
          <Link href={`/login?redirect=${encodeURIComponent(pathname || "")}`}>
            Log in to Review
          </Link>
        </Button>
      </div>
    );
  }

  // ── Already reviewed ───────────────────────────────────────────────────────
  if (alreadyReviewed) {
    return (
      <div className="mt-6 rounded-xl border border-[#A6D608]/30 bg-[#A6D608]/5 p-5 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-[#A6D608] shrink-0" />
        <p className="text-sm font-bold text-gray-700">
          You have already submitted a review for this product.
        </p>
      </div>
    );
  }

  // ── Submitted successfully ─────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mt-6 rounded-xl border border-[#A6D608]/30 bg-[#A6D608]/5 p-5 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-[#A6D608] shrink-0" />
        <p className="text-sm font-bold text-gray-700">
          Review posted! Thank you for your feedback.
        </p>
      </div>
    );
  }

  // ── Review form ────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <PenLine size={16} className="text-[#C45500]" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Write a Review
        </h3>
      </div>

      {/* Star Rating Picker */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => {
                  setRating(star);
                  setErrors((prev) => ({ ...prev, rating: undefined }));
                }}
                className="transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA41C] rounded"
              >
                <Star
                  size={26}
                  className={
                    filled
                      ? "fill-[#FFA41C] text-[#FFA41C]"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-xs font-bold text-gray-500">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.rating}</p>
        )}
      </div>

      {/* Optional Title */}
      <div>
        <label
          htmlFor="review-title"
          className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5"
        >
          Review Title <span className="text-gray-400 font-normal normal-case">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience..."
          maxLength={120}
          className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFA41C]/40 focus:border-[#FFA41C] transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="review-comment"
          className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5"
        >
          Review <span className="text-gray-400 font-normal normal-case">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors((prev) => ({ ...prev, comment: undefined }));
          }}
          placeholder="What did you like or dislike? Would you recommend this product?"
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FFA41C]/40 focus:border-[#FFA41C] transition-all resize-none placeholder:text-gray-400 leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1">
          {errors.comment ? (
            <p className="text-xs text-red-500 font-medium">{errors.comment}</p>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-gray-400 ml-auto">
            {comment.length}/1000
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-gray-400">
          Posting as <span className="font-bold text-gray-600">{user?.name}</span>
        </p>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#1E1E1E] hover:bg-black text-white font-bold rounded-xl h-10 px-6 text-sm gap-2 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  );
}
