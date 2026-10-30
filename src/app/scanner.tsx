import { useRef, useState } from "react";

import {
    CameraView,
    useCameraPermissions,
    type BarcodeScanningResult,
} from "expo-camera";

import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    getProductByBarcode,
    type BarcodeProduct,
} from "@/services/openFoodFacts";

import { useFood } from "@/context/FoodContext";

import { createSavedFood, getSavedFoodByBarcode } from "@/database/database";

export default function ScannerScreen(){
    const router = useRouter();

    const [permission, requestPermission] = useCameraPermissions();
    const [barcode, setBarcode] = useState<string | null>(null);

    const scannedRef = useRef(false);

    const [product, setProduct] = useState<BarcodeProduct | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [servings, setServings] = useState("1");

    const { addFood } = useFood();
    
    const [isSaving, setIsSaving] = useState(false);

    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const [savedTemplate, setSavedTemplate] = useState(false);

    const [alreadySaved, setAlreadySaved] = useState(false);

    const servingCount = Number(servings);

    const { date } = useLocalSearchParams<{ date?: string }>();

    const validServings =
        servings.trim() !== "" &&
        Number.isFinite(servingCount) &&
        servingCount > 0;

    const calculatedCalories = 
        validServings && product?.caloriesPerServing != null
        ? servingCount * product.caloriesPerServing : null;

    const calculatedProtein = 
        validServings && product?.proteinPerServing != null
        ? servingCount * product.proteinPerServing : null;

    const calculateTotal = (
        perServing: number | null | undefined
    ) : number | null => {
        if (
            !validServings || perServing == null || !Number.isFinite(perServing) || perServing < 0
        ) {
            return null;
        }

        const total = perServing * servingCount;

        return Number.isFinite(total) ? total : null;
    };

    const extraNutrition = {
        carbs: calculateTotal(product?.carbsPerServing),
        fat: calculateTotal(product?.fatPerServing),
        sugar: calculateTotal(product?.sugarPerServing),
        fiber: calculateTotal(product?.fiberPerServing),
        sodium_mg: calculateTotal(product?.sodiumMgPerServing),
    };

    const canAdd = !isSaving && validServings
        && calculatedCalories !== null && Number.isFinite(calculatedCalories)
        && calculatedCalories >= 0 && calculatedProtein !== null
        && Number.isFinite(calculatedProtein) && calculatedProtein >= 0;

    const handleBarcodeScanned = async ({
        data,
    }: BarcodeScanningResult) => {
        if (scannedRef.current) return;

        scannedRef.current = true;
        setBarcode(data);
        setIsLoading(true);
        setError(null);
        setProduct(null);

        try {
            const result = await getProductByBarcode(data);

            const existingFood = await getSavedFoodByBarcode(data);

            setAlreadySaved(existingFood !== null);

            if(result) {
                setProduct(result);
            } else {
                setError("Product not found in Open Food Facts.");
            }
        } catch (error){
            console.error("Barcode lookup failed:", error);
            setError("Unable to retreive product information.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleScanAgain = () => {
        scannedRef.current = false;
        setBarcode(null);
        setIsLoading(false);
        setError(null);
        setProduct(null);
        setIsSavingTemplate(false);
        setSavedTemplate(false);
        setServings("1");
        setAlreadySaved(false);
        setIsSaving(false);
    };

    const handleAddToToday = async () => {
        if (
            !product || ! canAdd || calculatedCalories === null || calculatedProtein === null
        ) {
            Alert.alert(
                "Missing information",
                "Please enter a valid serving amount. Calories and protein must be available."
            );
            return;
        }

        setIsSaving(true);

        try {
            await addFood({
                name: product.name,
                amount: servingCount,
                unit: "serving",
                calories: calculatedCalories,
                protein: calculatedProtein,
                ...extraNutrition,
            }, date);

            Keyboard.dismiss();
            
            router.dismissAll();
        } catch(error) {
            console.error("Failed to log scanned food:", error);

            Alert.alert(
                "Error",
                "Could not add this food. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveToSavedFoods = async () => {
        if (
            !product || isSavingTemplate || savedTemplate ||
            product.caloriesPerServing === null || product.proteinPerServing === null ||
            !Number.isFinite(product.caloriesPerServing) || !Number.isFinite(product.proteinPerServing) ||
            product.caloriesPerServing < 0 || product.proteinPerServing < 0 || alreadySaved
        ) {
            return;
        }

        setIsSavingTemplate(true);

        try {
            await createSavedFood(
                product.name,
                1,
                "serving",
                product.caloriesPerServing,
                product.proteinPerServing,
                product.servingSize,
                product.barcode,
                {
                    carbs: product.carbsPerServing,
                    fat: product.fatPerServing,
                    sugar: product.sugarPerServing,
                    fiber: product.fiberPerServing,
                    sodium_mg: product.sodiumMgPerServing,
                }
            );

            setSavedTemplate(true);
            setAlreadySaved(true);

            Alert.alert(
                "Food Saved",
                `${product.name} has been added to Saved Foods.`
            );
        } catch (error) {
            console.error("Failed to save scanned food:", error);

            Alert.alert(
                "Error",
                "Could not save this food. Please try again."
            );
        } finally {
            setIsSavingTemplate(false);
        }
    };

    if(!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Checking camera permissions...</Text>
            </SafeAreaView>
        );
    }

    if(!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.message}>
                    CalorieTracker needs camera access to scan food.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={requestPermission}
                >
                    <Text style={styles.buttonText}>
                        Grant Camera Permission
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backButton}>‹ Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Scan Food
                </Text>

                
            </View>

            <View style={styles.cameraContainer}>
                {!barcode ? (
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: [
                                "ean13",
                                "ean8",
                                "upc_a",
                                "upc_e",
                            ],
                        }}
                        onBarcodeScanned={handleBarcodeScanned}
                    />
                ) : (
                    <ScrollView 
                        style={styles.resultContainer}
                        contentContainerStyle={styles.resultContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        automaticallyAdjustKeyboardInsets={true}
                    >
                        {isLoading ? (
                            <>
                                <ActivityIndicator size="large" />
                                <Text>Looking up product...</Text>
                            </>
                        ) : product ? (
                            <>
                                <Text style={styles.resultTitle}>
                                    {product.name}
                                </Text>

                                {product.brand && (
                                    <Text>{product.brand}</Text>
                                )}

                                <Text style={styles.nutritionLabel}>
                                    Serving Size: {product.servingSize ?? "Not available"}
                                </Text>

                                <Text style={styles.nutritionValue}>
                                    Calories Per Serving:{" "}
                                    {product.caloriesPerServing ?? "N/A"} kcal
                                </Text>

                                <Text style={styles.nutritionValue}>
                                    Protein Per Serving:{" "}
                                    {product.proteinPerServing ?? "N/A"}g 
                                </Text>

                                {[
                                    {
                                        label: "Carbohydrates",
                                        value: product.carbsPerServing,
                                        unit: "g",
                                    },
                                    {
                                        label: "Fat",
                                        value: product.fatPerServing,
                                        unit: "g",
                                    },
                                    {
                                        label: "Sugar",
                                        value: product.sugarPerServing,
                                        unit: "g",
                                    },
                                    {
                                        label: "Fiber",
                                        value: product.fiberPerServing,
                                        unit: "g",
                                    },
                                    {
                                        label: "Sodium",
                                        value: product.sodiumMgPerServing,
                                        unit: "mg",
                                    },
                                ].map((nutrient)=> (
                                    <Text key={nutrient.label} style={styles.nutritionValue}>
                                        {nutrient.label} Per Serving:{" "}
                                        {nutrient.value === null
                                            ? "N/A" : `${Number(nutrient.value.toFixed(1))} ${nutrient.unit}`
                                        }
                                    </Text>
                                ))}

                                <Text style={styles.inputLabel}>
                                    Number of servings eaten
                                </Text>

                                <TextInput
                                    style={styles.servingsInput}
                                    value={servings}
                                    onChangeText={setServings}
                                    keyboardType="decimal-pad"
                                    placeholder="1"
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                />

                                

                                <View style={styles.calculatedCard}>
                                    <Text style={styles.resultTitle}>
                                        Total Nutrition
                                    </Text>
                                

                                    <Text style={styles.nutritionValue}>
                                        {calculatedCalories === null
                                            ? "Calories: N/A"
                                            : `Calories: ${calculatedCalories.toFixed(0)} kcal`}
                                    </Text>

                                    <Text style={styles.nutritionValue}>
                                        {calculatedProtein === null
                                            ? "Protein: N/A"
                                            : `Protein: ${calculatedProtein.toFixed(0)}g`}
                                    </Text>

                                    {[
                                        {
                                            label: "Carbohydrates",
                                            value: extraNutrition.carbs,
                                            unit: "g",
                                        },
                                        {
                                            label: "Fat",
                                            value: extraNutrition.fat,
                                            unit: "g",
                                        },
                                        {
                                            label: "Sugar",
                                            value: extraNutrition.sugar,
                                            unit: "g",
                                        },
                                        {
                                            label: "Fiber",
                                            value: extraNutrition.fiber,
                                            unit: "g",
                                        },
                                        {
                                            label: "Sodium",
                                            value: extraNutrition.sodium_mg,
                                            unit: "mg",
                                        },
                                    ].map((nutrient)=> (
                                        <Text key={nutrient.label} style={styles.nutritionValue}>
                                            {nutrient.label}:{" "}
                                            {nutrient.value === null
                                                ? "N/A" : `${Number(nutrient.value.toFixed(1))} ${nutrient.unit}`
                                            }
                                        </Text>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        !canAdd && styles.addButtonDisabled,
                                    ]}
                                    disabled={!canAdd}
                                    onPress={handleAddToToday}
                                >
                                    <Text style={styles.addButtonText}>
                                        {isSaving ? "Adding..." : "Add to Today"}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[
                                        styles.saveTemplateButton,
                                        (isSavingTemplate || alreadySaved) &&
                                        styles.saveTemplateButtonDisabled,
                                    ]}
                                    disabled={
                                        isSavingTemplate ||
                                        alreadySaved ||
                                        product.caloriesPerServing === null ||
                                        product.proteinPerServing === null
                                    }
                                    onPress={handleSaveToSavedFoods}
                                >
                                    <Text style={styles.saveTemplateButtonText}>
                                        {isSavingTemplate
                                            ? "Saving..."
                                            : savedTemplate ? "Saved!" 
                                            : alreadySaved ? "Already Saved" : "Save to Saved Foods"}
                                    </Text>
                                </TouchableOpacity>
                                    
                            </>
                        ) : (
                            <Text style={styles.errorText}>
                                {error ?? "No product information available."}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.scanAgainButton}
                            onPress={handleScanAgain}
                        >
                            <Text style={styles.scanAgainButtonText}>
                                Scan Again
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>

            
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 20,
    },

    backButton: {
        fontSize: 17,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
    },

    cameraContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 16,
        overflow: "hidden",
    },

    camera: {
        flex:1,
    },
    
    message: {
        fontSize: 17,
        textAlign: "center",
        margin: 24,
    },

    resultContainer: {
        flex: 1,
    },

    resultTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },

    barcodeText: {
        fontSize: 20,
        marginBottom: 24,
    },

    button: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        marginTop: 24,
        width: "100%",
    },

    buttonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },

    nutritionLabel: {
        fontSize: 15,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 12,
    },

    nutritionValue: {
        fontSize: 18,
        marginTop: 6,
    },

    errorText: {
        fontSize: 16,
        color: "#D9834F",
        textAlign: "center",
    },

    servingsInput: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
        fontSize: 18,
        width: "100%",
    },
    
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 20,
        marginBottom: 8,
    },

    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap:12,
        width:"100%",
    },

    amountInput: {
        flex: 1,
        minWidth: 0,
        height: 52,
        backgroundColor: "white",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
    },

    unitPickerContainer: {
        width: 110,
    },

    calculatedCard: {
        backgroundColor: "white",
        padding: 18,
        borderRadius: 12,
        marginTop: 20,
        width: "100%",
        gap:8,
    },

    keyboardToolbar: {
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 16,
        height:44,
        alignItems: "flex-end",
        justifyContent: "center",
    },

    doneButton: {
        fontSize: 17,
        fontWeight: "600",
        color: "#007AFF",
    },

    dismissButton: {
        alignSelf: "flex-end",
        padding: 12,
    },

    addButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        marginTop: 24,
        width: "100%",
    },

    addButtonDisabled: {
        opacity: 0.4,
    },

    addButtonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },

    saveTemplateButton: {
        backgroundColor: "white",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        marginTop: 12,
        width: "100%",
        borderWidth: 1,
        borderColor: "#007AFF",
    },

    saveTemplateButtonDisabled: {
        opacity: 0.5,
    },

    saveTemplateButtonText: {
        color: "#007AFF",
        fontSize: 17,
        fontWeight: "600",
    },

    resultContent: {
        flexGrow:1,
        padding:20,
        paddingBottom: 40,
        alignItems: "stretch",
    },

    scanAgainButton: {
        backgroundColor: "#E8F2FF",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 16,
        width: "100%",
    },

    scanAgainButtonText: {
        color: "#007AFF",
        fontSize: 17,
        fontWeight: "600",
    }
});