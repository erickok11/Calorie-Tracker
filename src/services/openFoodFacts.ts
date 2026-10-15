export type BarcodeProduct = {
    barcode:string;
    name: string;
    brand: string | null;
    servingSize: string | null;
    caloriesPer100g: number | null;
    proteinPer100g: number | null;
    caloriesPerServing: number | null;
    proteinPerServing: number | null;
};

type OpenFoodFactsResponse = {
    product?: {
        product_name?: string;
        brands?: string;
        serving_size?: string;
        nutriments?: {
            "energy-kcal_100g"?: number;
            proteins_100g?: number;
            "energy-kcal_serving"?: number;
            proteins_serving?: number;
        };
        serving_quantity?: number | string;
        serving_quantity_unit?: string;
    };
};

export async function getProductByBarcode(
    barcode:string
): Promise<BarcodeProduct | null> {
    const url =
        `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(barcode)}` +
        `?fields=product_name,brands,serving_size,serving_quantity,serving_quantity_unit,nutriments`;

    const response = await fetch(url, {
        headers: {
            "User-Agent" : "CalorieTracker/0.4.0 (erickokly@gmail.com)",
        },
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data: OpenFoodFactsResponse = await response.json();

    const product = data.product;

    if(!product) {
        return null;
    }

    const nutrients = product.nutriments;

    const servingQuantity = Number(product.serving_quantity);

    const hasValidServing = Number.isFinite(servingQuantity) &&
                                servingQuantity > 0 && ["g", "ml"].includes(product.serving_quantity_unit?.toLowerCase() ?? "");

    const multiplier = hasValidServing ? servingQuantity / 100 : null;

    const caloriesPerServing = nutrients?.["energy-kcal_serving"] ??
                                (multiplier !== null && nutrients?.["energy-kcal_100g"] != null ? nutrients["energy-kcal_100g"] * multiplier : null);

    const proteinPerServing = nutrients?.proteins_serving ?? (multiplier !== null && nutrients?.proteins_100g != null ? nutrients.proteins_100g * multiplier : null);
    

    return {
        barcode,
        name: product.product_name || "Unknown Food",
        brand: product.brands || null,
        servingSize: product.serving_size || null,
        caloriesPer100g: 
            nutrients?.["energy-kcal_100g"] ?? null,
        proteinPer100g:
            nutrients?.proteins_100g ?? null,
        caloriesPerServing,
        proteinPerServing,
    };
}
