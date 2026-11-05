
import { useEffect, useState } from "react";

import {
  useAppDispatch,
  useAppSelector,
} from "../store/hooks";

import { setCredentials } from "../store/authSlice";
import { hydrateCart } from "../store/cartSlice";
import { hydrateWishlist } from "../store/wishlistSlice";

import {
  clearAuth,
  loadAuth,
  saveAuth,
} from "../storage/authStorage";

import { loadJSON } from "../storage/storage";
import { useAutoPersist } from "./useAutoPersist";
import type { CartItem } from "../types";

// Khóa lưu dữ liệu
export const CART_KEY = "@bookstore/cart";
export const WISHLIST_KEY = "@bookstore/wishlist";

export function usePersistence() {
  const dispatch = useAppDispatch();

  // Đã khôi phục dữ liệu hay chưa
  const [ready, setReady] = useState(false);

  // ====================================
  // LẤY DỮ LIỆU TỪ REDUX
  // ====================================

  // Thông tin đăng nhập - BT8.3
  const user = useAppSelector(
    (state) => state.auth.user
  );

  const token = useAppSelector(
    (state) => state.auth.token
  );

  // Giỏ hàng - BT8.7
  const cartItems = useAppSelector(
    (state) => state.cart.items
  );

  // Danh sách yêu thích - BT8.7
  const wishlistIds = useAppSelector(
    (state) => state.wishlist.ids
  );

  // ====================================
  // BT8.3 + BT8.7
  // KHÔI PHỤC DỮ LIỆU KHI MỞ APP
  // ====================================
  useEffect(() => {
    let active = true;

    const restoreData = async () => {
      try {
        // Đọc đồng thời 3 loại dữ liệu
        const [auth, cart, wish] = await Promise.all([
          loadAuth(),
          loadJSON<CartItem[]>(CART_KEY),
          loadJSON<number[]>(WISHLIST_KEY),
        ]);

        if (!active) return;

        // BT8.3 - Khôi phục phiên đăng nhập
        if (auth?.user && auth?.token) {
          dispatch(setCredentials(auth));
        }

        // BT8.7 - Khôi phục giỏ hàng
        if (cart !== null && Array.isArray(cart)) {
          dispatch(hydrateCart(cart));
        }

        // BT8.7 - Khôi phục yêu thích
        if (wish !== null && Array.isArray(wish)) {
          dispatch(hydrateWishlist(wish));
        }

      } catch (error) {
        console.error(
          "Lỗi khôi phục dữ liệu:",
          error
        );
      } finally {
        if (active) {
          // Chỉ cho phép ghi sau khi đọc xong
          setReady(true);
        }
      }
    };

    restoreData();

    return () => {
      active = false;
    };
  }, [dispatch]);

  // ====================================
  // BT8.3 - TỰ ĐỘNG LƯU PHIÊN ĐĂNG NHẬP
  // ====================================
  useEffect(() => {
    if (!ready) return;

    const persistAuth = async () => {
      if (user && token) {
        // Đăng nhập -> lưu thông tin
        await saveAuth({
          user,
          token,
        });
      } else {
        // Đăng xuất -> xóa phiên
        await clearAuth();
      }
    };

    persistAuth();
  }, [ready, user, token]);

  // ====================================
  // BT8.7 - TỰ ĐỘNG LƯU GIỎ HÀNG
  // ====================================
  useAutoPersist(
    CART_KEY,
    cartItems,
    ready
  );

  // ====================================
  // BT8.7 - TỰ ĐỘNG LƯU YÊU THÍCH
  // ====================================
  useAutoPersist(
    WISHLIST_KEY,
    wishlistIds,
    ready
  );

  // Chỉ hiển thị app khi đã khôi phục xong
  return ready;
}
