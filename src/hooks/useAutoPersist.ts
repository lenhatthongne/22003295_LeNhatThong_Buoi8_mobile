
import { useEffect } from "react";
import { saveJSON } from "../storage/storage";

// BT8.7b - Hook tự động lưu dữ liệu
export function useAutoPersist<T>(
  key: string,
  value: T,
  ready: boolean
) {
  useEffect(() => {
    // Chưa khôi phục dữ liệu thì không ghi
    if (!ready) return;

    // Lưu dữ liệu khi có thay đổi
    const persist = async () => {
      await saveJSON(key, value);
    };

    persist();
  }, [key, value, ready]);
}
