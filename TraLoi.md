# TRẢ LỜI CÂU HỎI BỔ SUNG – BUỔI 8 BOOKSTORE

## Câu 1. Cờ `ready`

Nếu bỏ điều kiện `ready` trong `useAutoPersist`, ở lần render đầu tiên Redux có thể vẫn chứa giỏ hàng rỗng (`[]`) vì dữ liệu từ AsyncStorage chưa được đọc xong. Effect lưu dữ liệu sẽ ghi mảng rỗng này vào `@bookstore/cart`, có nguy cơ ghi đè giỏ hàng của lần sử dụng trước. Khi quá trình khôi phục chạy sau đó, ứng dụng có thể đọc phải dữ liệu đã bị ghi đè và mất giỏ hàng cũ. Vì vậy, chỉ gọi `saveJSON` khi `ready === true`, tức là sau khi hoàn tất khôi phục dữ liệu.

## Câu 2. Token giả và bảo mật

Thứ nhất, nếu ứng dụng tự lấy thông tin người dùng rồi so sánh mật khẩu ở phía client, người khác có thể xem mã ứng dụng hoặc lưu lượng API để lấy thông tin nhạy cảm; việc xác thực này có thể bị vượt qua. Thứ hai, token do client tự tạo không phải bằng chứng xác thực đáng tin cậy vì client có thể bị sửa đổi và giả mạo token. Ở hệ thống thật, **backend** phải kiểm tra mật khẩu bằng cách đối chiếu với giá trị băm an toàn, rồi cấp token hoặc phiên đăng nhập đã được xác thực. Trên ứng dụng di động nên lưu token nhạy cảm vào kho bảo mật như **Expo SecureStore** (thay vì AsyncStorage); với ứng dụng web, có thể dùng cookie `HttpOnly`, `Secure`, `SameSite` được thiết kế phù hợp.

## Câu 3. Hai effect trong `CartItemRow`

Nếu xóa effect `setQty(item.quantity)`, giá trị `qty` cục bộ chỉ được lấy từ `item.quantity` khi component được tạo lần đầu. Khi số lượng trong Redux bị thay đổi từ nơi khác — ví dụ thêm lại cùng một cuốn sách từ trang Chi tiết hoặc khôi phục giỏ hàng — số hiển thị ở hàng giỏ vẫn có thể giữ giá trị cũ và lệch với store. Effect đồng bộ giúp giao diện phản ánh lại số lượng mới mỗi khi `item.quantity` thay đổi.

## Câu 4. Một nguồn state cho nút yêu thích

Nếu từng `HeartButton` sử dụng `useState` riêng, bấm tim ở Home chỉ làm đổi trạng thái nút ở Home, còn tim ở trang Chi tiết có thể vẫn chưa được chọn. Khi mỗi nơi đều đọc cùng danh sách ID từ Redux wishlist qua `useWishlist()`, thao tác `toggle(bookId)` cập nhật một nguồn dữ liệu chung và mọi nút tim của sách đó tự hiển thị đồng nhất. Danh sách yêu thích cũng cập nhật theo mà không cần lưu bản sao trạng thái riêng.

## Câu 5. Thêm nút 👁 hiện/ẩn mật khẩu ở màn Đăng nhập

Trong `src/screens/LoginScreen.tsx`, khai báo state ngay bên cạnh `email` và `password`:

```tsx
const [showPassword, setShowPassword] = useState(false);
```

Đổi thuộc tính `secureTextEntry` của `FormField` mật khẩu thành:

```tsx
<FormField
  label="Mật khẩu"
  value={password}
  onChangeText={setPassword}
  error={errors.password}
  placeholder="Nhập mật khẩu"
  secureTextEntry={!showPassword}
/>

<Pressable
  onPress={() => setShowPassword((prev) => !prev)}
  accessibilityRole="button"
  accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
>
  <Text>{showPassword ? "🙈 Ẩn mật khẩu" : "👁 Hiện mật khẩu"}</Text>
</Pressable>
```

**Kiểm thử:** Nhập mật khẩu `123456`. Khi `showPassword = false`, ô nhập che ký tự; bấm `👁 Hiện mật khẩu` thì thấy ký tự rõ ràng, bấm lần nữa thì lại bị che. Chụp màn hình hai trạng thái (có thể dùng mật khẩu thử nghiệm) và lưu vào `MinhChung/Bai8_Cau5/` với tên `Cau5_AnMatKhau.png` và `Cau5_HienMatKhau.png`.
