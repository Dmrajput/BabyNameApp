import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { AdminNameCard } from "../components/AdminNameCard";
import { SearchBar } from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";
import {
    addAdminName,
    deleteAdminName,
    getAdminNames,
    updateAdminName,
} from "../services/api";
import { BabyName, NameGender } from "../types";

const ADMIN_EMAIL = "divyarajsinh5216@gmail.com";
const categories = [
  "All",
  "Hindu",
  "Muslim",
  "Jain",
  "Buddhist",
  "Modern",
  "Trending",
  "Persian",
  "Arabic",
  "Royal",
];
const genderOptions: NameGender[] = ["Boy", "Girl", "Unisex"];

type NameFormState = {
  name: string;
  meaning: string;
  origin: string;
  gender: NameGender;
  category: string;
  rating: string;
};

const initialForm: NameFormState = {
  name: "",
  meaning: "",
  origin: "",
  gender: "Boy",
  category: "Trending",
  rating: "4",
};

export const AdminScreen = () => {
  const { userData, userToken } = useAuth();
  const isAdmin = (userData?.email ?? "").toLowerCase() === ADMIN_EMAIL;

  const [list, setList] = useState<BabyName[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingName, setEditingName] = useState<BabyName | null>(null);
  const [form, setForm] = useState<NameFormState>(initialForm);

  const canLoad = isAdmin && !!userToken;

  const clearMessageSoon = useCallback(() => {
    setTimeout(() => setMessage(""), 2200);
  }, []);

  const loadNames = useCallback(
    async (targetPage = 1, isPullToRefresh = false) => {
      if (!canLoad || !userToken) {
        setLoading(false);
        return;
      }

      try {
        if (isPullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const data = await getAdminNames({
          token: userToken,
          page: targetPage,
          limit: 10,
          search,
          category,
        });

        setList(data.items ?? []);
        setPage(data.page ?? targetPage);
        setTotalPages(data.totalPages ?? 1);
      } catch (error) {
        const text =
          error instanceof Error ? error.message : "Unable to load names.";
        setMessage(text);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canLoad, category, search, userToken],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadNames(1);
    }, 280);

    return () => clearTimeout(timeout);
  }, [search, category, loadNames]);

  const openAddForm = () => {
    setEditingName(null);
    setForm(initialForm);
    setIsFormVisible(true);
  };

  const openEditForm = (item: BabyName) => {
    setEditingName(item);
    setForm({
      name: item.name,
      meaning: item.meaning,
      origin: item.origin,
      gender: item.gender,
      category: item.category,
      rating: String(item.rating ?? 0),
    });
    setIsFormVisible(true);
  };

  const closeForm = () => {
    if (submitting) {
      return;
    }

    setIsFormVisible(false);
  };

  const setField = <K extends keyof NameFormState>(
    field: K,
    value: NameFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidForm = useMemo(() => {
    const rating = Number(form.rating);
    return (
      form.name.trim() &&
      form.meaning.trim() &&
      form.origin.trim() &&
      form.category.trim() &&
      Number.isFinite(rating) &&
      rating >= 1 &&
      rating <= 5
    );
  }, [form]);

  const onSave = async () => {
    if (!isValidForm || !userToken) {
      Alert.alert(
        "Invalid form",
        "Please fill all fields and provide rating between 1 and 5.",
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      meaning: form.meaning.trim(),
      origin: form.origin.trim(),
      gender: form.gender,
      category: form.category,
      rating: Number(form.rating),
    };

    setSubmitting(true);

    if (editingName) {
      const previous = list;
      setList((prev) =>
        prev.map((n) => (n._id === editingName._id ? { ...n, ...payload } : n)),
      );

      try {
        const updated = await updateAdminName({
          token: userToken,
          id: editingName._id,
          payload,
        });
        setList((prev) =>
          prev.map((n) => (n._id === updated._id ? updated : n)),
        );
        setMessage("Name updated successfully.");
        clearMessageSoon();
        setIsFormVisible(false);
      } catch (error) {
        setList(previous);
        const text =
          error instanceof Error ? error.message : "Failed to update name.";
        Alert.alert("Update failed", text);
      } finally {
        setSubmitting(false);
      }

      return;
    }

    const optimisticId = `temp-${Date.now()}`;
    const optimisticName = {
      _id: optimisticId,
      ...payload,
    } as BabyName;

    const previous = list;
    setList((prev) => [optimisticName, ...prev]);

    try {
      const created = await addAdminName({ token: userToken, payload });
      setList((prev) =>
        prev.map((n) => (n._id === optimisticId ? created : n)),
      );
      setMessage("Name added successfully.");
      clearMessageSoon();
      setIsFormVisible(false);
      setForm(initialForm);
    } catch (error) {
      setList(previous);
      const text =
        error instanceof Error ? error.message : "Failed to add name.";
      Alert.alert("Add failed", text);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = (item: BabyName) => {
    if (!userToken) {
      return;
    }

    Alert.alert("Delete Name", "Are you sure you want to delete?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const previous = list;
          setList((prev) => prev.filter((n) => n._id !== item._id));

          try {
            await deleteAdminName({ token: userToken, id: item._id });
            setMessage("Name deleted successfully.");
            clearMessageSoon();
          } catch (error) {
            setList(previous);
            const text =
              error instanceof Error ? error.message : "Failed to delete name.";
            Alert.alert("Delete failed", text);
          }
        },
      },
    ]);
  };

  const goPrevPage = () => {
    if (page > 1) {
      void loadNames(page - 1);
    }
  };

  const goNextPage = () => {
    if (page < totalPages) {
      void loadNames(page + 1);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.deniedWrap}>
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={64}
          color="#F59E0B"
        />
        <Text style={styles.deniedTitle}>Access Denied</Text>
        <Text style={styles.deniedText}>
          Only authorized admin can manage baby names.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Admin Management</Text>
      <Text style={styles.subtitle}>Manage baby names securely</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name"
      />

      <View style={styles.filterRowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#E86A6A" />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={() => void loadNames(page, true)}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AdminNameCard
              item={item}
              onEdit={openEditForm}
              onDelete={onDelete}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No names found.</Text>
          }
          ListFooterComponent={
            <View style={styles.paginationRow}>
              <Pressable
                onPress={goPrevPage}
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
              >
                <Text style={styles.pageBtnText}>Prev</Text>
              </Pressable>

              <Text style={styles.pageText}>
                Page {page} / {totalPages}
              </Text>

              <Pressable
                onPress={goNextPage}
                style={[
                  styles.pageBtn,
                  page >= totalPages && styles.pageBtnDisabled,
                ]}
                disabled={page >= totalPages}
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </Pressable>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={openAddForm}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent
        onRequestClose={closeForm}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingName ? "Edit Name" : "Add New Name"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                value={form.name}
                onChangeText={(value) => setField("name", value)}
                placeholder="Name"
                style={styles.input}
              />
              <TextInput
                value={form.meaning}
                onChangeText={(value) => setField("meaning", value)}
                placeholder="Meaning"
                style={styles.input}
              />
              <TextInput
                value={form.origin}
                onChangeText={(value) => setField("origin", value)}
                placeholder="Origin"
                style={styles.input}
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionWrap}>
                {genderOptions.map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.optionChip,
                      form.gender === item && styles.optionChipActive,
                    ]}
                    onPress={() => setField("gender", item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        form.gender === item && styles.optionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.optionWrap}>
                {categories
                  .filter((c) => c !== "All")
                  .map((item) => (
                    <Pressable
                      key={item}
                      style={[
                        styles.optionChip,
                        form.category === item && styles.optionChipActive,
                      ]}
                      onPress={() => setField("category", item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          form.category === item && styles.optionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
              </View>

              <TextInput
                value={form.rating}
                onChangeText={(value) => setField("rating", value)}
                placeholder="Rating (1-5)"
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Pressable
                style={[
                  styles.submitBtn,
                  (!isValidForm || submitting) && styles.submitBtnDisabled,
                ]}
                onPress={onSave}
                disabled={!isValidForm || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#7F1D1D" />
                ) : (
                  <Text style={styles.submitText}>
                    {editingName ? "Save Changes" : "Add Name"}
                  </Text>
                )}
              </Pressable>

              <Pressable style={styles.cancelBtn} onPress={closeForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2937",
  },
  subtitle: {
    marginTop: 2,
    marginBottom: 10,
    color: "#64748B",
  },
  message: {
    backgroundColor: "#DCFCE7",
    color: "#14532D",
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterRow: {
    paddingBottom: 2,
  },
  filterRowWrap: {
    marginBottom: 10,
    zIndex: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FECACA",
  },
  filterText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },
  filterTextActive: {
    color: "#9F1239",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 110,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 20,
  },
  paginationRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 30,
  },
  pageBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  pageBtnDisabled: {
    opacity: 0.45,
  },
  pageBtnText: {
    color: "#9F1239",
    fontWeight: "700",
  },
  pageText: {
    color: "#334155",
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E86A6A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  deniedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9F5",
    paddingHorizontal: 20,
  },
  deniedTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#7C2D12",
    marginTop: 12,
  },
  deniedText: {
    marginTop: 6,
    color: "#64748B",
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.36)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF7F3",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    maxHeight: "88%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F2E8E5",
    color: "#1E293B",
  },
  label: {
    marginTop: 4,
    marginBottom: 6,
    color: "#334155",
    fontWeight: "700",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  optionChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#F2E8E5",
  },
  optionChipActive: {
    backgroundColor: "#FECACA",
    borderColor: "#FCA5A5",
  },
  optionText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },
  optionTextActive: {
    color: "#9F1239",
  },
  submitBtn: {
    backgroundColor: "#FCA5A5",
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: "#7F1D1D",
    fontWeight: "800",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: "#64748B",
    fontWeight: "700",
  },
});
