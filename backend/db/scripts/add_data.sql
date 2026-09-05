insert into users (name, phone_number, password, is_root_user)
values ('root', '1234567890', '$2b$10$ItdjpYK5IUu19VqWWqp0A.pG23.GWLAlAzmkh6co534NygYNxEK92', true);


insert into permissions (code, name, description) values
('product.read', 'Read products', 'user can read products'),
('product.create', 'Create products', 'user can create products'),
('product.update', 'Update products', 'user can update products'),
('product.delete', 'Delete products', 'user can delete products'),
('party.read', 'Read parties', 'user can read parties'),
('party.create', 'Create parties', 'user can create parties'),
('party.update', 'Update parties', 'user can update parties'),
('party.delete', 'Delete parties', 'user can delete parties'),
('transaction.read', 'Read transactions', 'user can read transactions'),
('transaction.create', 'Create transactions', 'user can create transactions'),
('transaction.update', 'Update transactions', 'user can update transactions'),
('transaction.delete', 'Delete transactions', 'user can delete transactions'),
('inventory.read', 'Read inventory', 'user can read inventory'),
('inventory.create', 'Create inventory', 'user can create inventory'),
('inventory.update', 'Update inventory', 'user can update inventory'),
('inventory.delete', 'Delete inventory', 'user can delete inventory'),
('account.read', 'Read accounts', 'user can read accounts'),
('account.create', 'Create accounts', 'user can create accounts'),
('account.update', 'Update accounts', 'user can update accounts'),
('account.delete', 'Delete accounts', 'user can delete accounts');

insert into permissions (code,name,description) values
('note.create','Create Note','Create a note'),
('note.read','Read Note','Read a note'),
('note.update','Update Note','Update a note'),
('note.delete','Delete Note','Delete a note'),
('reminder.create','Create Reminder','Create a reminder'),
('reminder.read','Read Reminder','Read a reminder'),
('reminder.update','Update Reminder','Update a reminder'),
('reminder.delete','Delete Reminder','Delete a reminder');


insert into gst_rates (title, type, hsn_code, rate, description) values
('GST 5%', 'goods', null, 5, null),
('GST 12%', 'goods', null, 12, null),
('GST 18%', 'goods', null, 18, null),
('GST 28%', 'goods', null, 28, null),
('GST 3%', 'goods', null, 3, null),
('No GST', 'goods', null, 0, null),
('8206 GST 18%', 'goods', '8206', 18, 'Tools of two or more of the headings 8202
to 8205, put up in sets for retail sale');


insert into permissions (code, name, description) values
('stockTransfer.read', 'Read stock transfers', 'user can read stock transfers'),
('stockTransfer.create', 'Create stock transfers', 'user can create stock transfers'),
('employee.read', 'Read employees', 'user can read employees'),
('employee.create', 'Create employees', 'user can create employees'),
('employee.update', 'Update employees', 'user can update employees'),
('employee.delete', 'Delete employees', 'user can delete employees');