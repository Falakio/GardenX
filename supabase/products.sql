create table
  public.products (
    id uuid not null default extensions.uuid_generate_v4 (),
    name text not null,
    price numeric(10, 2) not null,
    stock_quantity integer not null default 0,
    image_url text null,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    constraint products_pkey primary key (id),
    constraint products_price_check check ((price >= (0)::numeric)),
    constraint products_stock_quantity_check check ((stock_quantity >= 0))
  ) tablespace pg_default;

create trigger update_products_updated_at before
update on products for each row
execute function update_updated_at_column ();