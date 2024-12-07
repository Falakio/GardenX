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
    constraint orders_pkey primary key (id),
    constraint fk_user foreign key (user_id) references auth.users (id) on delete cascade,
    constraint fk_user_profile foreign key (user_id) references user_profiles (id) on delete cascade,
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