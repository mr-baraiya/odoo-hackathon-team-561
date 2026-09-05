






SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE FUNCTION public.generate_product_full_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  NEW.full_name := CONCAT_WS(' ', NEW.name, NEW.size, NEW.finish);
  return NEW;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.account_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    serial_number integer NOT NULL,
    is_black boolean DEFAULT false NOT NULL,
    account_id uuid NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type character varying(20) NOT NULL,
    category character varying(50) DEFAULT 'other'::character varying NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    party_id uuid,
    remark text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    expense_category_id uuid,
    employee_id uuid,
    meta jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT cc_account_transactions_category CHECK (((category)::text = ANY ((ARRAY['party_payment'::character varying, 'expense'::character varying, 'other'::character varying, 'employee_payment'::character varying])::text[]))),
    CONSTRAINT cc_account_transactions_type CHECK (((type)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying])::text[])))
);



CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    opening_balance numeric(12,2) DEFAULT 0 NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    type character varying(50),
    account_number character varying(255),
    ifsc_code character varying(255),
    bank_name character varying(255),
    branch_name character varying(255),
    holder_name character varying(255),
    upi_id character varying(255),
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);



CREATE TABLE public.barcodes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    serial_number integer NOT NULL,
    code character varying(10) GENERATED ALWAYS AS (lpad((serial_number)::text, 6, '0'::text)) STORED,
    product_id uuid NOT NULL,
    quantity numeric(12,2) DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid NOT NULL
);



CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(15) NOT NULL,
    logo text,
    address text,
    email character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.employee_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    employee_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    day_count numeric(3,2) DEFAULT 1 NOT NULL,
    day_salary numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    remark text
);



CREATE TABLE public.employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(15) NOT NULL,
    address text,
    job_title character varying(255),
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    black_balance numeric(12,2) DEFAULT 0 NOT NULL,
    daily_salary numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


CREATE TABLE public.expense_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text
);



CREATE TABLE public.gst_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    hsn_code character varying(20),
    rate numeric(4,2) NOT NULL,
    description character varying(255),
    CONSTRAINT chk_gst_rates_type CHECK (((type)::text = ANY ((ARRAY['goods'::character varying, 'services'::character varying])::text[])))
);


CREATE TABLE public.inventories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    stock numeric(12,2) DEFAULT 0 NOT NULL,
    minimum_stock numeric(12,2) DEFAULT 0 NOT NULL,
    maximum_stock numeric(12,2) DEFAULT 100 NOT NULL,
    location text,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(20) NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) DEFAULT 0 NOT NULL,
    remark text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT cc_inventory_transactions_type CHECK (((type)::text = ANY ((ARRAY['in'::character varying, 'out'::character varying])::text[])))
);



CREATE TABLE public.meta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(255) NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    party_id uuid,
    title character varying(300) NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


CREATE TABLE public.order_items (
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) DEFAULT 0 NOT NULL,
    remark text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    discount numeric(5,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL
);



CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    party_id uuid NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    date timestamp with time zone DEFAULT now() NOT NULL,
    remark text,
    transaction_id uuid,
    sub_total numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(5,2) DEFAULT 0 NOT NULL,
    cash_discount numeric(12,2) DEFAULT 0 NOT NULL,
    tax numeric(5,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    additional_charges jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
    serial_number integer NOT NULL,
    is_black boolean DEFAULT false
);



CREATE TABLE public.parties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(15) NOT NULL,
    email character varying(255),
    address text,
    opening_balance numeric(12,2) DEFAULT 0 NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    black_opening_balance numeric(12,2) DEFAULT 0 NOT NULL,
    black_balance numeric(12,2) DEFAULT 0 NOT NULL,
    associated_company_id uuid,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    gst_number character varying(100),
    transport_name character varying(255),
    CONSTRAINT cc_parties_type CHECK (((type)::text = ANY ((ARRAY['company'::character varying, 'customer'::character varying, 'supplier'::character varying])::text[])))
);


CREATE TABLE public.party_metal_category_discounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    party_id uuid NOT NULL,
    product_metal_category_id uuid NOT NULL,
    discount numeric(5,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


CREATE TABLE public.party_product_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    party_id uuid NOT NULL,
    product_id uuid NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.product_metal_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_category_id uuid NOT NULL,
    product_metal_category_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    hsn_code character varying(100),
    finish character varying(100),
    size character varying(100),
    full_name character varying(500),
    purchase_price numeric(12,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    description text,
    meta jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    gst_rate_id uuid NOT NULL
);


CREATE TABLE public.reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    remind_at timestamp with time zone,
    title character varying(300) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ip_address character varying(255) NOT NULL,
    user_agent character varying(255) NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone,
    deleted_at timestamp with time zone,
    permissions jsonb[] DEFAULT ARRAY[]::jsonb[] NOT NULL
);


CREATE TABLE public.stock_transfers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_company_id uuid NOT NULL,
    receiver_company_id uuid NOT NULL,
    sale_transaction_id uuid,
    purchase_transaction_id uuid,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    serial_number integer NOT NULL,
    is_black boolean DEFAULT false
);


CREATE TABLE public.tokens (
    token text NOT NULL,
    code text,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL
);


CREATE TABLE public.transaction_items (
    transaction_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity numeric(12,2) DEFAULT 0 NOT NULL,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(5,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    remark text,
    gst numeric(5,2) DEFAULT 0 NOT NULL
);


CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    serial_number integer NOT NULL,
    company_id uuid NOT NULL,
    party_id uuid NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_black boolean DEFAULT false NOT NULL,
    type character varying(50) NOT NULL,
    sub_total numeric(12,2) DEFAULT 0 NOT NULL,
    cash_discount numeric(12,2) DEFAULT 0 NOT NULL,
    tax numeric(5,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    remark text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    additional_charges jsonb[] DEFAULT ARRAY[]::jsonb[] NOT NULL,
    freight_charges numeric(12,2) DEFAULT 0 NOT NULL,
    affect_inventory boolean DEFAULT true NOT NULL,
    affect_account boolean DEFAULT true NOT NULL,
    round_off numeric(12,2) DEFAULT 0 NOT NULL,
    CONSTRAINT cc_transactions_type CHECK (((type)::text = ANY ((ARRAY['sale'::character varying, 'sale_return'::character varying, 'purchase'::character varying, 'purchase_return'::character varying, 'stock_send'::character varying, 'stock_receive'::character varying, 'quotation'::character varying, 'scanned_order'::character varying])::text[])))
);


CREATE TABLE public.user_company_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_root_user boolean DEFAULT false NOT NULL,
    name character varying(255) NOT NULL,
    phone_number character varying(15) NOT NULL,
    password text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by uuid
);




ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT pk_account_transactions PRIMARY KEY (id);


ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT pk_accounts PRIMARY KEY (id);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT pk_barcodes PRIMARY KEY (id);


ALTER TABLE ONLY public.companies
    ADD CONSTRAINT pk_companies PRIMARY KEY (id);


ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT pk_employee_attendance PRIMARY KEY (id);


ALTER TABLE ONLY public.employees
    ADD CONSTRAINT pk_employees PRIMARY KEY (id);


ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT pk_expense_categories PRIMARY KEY (id);


ALTER TABLE ONLY public.gst_rates
    ADD CONSTRAINT pk_gst_rates PRIMARY KEY (id);


ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT pk_inventories PRIMARY KEY (id);


ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT pk_inventory_transactions PRIMARY KEY (id);


ALTER TABLE ONLY public.meta
    ADD CONSTRAINT pk_meta PRIMARY KEY (id);


ALTER TABLE ONLY public.notes
    ADD CONSTRAINT pk_notes PRIMARY KEY (id);


ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT pk_order_items PRIMARY KEY (order_id, product_id);


ALTER TABLE ONLY public.orders
    ADD CONSTRAINT pk_orders PRIMARY KEY (id);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT pk_parties PRIMARY KEY (id);


ALTER TABLE ONLY public.party_metal_category_discounts
    ADD CONSTRAINT pk_party_metal_category_discounts PRIMARY KEY (id);


ALTER TABLE ONLY public.party_product_prices
    ADD CONSTRAINT pk_party_product_prices PRIMARY KEY (id);


ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT pk_permissions PRIMARY KEY (id);


ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT pk_product_categories PRIMARY KEY (id);


ALTER TABLE ONLY public.product_metal_categories
    ADD CONSTRAINT pk_product_metal_categories PRIMARY KEY (id);


ALTER TABLE ONLY public.products
    ADD CONSTRAINT pk_products PRIMARY KEY (id);


ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT pk_reminders PRIMARY KEY (id);


ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT pk_role_permissions PRIMARY KEY (id);


ALTER TABLE ONLY public.roles
    ADD CONSTRAINT pk_roles PRIMARY KEY (id);


ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT pk_sessions PRIMARY KEY (id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT pk_stock_transfers PRIMARY KEY (id);


ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT pk_tokens_token PRIMARY KEY (token);


ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT pk_transactions PRIMARY KEY (id);


ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT pk_user_company_roles PRIMARY KEY (id);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);


ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT uk_accounts_company_id_name UNIQUE (company_id, name);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT uk_barcodes_code UNIQUE (code);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT uk_barcodes_product_id_quantity UNIQUE (product_id, quantity);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT uk_barcodes_serial_number UNIQUE (serial_number);


ALTER TABLE ONLY public.companies
    ADD CONSTRAINT uk_companies_name UNIQUE (name);


ALTER TABLE ONLY public.companies
    ADD CONSTRAINT uk_companies_phone_number UNIQUE (phone_number);


ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT uk_employee_attendance_employee_id_date UNIQUE (employee_id, date);


ALTER TABLE ONLY public.employees
    ADD CONSTRAINT uk_employees_company_id_phone_number UNIQUE (company_id, phone_number);


ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT uk_expense_categories_name UNIQUE (name);


ALTER TABLE ONLY public.gst_rates
    ADD CONSTRAINT uk_gst_rates_hsn_code UNIQUE (hsn_code);


ALTER TABLE ONLY public.gst_rates
    ADD CONSTRAINT uk_gst_rates_title UNIQUE (title);


ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT uk_inventories_company_id_product_id UNIQUE (company_id, product_id);


ALTER TABLE ONLY public.meta
    ADD CONSTRAINT uk_meta_key UNIQUE (key);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT uk_parties_company_id_name UNIQUE (company_id, name);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT uk_parties_company_id_phone_number UNIQUE (company_id, phone_number);


ALTER TABLE ONLY public.party_metal_category_discounts
    ADD CONSTRAINT uk_party_metal_category_discounts_party_id_metal_category_id UNIQUE (party_id, product_metal_category_id);


ALTER TABLE ONLY public.party_product_prices
    ADD CONSTRAINT uk_party_product_prices_party_id_product_id UNIQUE (party_id, product_id);


ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uk_permissions_code UNIQUE (code);


ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uk_permissions_name UNIQUE (name);


ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT uk_product_categories_name UNIQUE (name);


ALTER TABLE ONLY public.product_metal_categories
    ADD CONSTRAINT uk_product_metal_categories_name UNIQUE (name);


ALTER TABLE ONLY public.products
    ADD CONSTRAINT uk_products UNIQUE (name, size, finish, product_metal_category_id);


ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_roles_name UNIQUE (name);


ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT uk_user_company_roles_user_id_company_id_role_id UNIQUE (user_id, company_id, role_id);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_users_name UNIQUE (name);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_users_phone_number UNIQUE (phone_number);


ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT ul_role_permissions_role_id_permission_id UNIQUE (role_id, permission_id);






CREATE TRIGGER generate_product_full_name_trigger BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.generate_product_full_name();


ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT fk_account_transactions_account_id FOREIGN KEY (account_id) REFERENCES public.accounts(id);


ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT fk_account_transactions_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT fk_account_transactions_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id);


ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT fk_account_transactions_expense_category_id FOREIGN KEY (expense_category_id) REFERENCES public.expense_categories(id);


ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT fk_account_transactions_party_id FOREIGN KEY (party_id) REFERENCES public.parties(id);


ALTER TABLE ONLY public.account_transactions
    ADD CONSTRAINT fk_account_transactions_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fk_accounts_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fk_accounts_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT fk_accounts_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT fk_barcodes_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT fk_barcodes_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


ALTER TABLE ONLY public.barcodes
    ADD CONSTRAINT fk_barcodes_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT fk_employee_attendance_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT fk_employee_attendance_employee_id FOREIGN KEY (employee_id) REFERENCES public.employees(id);


ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT fk_employee_attendance_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employees_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT fk_inventories_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT fk_inventories_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT fk_inventories_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


ALTER TABLE ONLY public.inventories
    ADD CONSTRAINT fk_inventories_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT fk_inventory_transactions_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT fk_inventory_transactions_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT fk_inventory_transactions_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT fk_inventory_transactions_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.notes
    ADD CONSTRAINT fk_notes_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.notes
    ADD CONSTRAINT fk_notes_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.notes
    ADD CONSTRAINT fk_notes_party_id FOREIGN KEY (party_id) REFERENCES public.parties(id);


ALTER TABLE ONLY public.notes
    ADD CONSTRAINT fk_notes_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES public.orders(id);


ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_party_id FOREIGN KEY (party_id) REFERENCES public.parties(id);


ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_transaction_id FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT fk_parties_associated_company_id FOREIGN KEY (associated_company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT fk_parties_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT fk_parties_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.parties
    ADD CONSTRAINT fk_parties_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.party_metal_category_discounts
    ADD CONSTRAINT fk_party_metal_category_discounts_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.party_metal_category_discounts
    ADD CONSTRAINT fk_party_metal_category_discounts_party_id FOREIGN KEY (party_id) REFERENCES public.parties(id);


ALTER TABLE ONLY public.party_metal_category_discounts
    ADD CONSTRAINT fk_party_metal_category_discounts_product_metal_category_id FOREIGN KEY (product_metal_category_id) REFERENCES public.product_metal_categories(id);


ALTER TABLE ONLY public.party_metal_category_discounts
    ADD CONSTRAINT fk_party_metal_category_discounts_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.party_product_prices
    ADD CONSTRAINT fk_party_product_prices_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.party_product_prices
    ADD CONSTRAINT fk_party_product_prices_party_id FOREIGN KEY (party_id) REFERENCES public.parties(id);


ALTER TABLE ONLY public.party_product_prices
    ADD CONSTRAINT fk_party_product_prices_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


ALTER TABLE ONLY public.party_product_prices
    ADD CONSTRAINT fk_party_product_prices_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_gst_rate_id FOREIGN KEY (gst_rate_id) REFERENCES public.gst_rates(id);


ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_product_category_id FOREIGN KEY (product_category_id) REFERENCES public.product_categories(id);


ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_product_metal_category_id FOREIGN KEY (product_metal_category_id) REFERENCES public.product_metal_categories(id);


ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT fk_reminders_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT fk_reminders_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT fk_reminders_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES public.roles(id);


ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk_stock_transfers_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk_stock_transfers_purchase_transaction_id FOREIGN KEY (purchase_transaction_id) REFERENCES public.transactions(id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk_stock_transfers_receiver_company_id FOREIGN KEY (receiver_company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk_stock_transfers_sale_transaction_id FOREIGN KEY (sale_transaction_id) REFERENCES public.transactions(id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk_stock_transfers_sender_company_id FOREIGN KEY (sender_company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT fk_stock_transfers_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT fk_transaction_items_product_id FOREIGN KEY (product_id) REFERENCES public.products(id);


ALTER TABLE ONLY public.transaction_items
    ADD CONSTRAINT fk_transaction_items_transaction_id FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_created_by FOREIGN KEY (created_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_party_id FOREIGN KEY (party_id) REFERENCES public.parties(id);


ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_transactions_updated_by FOREIGN KEY (updated_by) REFERENCES public.users(id);


ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT fk_user_company_roles_company_id FOREIGN KEY (company_id) REFERENCES public.companies(id);


ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT fk_user_company_roles_role_id FOREIGN KEY (role_id) REFERENCES public.roles(id);


ALTER TABLE ONLY public.user_company_roles
    ADD CONSTRAINT fk_user_company_roles_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_deleted_by FOREIGN KEY (deleted_by) REFERENCES public.users(id);

