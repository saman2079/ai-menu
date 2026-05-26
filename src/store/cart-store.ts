import { create } from "zustand";

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartStore {

    items: CartItem[];

    addToCart: (item: Omit<CartItem, "quantity">) => void;

    increase: (id: string) => void;

    decrease: (id: string) => void;
}

export const useCartStore = create<CartStore>((set) => ({

    items: [],

    addToCart: (item) =>
        set((state) => {

            const existingItem =
                state.items.find(
                    (i) => i._id === item._id
                );

            // اگر محصول داخل سبد بود
            if (existingItem) {

                return {
                    items: state.items.map((i) =>

                        i._id === item._id
                            ? {
                                ...i,
                                quantity: i.quantity + 1,
                            }
                            : i
                    ),
                };
            }

            // اگر داخل سبد نبود
            return {
                items: [
                    ...state.items,
                    {
                        ...item,
                        quantity: 1,
                    },
                ],
            };
        }),

    increase: (id) =>
        set((state) => ({
            items: state.items.map((item) =>
                item._id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item
            ),
        })),

    decrease: (id) =>
        set((state) => ({

            items: state.items
                .map((item) =>

                    item._id === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item
                )
                .filter((item) => item.quantity > 0),

        })),
}));