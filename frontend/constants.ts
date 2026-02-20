import { Product, Order } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Grandma’s Mango Pickle',
    category: 'Achar',
    brand: 'Gemini Chef',
    price: 250,
    discountPrice: 199,
    description: 'Authentic raw mango pickle made with mustard oil and traditional spices. Sun-dried to perfection.',
    image: 'https://picsum.photos/400/400?random=1',
    rating: 4.8,
    reviews: 124,
    stock: 50,
    isSpicy: true,
    variants: [
      { id: 'v1', name: '250g Jar', stock: 30 },
      { id: 'v2', name: '500g Jar', price: 450, stock: 20 }
    ]
  },
  {
    id: '2',
    name: 'Spicy Garlic Pickle',
    category: 'Achar',
    brand: 'Gemini Chef',
    price: 300,
    description: 'Whole garlic cloves marinated in a spicy, tangy masala. Great for heart health and taste buds!',
    image: 'https://picsum.photos/400/400?random=2',
    rating: 4.6,
    reviews: 89,
    stock: 32,
    isSpicy: true,
    variants: [
      { id: 'v3', name: '200g Pack', stock: 15 },
      { id: 'v4', name: '400g Pack', price: 550, stock: 17 }
    ]
  },
  {
    id: '3',
    name: 'Moong Dal Papad',
    category: 'Papad',
    brand: 'Gemini Chef',
    price: 150,
    description: 'Crispy, thin lentil discs spiced with black pepper and cumin. Perfect crunchy side dish.',
    image: 'https://picsum.photos/400/400?random=3',
    rating: 4.9,
    reviews: 210,
    stock: 100
  },
  {
    id: '4',
    name: 'Ratkami Sev Namkeen',
    category: 'Namkeen',
    brand: 'Gemini Chef',
    price: 120,
    description: 'A popular spicy snack from Indore, made with gram flour and clove.',
    image: 'https://picsum.photos/400/400?random=4',
    rating: 4.7,
    reviews: 56,
    stock: 20
  },
  {
    id: '5',
    name: 'Sweet Lemon Pickle',
    category: 'Achar',
    brand: 'Gemini Chef',
    price: 280,
    description: 'Sweet and tangy lemon pickle, aged to perfection without oil. Great for digestion.',
    image: 'https://picsum.photos/400/400?random=5',
    rating: 4.5,
    reviews: 45,
    stock: 15,
    isSpicy: false
  },
  {
    id: '6',
    name: 'Mathri',
    category: 'Snacks',
    brand: 'Gemini Chef',
    price: 180,
    description: 'Flaky, savory biscuits spiced with carom seeds. The perfect tea-time partner.',
    image: 'https://picsum.photos/400/400?random=6',
    rating: 4.8,
    reviews: 112,
    stock: 60
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    userId: 'u1',
    items: [
      { ...PRODUCTS[0], quantity: 2 },
      { ...PRODUCTS[2], quantity: 1 }
    ],
    total: 548,
    status: 'Delivered',
    date: '2023-10-15',
    paymentMethod: 'UPI'
  },
  {
    id: 'ORD-002',
    userId: 'u2',
    items: [
      { ...PRODUCTS[3], quantity: 3 }
    ],
    total: 360,
    status: 'Processing',
    date: '2023-10-20',
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-003',
    userId: 'u3',
    items: [
      { ...PRODUCTS[1], quantity: 1 },
      { ...PRODUCTS[5], quantity: 2 }
    ],
    total: 660,
    status: 'Pending',
    date: '2023-10-21',
    paymentMethod: 'UPI'
  }
];