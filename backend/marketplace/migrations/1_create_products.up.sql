CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  sale_price DOUBLE PRECISION,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  category_id BIGINT,
  brand VARCHAR(100),
  weight DOUBLE PRECISION,
  dimensions JSONB, -- Store width, height, depth
  images TEXT[], -- Array of image URLs
  tags TEXT[],
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  stock_status VARCHAR(20) NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder')),
  manage_stock BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'catalog', 'search', 'hidden')),
  rating DOUBLE PRECISION DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  created_by BIGINT NOT NULL,
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_school ON products(school_id);
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_stock_status ON products(stock_status);
