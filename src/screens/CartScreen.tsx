
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { TodoBox } from "../components/TodoBox";
import { Header } from "../components/Header";
import { CartItemRow } from "../components/CartItemRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";

import { useCart, useAuth } from "../store/hooks";
import { confirmDialog } from "../utils/dialog";
import { TabScreenProps } from "../navigation/types";
import { colors, formatPrice } from "../theme";

export function CartScreen({
  navigation,
}: TabScreenProps<"Cart">) {
  // Lấy dữ liệu giỏ hàng
  const {
    items,
    totalPrice,
    setQty,
    remove,
  } = useCart();

  // BT8.4 - Kiểm tra trạng thái đăng nhập
  const { isLoggedIn } = useAuth();

  // Tổng tiền cuối cùng
  // BT8.C2 sẽ bổ sung mã giảm giá
  const finalTotal = totalPrice;

  // BT8.7 - Xóa có xác nhận
  // Sẽ hoàn thiện ở bài tiếp theo
 
const askRemove = (bookId: number) => {
  // Tìm tên sách cần xóa
  const item = items.find(
    (i) => i.bookId === bookId
  );

  if (!item) return;

  // BT8.7a - Hỏi xác nhận trước khi xóa
  confirmDialog(
    "Xóa sản phẩm",
    `Bạn có chắc muốn xóa "${item.title}" khỏi giỏ hàng không?`,
    () => {
      remove(bookId);
    }
  );
};


  // ====================================
  // BT8.4 - BẢO VỆ THANH TOÁN
  // ====================================
  const goCheckout = () => {
    // Nếu đã đăng nhập
    if (isLoggedIn) {
      navigation.navigate("Checkout", {
        total: finalTotal,
      });
    } else {
      // Chưa đăng nhập -> sang Login
      // Đồng thời lưu tổng tiền và đích đến
      navigation.navigate("Login", {
        redirectTo: "Checkout",
        total: finalTotal,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header title="🛒 Giỏ hàng" />

      <FlatList
        data={items}
        keyExtractor={(item) =>
          String(item.bookId)
        }
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onChangeQty={setQty}
            onRemove={askRemove}
          />
        )}
        contentContainerStyle={{
          paddingVertical: 8,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <EmptyState
            emoji="🛒"
            title="Giỏ hàng trống"
            message="Hãy chọn vài cuốn sách yêu thích nhé."
            actionLabel="Khám phá sách"
            onAction={() =>
              navigation.navigate("Home")
            }
          />
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>

          {/* BT8.C2 - Mã giảm giá */}
          <TodoBox id="BT8.C2">
            THỬ THÁCH: Mã giảm giá SALE10
            hoặc GIAM50K.
          </TodoBox>

          {/* Tạm tính */}
          <View style={styles.line}>
            <Text style={styles.muted}>
              Tạm tính
            </Text>
            <Text style={styles.value}>
              {formatPrice(totalPrice)}
            </Text>
          </View>

          {/* Tổng cộng */}
          <View style={styles.line}>
            <Text style={styles.total}>
              Tổng cộng
            </Text>
            <Text style={styles.total}>
              {formatPrice(finalTotal)}
            </Text>
          </View>

          {/* Nút Thanh toán */}
          <PrimaryButton
            title="Thanh toán"
            onPress={goCheckout}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  footer: {
    backgroundColor: "#fff",
    padding: 14,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  muted: {
    color: colors.muted,
  },
  value: {
    fontWeight: "700",
    color: colors.text,
  },
  total: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.navy,
  },
});
