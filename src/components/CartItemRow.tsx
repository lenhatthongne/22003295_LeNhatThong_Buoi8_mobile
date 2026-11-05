
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CartItem } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import {
  colors,
  formatPrice,
  radius,
} from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (
    bookId: number,
    quantity: number
  ) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({
  item,
  onChangeQty,
  onRemove,
}: Props) {
  // BT8.6 - State số lượng cục bộ
  const [qty, setQty] = useState(item.quantity);

  // Chờ 300ms sau khi ngừng bấm
  const debouncedQty = useDebounce(qty, 300);

  // Giữ dữ liệu Redux mới nhất để so sánh
  const latestItem = useRef(item);
  latestItem.current = item;

  // BT8.6 - Đưa số lượng vào Redux
  useEffect(() => {
    if (
      debouncedQty !== latestItem.current.quantity
    ) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [
    debouncedQty,
    item.bookId,
    onChangeQty,
  ]);

  // Đồng bộ khi Redux thay đổi từ nơi khác
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  // Giới hạn số lượng
  const maxStock = Math.max(1, item.stock);

  const canDec = qty > 1;
  const canInc =
    item.stock > 0 && qty < maxStock;

  const decrease = () => {
    if (canDec) {
      setQty((prev) => Math.max(1, prev - 1));
    }
  };

  const increase = () => {
    if (canInc) {
      setQty((prev) =>
        Math.min(maxStock, prev + 1)
      );
    }
  };

  return (
    <View style={styles.row}>
      {/* Ảnh sách */}
      <View
        style={[
          styles.cover,
          {
            backgroundColor: item.color,
          },
        ]}
      >
        <Text style={styles.emoji}>
          {item.emoji}
        </Text>
      </View>

      {/* Thông tin sách */}
      <View style={styles.info}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Text style={styles.price}>
          {formatPrice(item.price)}
        </Text>

        {/* BT8.6 - Bộ điều chỉnh số lượng */}
        <View style={styles.quantityRow}>
          <Pressable
            style={[
              styles.qtyButton,
              !canDec && styles.disabled,
            ]}
            onPress={decrease}
            disabled={!canDec}
            accessibilityRole="button"
            accessibilityLabel="Giảm"
          >
            <Text style={styles.qtyButtonText}>
              −
            </Text>
          </Pressable>

          <Text style={styles.qty}>
            {qty}
          </Text>

          <Pressable
            style={[
              styles.qtyButton,
              !canInc && styles.disabled,
            ]}
            onPress={increase}
            disabled={!canInc}
            accessibilityRole="button"
            accessibilityLabel="Tăng"
          >
            <Text style={styles.qtyButtonText}>
              +
            </Text>
          </Pressable>

          <Text style={styles.stock}>
            Còn {item.stock}
          </Text>
        </View>
      </View>

      {/* Nút xóa sản phẩm */}
      <Pressable
        onPress={() => onRemove(item.bookId)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Xóa khỏi giỏ"
      >
        <Text style={styles.trash}>
          🗑️
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 5,
    gap: 10,
  },

  cover: {
    width: 54,
    height: 72,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  emoji: {
    fontSize: 26,
  },

  info: {
    flex: 1,
    gap: 5,
  },

  title: {
    fontWeight: "700",
    color: colors.text,
  },

  price: {
    color: colors.indigo,
    fontWeight: "800",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },

  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },

  qtyButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.indigo,
  },

  disabled: {
    opacity: 0.35,
  },

  qty: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.navy,
    minWidth: 18,
    textAlign: "center",
  },

  stock: {
    fontSize: 12,
    color: colors.muted,
  },

  trash: {
    fontSize: 22,
  },
});
