CREATE TABLE sales_data (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  revenue DOUBLE PRECISION NOT NULL DEFAULT 0,
  transactions INTEGER NOT NULL DEFAULT 0,
  new_customers INTEGER NOT NULL DEFAULT 0,
  product_category VARCHAR(100),
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_data_date ON sales_data(date);
CREATE INDEX idx_sales_data_school ON sales_data(school_id);
CREATE INDEX idx_sales_data_category ON sales_data(product_category);
