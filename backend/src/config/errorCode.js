const server = {
  ERROR: {
    httpStatusCode: 400,
    body: {
      code: 'error',
      message: 'Something went wrong, please try again later.',
    },
  },

  ALREADY_EXISTS: {
    httpStatusCode: 400,
    body: {
      code: 'already_exists',
      message: 'Value already existed',
    },
  },

  INTERNAL_SERVER_ERROR: {
    httpStatusCode: 500,
    body: {
      code: 'internal_server_error',
      message: 'Something went wrong, please try again later.',
    },
  },

  NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: 'not_found',
      message: 'You lost somewhere. Please check url again.',
    },
  },

  FORBIDDEN: {
    httpStatusCode: 403,
    body: {
      code: 'forbidden',
      message: 'Permission denied.',
    },
  },

  UNAUTHORIZED: {
    httpStatusCode: 401,
    body: {
      code: 'unauthorized',
      message: 'You are not authorized.',
    },
  },

  INVALID_DATA: {
    httpStatusCode: 400,
    body: {
      code: 'invalid_data',
      message: 'Provided arguments are invalid or does not exists',
    },
  },

  PERMISSION_DENIED: {
    httpStatusCode: 403,
    body: {
      code: 'permission_denied',
      message: 'Permission denied.',
    },
  },
};

const postgres = {
  23505: {
    httpStatusCode: 400,
    code: 'duplicate_key_value',
    message: 'Value already exists',

    constraint: {
      uk_accounts_company_id_name: 'Account name already exists',
      uk_barcodes_code: 'Barcode already exists',
      uk_barcodes_product_id_quantity: 'Barcode already exists',
      uk_barcodes_serial_number: 'Barcode already exists',
      uk_companies_name: 'Company name already exists',
      uk_companies_phone_number: 'Company phone number already exists',
      uk_employee_attendance_employee_id_date:
        'Employee attendance already exists',
      uk_employees_company_id_phone_number:
        'Employee phone number already exists',
      uk_expense_categories_name: 'Expense category already exists',
      uk_gst_rates_hsn_code: 'GST rate with same hsn code already exists',
      uk_gst_rates_title: 'GST rate with same title already exists',
      uk_inventories_company_id_product_id: 'Inventory already exists',
      uk_meta_key: 'Meta key already exists',
      uk_parties_company_id_name: 'Party name already exists',
      uk_parties_company_id_phone_number: 'Party phone number already exists',
      uk_party_metal_category_discounts_party_id_metal_category_id:
        'Party metal category discount already exists',
      uk_party_product_prices_party_id_product_id:
        'Party product price already exists',
      uk_permissions_code: 'Permission code already exists',
      uk_permissions_name: 'Permission name already exists',
      uk_product_categories_name: 'Product category already exists',
      uk_product_metal_categories_name: 'Product metal category already exists',
      uk_products: 'Product already exists',
      uk_roles_name: 'Role name already exists',
      uk_user_company_roles_user_id_company_id_role_id:
        'User company role already exists',
      uk_users_name: 'User with same name already exists',
      uk_users_phone_number: 'User with same phone number already exists',
      uk_marketer_party: 'User with same party id already exists',
      uk_recent_product_product_binding_id: 'This Product already exists in recent product',
    },
  },

  23503: {
    httpStatusCode: 400,
    code: 'foreign_key_violation',
    message: 'Foreign key violation',

    constraint: {
      fk_user_company_roles_role_id: 'Role does not exist',
      fk_orders_company_id: 'Company does not exist',
      fk_inventory_transactions_created_by: 'User does not exist',
      fk_parties_created_by: 'User does not exist',
      fk_account_transactions_account_id: 'Account does not exist',
      fk_employees_company_id: 'Company does not exist',
      fk_order_items_product_id: 'Product does not exist',
      fk_parties_company_id: 'Company does not exist',
      fk_inventory_transactions_product_id: 'Product does not exist',
      fk_parties_updated_by: 'User does not exist',
      fk_employee_attendance_employee_id: 'Employee does not exist',
      fk_inventories_product_id: 'Product does not exist',
      fk_inventories_created_by: 'User does not exist',
      fk_notes_company_id: 'Company does not exist',
      fk_employees_updated_by: 'User does not exist',
      fk_inventories_updated_by: 'User does not exist',
      fk_orders_created_by: 'User does not exist',
      fk_reminders_updated_by: 'User does not exist',
      fk_accounts_created_by: 'User does not exist',
      fk_reminders_created_by: 'User does not exist',
      fk_notes_created_by: 'User does not exist',
      fk_party_product_prices_party_id: 'Party does not exist',
      fk_inventory_transactions_updated_by: 'User does not exist',
      fk_stock_transfers_purchase_transaction_id: 'Transaction does not exist',
      fk_accounts_company_id: 'Company does not exist',
      fk_account_transactions_expense_category_id:
        'Expense category does not exist',
      fk_account_transactions_party_id: 'Party does not exist',
      fk_transactions_updated_by: 'User does not exist',
      fk_reminders_company_id: 'Company does not exist',
      fk_stock_transfers_sender_company_id: 'Company does not exist',
      fk_sessions_user_id: 'User does not exist',
      fk_employees_created_by: 'User does not exist',
      fk_transactions_company_id: 'Company does not exist',
    },
  },
};

module.exports = {
  server,
  postgres,
};
