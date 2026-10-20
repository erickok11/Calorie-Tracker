export type BarcodeProduct = {
    barcode:string;
    name: string;
    brand: string | null;
    servingSize: string | null;

    caloriesPer100g: number | null;
    proteinPer100g: number | null;
    caloriesPerServing: number | null;
    proteinPerServing: number | null;

    carbsPerServing: number | null;
    fatPerServing: number | null;
    sugarPerServing: number | null;
    fiberPerServing: number | null;
    sodiumMgPerServing: number | null;
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

            carbohydrates_100g?:number;
            carbohydrates_serving?:number;

            fat_100g?:number;
            fat_serving?:number;

            sugars_100g?:number;
            sugars_serving?:number;
            
            fiber_100g?: number;
            fiber_serving?: number;

            sodium_100g?: number;
            sodium_serving?: number;
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

    const getPerServing = (
        perServing: number | undefined,
        per100g: number | undefined
    ): number | null => {
        if(perServing != null && Number.isFinite(perServing)) {
            return perServing;
        }

        if( multiplier !== null && per100g != null && Number.isFinite(per100g)){
            return per100g * multiplier;
        }

        return null;
    };

    const caloriesPerServing = getPerServing(
        nutrients?.["energy-kcal_serving"],
        nutrients?.["energy-kcal_100g"]
    );

    const proteinPerServing = getPerServing(
        nutrients?.proteins_serving,
        nutrients?.proteins_100g
    );

    const carbsPerServing = getPerServing(
        nutrients?.carbohydrates_serving,
        nutrients?.carbohydrates_100g,
    );

    const fatPerServing = getPerServing(
        nutrients?.fat_serving,
        nutrients?.fat_100g,
    );

    const sugarPerServing = getPerServing(
        nutrients?.sugars_serving,
        nutrients?.sugars_100g,
    );

    const fiberPerServing = getPerServing(
        nutrients?.fiber_serving,
        nutrients?.fiber_100g,
    );

    const sodiumGramsPerServing = getPerServing(
        nutrients?.sodium_serving,
        nutrients?.sodium_100g,
    );

    const sodiumMgPerServing = sodiumGramsPerServing === null ? null : sodiumGramsPerServing * 1000;

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
        carbsPerServing,
        fatPerServing,
        sugarPerServing,
        fiberPerServing,
        sodiumMgPerServing,
    };
}
