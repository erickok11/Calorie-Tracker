import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    FOOD_UNITS,
    FoodUnit,
} from "@/constants/unit";

type UnitPickerProps = {
    value: FoodUnit | undefined;
    onChange: (unit: FoodUnit | undefined) => void;
    units?: readonly FoodUnit[];
    allowNone?: boolean;
};

export default function UnitPicker({
    value,
    onChange,
    units = FOOD_UNITS,
    allowNone = true,
}: UnitPickerProps) {
    const [showUnits, setShowUnits] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowUnits(!showUnits)}
            >
                <Text
                    style={[
                        styles.selectorText,
                        !value && styles.placeholderText,
                    ]}
                >
                    {value ?? "Select unit"}
                </Text>

                <Text style={styles.chevron}>
                    {showUnits ? "^" : "⌄"}
                </Text>
            </TouchableOpacity>

            {showUnits && (
                <View style={styles.options}>
                    {allowNone && (
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                onChange(undefined);
                                setShowUnits(false);
                            }}
                        >
                            <Text style={styles.optionText}>
                                None
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    {units.map((unit) => (
                        <TouchableOpacity
                            key={unit}
                            style={[
                                styles.option,
                                value === unit && styles.selectedOption,
                            ]}
                            onPress={() => {
                                onChange(unit);
                                setShowUnits(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    value === unit &&
                                        styles.selectedOptionText,
                                ]}
                            >
                                {unit}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },

    selector: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    selectorText: {
        fontSize: 16,
        color: "#000",
    },

    placeholderText: {
        color: "#999",
    },

    chevron: {
        fontSize: 18,
        color: "#777",
    },

    options: {
        backgroundColor: "white",
        borderRadius: 12,
        marginTop: 6,
        overflow: "hidden",
    },

    option: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    
    selectedOption: {
        backgroundColor: "#F0F6FF",
    },

    optionText: {
        fontSize: 16,
    },

    selectedOptionText: {
        color: "#3478F6",
        fontWeight: "600",
    },
});