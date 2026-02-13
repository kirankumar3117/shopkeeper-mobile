export const MOCK_ORDERS = [
  // 1. NEW ORDER - Big Monthly Grocery (UPI)
  {
    id: '#ORD-5501',
    status: 'new',
    time: 'Just now',
    payment: 'UPI Paid',
    total: '1,240.00',
    type: 'list',
    items: [
      { id: 101, name: 'India Gate Basmati Rice', qty: '5kg', price: 650 },
      { id: 102, name: 'Toor Dal (Premium)', qty: '1kg', price: 180 },
      { id: 103, name: 'Fortune Sunflower Oil', qty: '1L', price: 160 },
      { id: 104, name: 'Tata Salt', qty: '1pkt', price: 25 },
      { id: 105, name: 'Everest Chicken Masala', qty: '100g', price: 85 },
    ]
  },
  
  // 2. NEW ORDER - Handwritten List (Image)
  {
    id: '#ORD-IMG-02',
    status: 'new',
    time: '2min ago',
    payment: 'Cash On Delivery',
    total: '', // Empty because shopkeeper hasn't entered it yet
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    items: [] 
  },

  // 3. PREPARING - Morning Essentials
  {
    id: '#ORD-5490',
    status: 'preparing',
    time: '12min ago',
    payment: 'UPI Paid',
    total: '145.00',
    type: 'list',
    items: [
      { id: 201, name: 'Amul Gold Milk', qty: '2 pkts', price: 66 },
      { id: 202, name: 'Modern Bread (Brown)', qty: '1 pkt', price: 55 },
      { id: 203, name: 'Eggs (Dozen)', qty: '1 box', price: 80 },
    ]
  },

  // 4. READY - Heavy Item Pickup
  {
    id: '#ORD-5485',
    status: 'ready',
    time: '35min ago',
    payment: 'Cash On Delivery',
    total: '1,350.00',
    type: 'list',
    items: [
      { id: 301, name: 'Kurnool Sona Masoori (25kg)', qty: '1 bag', price: 1350 },
    ]
  },
];