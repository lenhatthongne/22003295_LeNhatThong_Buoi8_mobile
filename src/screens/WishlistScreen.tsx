
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { BookGrid } from "../components/BookGrid";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";

import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useWishlist } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { Book } from "../types";
import { colors } from "../theme";

export function WishlistScreen({
  navigation,
}: RootScreenProps<"Wishlist">) {
  // ==================================
  // BT8.8b - STATE
  // ==================================
  const { ids } = useWishlist();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

  // ==================================
  // LẤY DANH SÁCH SÁCH TỪ API
  // ==================================
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getBooks();

      setBooks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ==================================
  // BT8.8b - LỌC SÁCH YÊU THÍCH
  // ==================================
  const favorites = useMemo(() => {
    return books.filter((book) =>
      ids.includes(book.id)
    );
  }, [books, ids]);

  // ==================================
  // LOADING
  // ==================================
  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingView label="Đang tải yêu thích..." />
      </View>
    );
  }

  // ==================================
  // LỖI API
  // ==================================
  if (error) {
    return (
      <View style={styles.container}>
        <ErrorView
          message={error}
          onRetry={load}
        />
      </View>
    );
  }

  // ==================================
  // GIAO DIỆN DANH SÁCH YÊU THÍCH
  // ==================================
  return (
    <View style={styles.container}>
      <BookGrid
        data={favorites}
        onPressBook={(book) =>
          navigation.navigate("BookDetail", {
            bookId: book.id,
          })
        }
        ListEmptyComponent={
          <EmptyState
            emoji="💔"
            title="Chưa có sách yêu thích"
            message="Hãy thả tim những cuốn sách bạn thích nhé!"
            actionLabel="Khám phá sách"
            onAction={() =>
              navigation.navigate("Tabs", {
                screen: "Home",
              })
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 10,
  },
});
