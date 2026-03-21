export const MOCK_ORDERS = [
  // 1. NEW ORDER - Big Monthly Grocery (UPI)
  {
    id: '#ORD-5501',
    status: 'pending',
    created_at: 'Just now',
    total_amount: 1240.00,
    type: 'list',
    items: [
      { id: '101', name: 'India Gate Basmati Rice', qty: 5, price: 650 },
      { id: '102', name: 'Toor Dal (Premium)', qty: 1, price: 180 },
      { id: '103', name: 'Fortune Sunflower Oil', qty: 1, price: 160 },
      { id: '104', name: 'Tata Salt', qty: 1, price: 25 },
      { id: '105', name: 'Everest Chicken Masala', qty: 1, price: 85 },
    ]
  },
  
  // 2. NEW ORDER - Handwritten List (Image)
  {
    id: '#ORD-IMG-02',
    status: 'pending',
    created_at: '2min ago',
    total_amount: 0, // Empty because shopkeeper hasn't entered it yet
    type: 'image',
    list_image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    items: [] 
  },

  // 3. PREPARING - Morning Essentials
  {
    id: '#ORD-5490',
    status: 'preparing',
    created_at: '12min ago',
    total_amount: 145.00,
    type: 'list',
    items: [
      { id: '201', name: 'Amul Gold Milk', qty: 2, price: 66 },
      { id: '202', name: 'Modern Bread (Brown)', qty: 1, price: 55 },
      { id: '203', name: 'Eggs (Dozen)', qty: 1, price: 80 },
    ]
  },

  // 4. READY - Heavy Item Pickup
  {
    id: '#ORD-5485',
    status: 'ready',
    created_at: '35min ago',
    total_amount: 1350.00,
    type: 'list',
    items: [
      { id: '301', name: 'Kurnool Sona Masoori (25kg)', qty: 1, price: 1350 },
    ]
  },
];