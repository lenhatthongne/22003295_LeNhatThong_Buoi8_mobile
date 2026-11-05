
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../services/authService";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import {
  validateEmail,
  validatePassword,
} from "../utils/validators";
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function LoginScreen({
  navigation,
  route,
}: RootScreenProps<"Login">) {
  const { signIn } = useAuth();

  // BT8.1 - Khai báo state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string | null;
    password?: string | null;
  }>({});

  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  // BT8.1 - Xử lý đăng nhập
  
const submit = async () => {
  console.log("1. Đã bấm nút Đăng nhập");

  if (loading) return;

  const e = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  setErrors(e);
  setSubmitError("");

  if (e.email || e.password) {
    console.log("2. Dữ liệu không hợp lệ:", e);
    return;
  }

  try {
    setLoading(true);

    console.log("3. Đang gọi API đăng nhập");

    const { user, token } = await login(
      email.trim(),
      password
    );

    console.log("4. Đăng nhập thành công:", user.email);

    signIn(user, token);

    console.log("5. Route params:", route.params);

    if (route.params?.redirectTo === "Checkout") {
      console.log("6. Chuyển đến Checkout");

      navigation.replace("Checkout", {
        total: route.params.total ?? 0,
      });
    } else {
      console.log("6. Chuyển đến Home");

      navigation.navigate("Tabs", {
        screen: "Home",
      });
    }
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
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
        <Text style={styles.logo}>📚</Text>

        <Text style={styles.title}>
          Đăng nhập BookStore
        </Text>

        {/* Ô Email */}
        <FormField
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({
              ...prev,
              email: null,
            }));
          }}
          error={errors.email}
          placeholder="Nhập email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {/* Ô Mật khẩu */}
        <FormField
          label="Mật khẩu"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({
              ...prev,
              password: null,
            }));
          }}
          error={errors.password}
          placeholder="Nhập mật khẩu"
          secureTextEntry
        />

        {/* Lỗi đăng nhập từ API */}
        {submitError ? (
          <Text style={styles.submitError}>
            {submitError}
          </Text>
        ) : null}

        {/* Nút đăng nhập */}
        <PrimaryButton
          title="Đăng nhập"
          onPress={submit}
          loading={loading}
        />

        {/* Chuyển sang đăng ký */}
        <Pressable
          onPress={() =>
            navigation.replace("Register", route.params)
          }
        >
          <Text style={styles.link}>
            Chưa có tài khoản? Đăng ký
          </Text>
        </Pressable>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Tài khoản demo:
            demo@bookstore.vn / 123456
          </Text>
        </View>
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
  logo: {
    fontSize: 56,
    textAlign: "center",
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
  hint: {
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 10,
  },
  hintText: {
    color: colors.navy,
    textAlign: "center",
    fontSize: 12,
  },
});
