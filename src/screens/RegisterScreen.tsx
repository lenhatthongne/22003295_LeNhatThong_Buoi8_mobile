
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { register } from "../services/authService";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import {
  validateEmail,
  validatePassword,
  validateRequired,
} from "../utils/validators";
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function RegisterScreen({
  navigation,
  route,
}: RootScreenProps<"Register">) {
  const { signIn } = useAuth();

  // BT8.2 - Khai báo state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});

  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // BT8.2 - Xử lý đăng ký
  const submit = async () => {
    if (loading) return;

    const e = {
      name: validateRequired("họ tên")(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: !confirm
        ? "Vui lòng nhập lại mật khẩu"
        : confirm !== password
          ? "Mật khẩu nhập lại không khớp"
          : null,
    };

    setErrors(e);
    setSubmitError("");

    // Kiểm tra dữ liệu trước khi gọi API
    if (Object.values(e).some(Boolean)) {
      return;
    }

    try {
      setLoading(true);

      // Gọi API tạo tài khoản
      const { user, token } = await register(
        name.trim(),
        email.trim(),
        password
      );

      // Tự đăng nhập sau khi đăng ký
      signIn(user, token);

      // Điều hướng đúng màn hình
      if (route.params?.redirectTo === "Checkout") {
        navigation.replace("Checkout", {
          total: route.params.total ?? 0,
        });
      } else {
        navigation.navigate("Tabs", {
          screen: "Home",
        });
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Tạo tài khoản mới
        </Text>

        {/* Họ tên */}
        <FormField
          label="Họ tên"
          value={name}
          placeholder="Nhập họ tên"
          onChangeText={(text) => {
            setName(text);
            setErrors((prev) => ({
              ...prev,
              name: null,
            }));
          }}
          error={errors.name}
        />

        {/* Email */}
        <FormField
          label="Email"
          value={email}
          placeholder="Nhập email"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({
              ...prev,
              email: null,
            }));
          }}
          error={errors.email}
        />

        {/* Mật khẩu */}
        <FormField
          label="Mật khẩu"
          value={password}
          placeholder="Nhập mật khẩu"
          secureTextEntry
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({
              ...prev,
              password: null,
              confirm: null,
            }));
          }}
          error={errors.password}
        />

        {/* Nhập lại mật khẩu */}
        <FormField
          label="Nhập lại mật khẩu"
          value={confirm}
          placeholder="Nhập lại mật khẩu"
          secureTextEntry
          onChangeText={(text) => {
            setConfirm(text);
            setErrors((prev) => ({
              ...prev,
              confirm: null,
            }));
          }}
          error={errors.confirm}
        />

        {/* Lỗi từ API */}
        {submitError ? (
          <Text style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}

        {/* Nút đăng ký */}
        <PrimaryButton
          title="Đăng ký"
          onPress={submit}
          loading={loading}
        />

        {/* Chuyển về đăng nhập */}
        <Pressable
          onPress={() =>
            navigation.replace("Login", route.params)
          }
        >
          <Text style={styles.link}>
            Đã có tài khoản? Đăng nhập
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
    marginBottom: 6,
  },
  submitError: {
    color: colors.danger,
    textAlign: "center",
  },
  link: {
    color: colors.indigo,
    fontWeight: "700",
    textAlign: "center",
  },
});
