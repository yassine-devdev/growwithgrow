
export type MarketplaceSection = 'All' | 'Electronics' | 'Clothing' | 'Books' | 'Home & Garden' | 'Deals';

export type MarketplaceL3Section = 
  | 'Featured' | 'New Arrivals' | 'Popular'  // For 'All'
  | 'Smartphones' | 'Laptops' | 'Accessories'  // For 'Electronics'
  | 'Men' | 'Women' | 'Kids'  // For 'Clothing'
  | 'Fiction' | 'Non-Fiction' | 'Educational'  // For 'Books'
  | 'Furniture' | 'Decor' | 'Garden'  // For 'Home & Garden'
  | 'Daily Deals' | 'Flash Sales' | 'Clearance';  // For 'Deals'
