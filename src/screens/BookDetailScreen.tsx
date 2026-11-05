
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { RatingStars } from "../components/RatingStars";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { BookCard } from "../components/BookCard";
import { HeartButton } from "../components/HeartButton";

import {
  getBookById,
  getBooks,
} from "../services/bookService";

import {
  addReview,
  getReviews,
} from "../services/reviewService";

import { getErrorMessage } from "../api/client";
import { useAuth, useCart } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import type { Book, Review } from "../types";

import {
  colors,
  formatPrice,
  radius,
} from "../theme";

export function BookDetailScreen({
  navigation,
  route,
}: RootScreenProps<"BookDetail">) {
  const { bookId } = route.params;

  const { add } = useCart();
  const { user, isLoggedIn } = useAuth();

  // Thông tin sách
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // BT8.C1 - Danh sách sách liên quan
  const [related, setRelated] = useState<Book[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // BT8.5 - Form đánh giá
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<
    string | null
  >(null);
  const [sending, setSending] = useState(false);

  // =====================================
  // LẤY CHI TIẾT SÁCH + ĐÁNH GIÁ
  // + SÁCH LIÊN QUAN
  // =====================================
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRelated([]);

    try {
      // Lấy thông tin sách và đánh giá
      const [b, r] = await Promise.all([
        getBookById(bookId),
        getReviews(bookId),
      ]);

      setBook(b);
      setReviews(r);

      // =================================
      // BT8.C1 - LẤY SÁCH CÙNG DANH MỤC
      // =================================

      // Gọi API với categoryId hiện tại
      const books = await getBooks({
        categoryId: b.categoryId,
      });

      // Loại bỏ cuốn đang xem
      const filtered = books.filter(
        (item) =>
          item.id !== b.id &&
          item.categoryId === b.categoryId
      );

      // Lưu danh sách liên quan
      setRelated(filtered);

    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  // =====================================
  // BT8.5b - ĐIỂM ĐÁNH GIÁ TRUNG BÌNH
  // =====================================
  const average = useMemo(() => {
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce(
      (total, r) => total + r.rating,
      0
    );

    return sum / reviews.length;
  }, [reviews]);

  // =====================================
  // BT8.5c - GỬI ĐÁNH GIÁ
  // =====================================
  const submitReview = async () => {
    if (!user || sending) return;

    setFormError(null);

    if (rating === 0) {
      setFormError("Vui lòng chọn số sao");
      return;
    }

    if (!comment.trim()) {
      setFormError("Vui lòng nhập bình luận");
      return;
    }

    try {
      setSending(true);

      const created = await addReview({
        bookId,
        userId: user.id,
        userName: user.name,
        rating,
        comment: comment.trim(),
      });

      setReviews((prev) => [
        created,
        ...prev,
      ]);

      setRating(0);
      setComment("");
      setFormError(null);

    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  // =====================================
  // BT8.C1 - CHUYỂN ĐẾN SÁCH LIÊN QUAN
  // =====================================
  const openRelatedBook = (selected: Book) => {
    // push tạo trang chi tiết mới
    // để có thể quay lại sách ban đầu
    navigation.push("BookDetail", {
      bookId: selected.id,
    });
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error || !book) {
    return (
      <ErrorView
        message={error ?? "Không tìm thấy sách."}
        onRetry={load}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Ảnh bìa */}
      <View
        style={[
          styles.cover,
          { backgroundColor: book.color },
        ]}
      >
        <Text style={styles.emoji}>
          {book.emoji}
        </Text>

        <HeartButton
          bookId={book.id}
          size={40}
        />
      </View>

      {/* Tên sách */}
      <Text style={styles.title}>
        {book.title}
      </Text>

      <Text style={styles.author}>
        {book.author}
      </Text>

      {/* BT8.5 - Điểm trung bình */}
      <View style={styles.ratingRow}>
        <RatingStars
          value={average}
          size={20}
        />

        <Text style={styles.ratingText}>
          {reviews.length
            ? `${average.toFixed(1)} (${reviews.length} đánh giá)`
            : "Chưa có đánh giá"}
        </Text>
      </View>

      <Text style={styles.price}>
        {formatPrice(book.price)}
      </Text>

      <Text style={styles.stock}>
        Còn {book.stock} cuốn
      </Text>

      <Text style={styles.desc}>
        {book.description}
      </Text>

      {/* Thêm vào giỏ */}
      <PrimaryButton
        title="Thêm vào giỏ"
        disabled={book.stock <= 0}
        onPress={() =>
          add({
            bookId: book.id,
            title: book.title,
            price: book.price,
            emoji: book.emoji,
            color: book.color,
            stock: book.stock,
          })
        }
      />

      {/* BT8.5 - Form đánh giá */}
      <Text style={styles.h}>
        Đánh giá của độc giả
      </Text>

      {isLoggedIn ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            Viết đánh giá của bạn
          </Text>

          <RatingStars
            value={rating}
            size={30}
            onChange={(value) => {
              setRating(value);
              setFormError(null);
            }}
          />

          <FormField
            label="Bình luận"
            value={comment}
            onChangeText={(value) => {
              setComment(value);
              setFormError(null);
            }}
            multiline
            placeholder="Cảm nhận của bạn về cuốn sách…"
            autoCapitalize="sentences"
            style={{
              minHeight: 70,
              textAlignVertical: "top",
            }}
          />

          {formError ? (
            <Text style={styles.formError}>
              {formError}
            </Text>
          ) : null}

          <PrimaryButton
            title="Gửi đánh giá"
            onPress={submitReview}
            loading={sending}
          />
        </View>
      ) : (
        <View style={styles.loginHint}>
          <Text style={styles.loginHintText}>
            Đăng nhập để viết đánh giá.
          </Text>

          <PrimaryButton
            title="Đăng nhập"
            variant="outline"
            onPress={() =>
              navigation.navigate("Login")
            }
          />
        </View>
      )}

      {/* Danh sách đánh giá */}
      {reviews.length === 0 ? (
        <Text style={styles.muted}>
          Hãy là người đầu tiên đánh giá
          cuốn sách này.
        </Text>
      ) : (
        reviews.map((r) => (
          <View
            key={r.id}
            style={styles.review}
          >
            <View style={styles.reviewHead}>
              <Text style={styles.reviewer}>
                {r.userName}
              </Text>

              <RatingStars
                value={r.rating}
                size={14}
              />
            </View>

            <Text style={styles.reviewBody}>
              {r.comment}
            </Text>
          </View>
        ))
      )}

      {/* =================================
          BT8.C1 - SÁCH LIÊN QUAN
          ================================= */}

      {related.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.h}>
            Sách liên quan
          </Text>

          <Text style={styles.relatedHint}>
            Các sách cùng danh mục
          </Text>

          <FlatList
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            data={related}
            keyExtractor={(item) =>
              String(item.id)
            }
            contentContainerStyle={
              styles.relatedList
            }
            renderItem={({ item }) => (
              <View style={styles.relatedItem}>
                <BookCard
                  book={item}
                  onPress={openRelatedBook}
                />
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  cover: {
    height: 220,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: 8,
  },
  author: {
    color: colors.muted,
    fontSize: 15,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingText: {
    color: colors.muted,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.indigo,
  },
  stock: {
    color: colors.muted,
  },
  desc: {
    color: colors.text,
    lineHeight: 22,
    marginVertical: 4,
  },
  h: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.navy,
    marginTop: 18,
  },
  form: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: radius.md,
    gap: 10,
  },
  formTitle: {
    fontWeight: "800",
    color: colors.text,
  },
  formError: {
    color: colors.danger,
  },
  loginHint: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: radius.md,
    gap: 8,
  },
  loginHintText: {
    color: colors.muted,
  },
  muted: {
    color: colors.muted,
  },
  review: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: radius.md,
    gap: 4,
  },
  reviewHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewer: {
    fontWeight: "800",
    color: colors.text,
  },
  reviewBody: {
    color: colors.text,
  },

  // BT8.C1 - Giao diện sách liên quan
  relatedSection: {
    marginTop: 16,
    gap: 8,
  },
  relatedHint: {
    color: colors.muted,
    fontSize: 13,
  },
  relatedList: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  relatedItem: {
    width: 165,
  },
});
