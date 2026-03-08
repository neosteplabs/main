export type Concentration = {
  sku: string;
  label: string;
  stock: number;
  prices: {
    public: number;
  };
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  visible?: boolean;
  concentrations: Concentration[];
};