
export const products = [
  { id: "prod1", name: "Premium Headphones", category: "Electronics", price: 199.99 },
  { id: "prod2", name: "Wireless Keyboard", category: "Electronics", price: 89.99 },
  { id: "prod3", name: "Smart Watch", category: "Wearables", price: 249.99 },
  { id: "prod4", name: "Fitness Tracker", category: "Wearables", price: 129.99 },
  { id: "prod5", name: "Bluetooth Speaker", category: "Audio", price: 79.99 },
  { id: "prod6", name: "Laptop Backpack", category: "Accessories", price: 59.99 },
  { id: "prod7", name: "Wireless Mouse", category: "Electronics", price: 49.99 },
  { id: "prod8", name: "Phone Case", category: "Accessories", price: 24.99 }
];

export const getProductById = (productId) => {
  return products.find(product => product.id === productId);
};
