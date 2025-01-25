CREATE OR REPLACE FUNCTION 
  public.update_updated_at_column()
  RETURNS trigger
  LANGUAGE plpgsql
AS $function$BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;$function$;

create table
  public.products (
    id uuid not null default extensions.uuid_generate_v4 (),
    name text not null,
    price numeric(10, 2) not null,
    stock_quantity integer not null default 0,
    image_url text null,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    category character varying not null default 'vegetable'::character varying,
    constraint products_pkey primary key (id),
    constraint products_price_check check ((price >= (0)::numeric)),
    constraint products_stock_quantity_check check ((stock_quantity >= 0))
  ) tablespace pg_default;

create trigger update_products_updated_at before
update on products for each row
execute function update_updated_at_column ();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

create table
  public.profiles (
    id uuid not null,
    email text null,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    constraint profiles_pkey primary key (id),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

create table
  public.user_profiles (
    id uuid not null,
    email character varying not null,
    phone character varying null,
    role character varying null,
    details jsonb null default '{}'::jsonb,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    "firstName" character varying not null default 's'::character varying,
    "lastName" character varying not null default 'd'::character varying,
    constraint user_profiles_pkey primary key (id),
    constraint user_profiles_email_key unique (email),
    constraint user_profiles_id_fkey foreign key (id) references auth.users (id),
    constraint user_profiles_role_check check (
      (
        (role)::text = any (
          array[
            ('parent'::character varying)::text,
            ('staff'::character varying)::text,
            ('visitor'::character varying)::text
          ]
        )
      )
    )
  ) tablespace pg_default;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

create table
  public.orders (
    id uuid not null default extensions.uuid_generate_v4 (),
    user_id uuid not null,
    total_amount numeric(10, 2) not null,
    status text not null default 'pending'::text,
    items jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    delivered_at timestamp with time zone null,
    mode character varying(10) not null default ''::character varying,
    constraint orders_pkey primary key (id),
    constraint fk_user foreign key (user_id) references auth.users (id) on delete cascade,
    constraint orders_mode_check check (
      (
        (mode)::text = any (
          array[
            ('pickup'::character varying)::text,
            ('delivery'::character varying)::text
          ]
        )
      )
    ),
    constraint orders_status_check check (
      (
        status = any (
          array[
            'pending'::text,
            'confirmed'::text,
            'delivered'::text,
            'cancelled'::text
          ]
        )
      )
    ),
    constraint orders_total_amount_check check ((total_amount >= (0)::numeric))
  ) tablespace pg_default;

create trigger update_orders_updated_at before
update on orders for each row
execute function update_updated_at_column ();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ORDERS POLICIES

CREATE POLICY "Admins can view all orders" ON orders
FOR SELECT
TO authenticated
USING ( (select auth.uid()) IN (SELECT user_id FROM profiles WHERE email LIKE '%@gardenx.33mail.com') );

CREATE POLICY "Admins can update all orders" ON orders
FOR UPDATE
TO authenticated
USING ( (select auth.uid()) IN (SELECT user_id FROM profiles WHERE email LIKE '%@gardenx.33mail.com') )
WITH CHECK ( true );

CREATE POLICY "Users can create their own orders" ON orders
FOR INSERT
TO authenticated
WITH CHECK ( (select auth.uid()) = user_id );

CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT
TO authenticated
USING ( (select auth.uid()) = user_id );

-- PRODUCTS POLICIES

CREATE POLICY "All users can read products" ON products
FOR SELECT
TO authenticated, anon
USING ( true );

CREATE POLICY "Admins can insert products" ON products
FOR INSERT
TO authenticated
WITH CHECK ( (select auth.uid()) IN (SELECT id FROM profiles WHERE email LIKE '%@gardenx.33mail.com') );

CREATE POLICY "Admins can delete products" ON products
FOR DELETE
TO authenticated
USING ( (select auth.uid()) IN (SELECT id FROM profiles WHERE email LIKE '%@gardenx.33mail.com') );

CREATE POLICY "Authenticated users can update stock" ON products
FOR UPDATE
TO authenticated
WITH CHECK ( true );

-- PROFILES POLICIES

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT
TO authenticated
USING ( (select auth.uid()) IN (SELECT id FROM user_profiles WHERE email LIKE '%@gardenx.33mail.com') );

CREATE POLICY "Users can update their own profiles" ON profiles
FOR UPDATE
TO authenticated
WITH CHECK ( (select auth.uid()) = id );

CREATE POLICY "Users can view their own profiles" ON profiles
FOR SELECT
TO authenticated
USING ( (select auth.uid()) = id );

CREATE POLICY "Users can insert their own profiles" ON profiles
FOR INSERT
TO anon
WITH CHECK ( (select auth.uid()) = id );

-- USER PROFILES POLICIES
CREATE POLICY "Users can update their own user_profiles" ON user_profiles
FOR UPDATE
TO authenticated
WITH CHECK ( (select auth.uid()) = id );

CREATE POLICY "Users can view their own user_profiles" ON user_profiles
FOR SELECT
TO authenticated
USING ( (select auth.uid()) = id );

CREATE POLICY "Users can insert their own user_profiles" ON user_profiles
FOR INSERT
TO anon
WITH CHECK ( (select auth.uid()) = id );

