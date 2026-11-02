import { Pressable, StyleSheet, Text, View } from "react-native";
import { MEALS, type MealType } from "@/constants/meals";   

type Props = {
    value: MealType | undefined;
    onChange: (meal: MealType) => void;
};

export default function MealPicker({ value, onChange }: Props) {
    return (
        <View style={styles.row}>
            {MEALS.map((meal) => {
                const selected = meal.key === value;

                return (
                    <Pressable
                        key = {meal.key}
                        onPress={() => onChange(meal.key)}
                        style={[styles.option, selected && styles.selected]}
                        accessibilityRole="button"
                        accessibilityState={{selected}}
                    >
                        <Text style={[styles.text, selected && styles.selectedText]}>
                            {meal.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", backgroundColor: "#E9E9EB", borderRadius: 12, padding: 3, marginBottom: 20 },
    option: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
    selected: { backgroundColor: "white" },
    text: { fontSize: 14, color: "#555", fontWeight: "500"},
    selectedText: { color: "#000", fontWeight: "600"},
})