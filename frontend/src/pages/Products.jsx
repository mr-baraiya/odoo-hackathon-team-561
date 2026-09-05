import React, { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Search, Check } from 'lucide-react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/helpers';

const Products = () => {
  const { products, addProductAction, updateProductAction, deleteProductAction } = useData();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Hardware',
    price: 100,
    cost: 60,
    tax: 18,
    sku: 'HW-01',
    inStock: 50,
    maxDiscount: 15
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProd(null);
    setFormData({
      name: '',
      category: 'Hardware',
      price: 100,
      cost: 60,
      tax: 18,
      sku: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      inStock: 50,
      maxDiscount: 15
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProd(prod);
    setFormData({ ...prod });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert('Please enter product name');

    if (editingProd) {
      updateProductAction(editingProd.id, formData);
      alert('Product updated successfully!');
    } else {
      addProductAction(formData);
      alert('Product created successfully!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this product from catalog?')) {
      deleteProductAction(id);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      render: (row) => (
        <div>
          <span className="font-bold text-textmain block">{row.name}</span>
          <span className="text-[11px] text-textsub">SKU: {row.sku || row.id}</span>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => <span className="font-medium text-xs text-textsub">{row.category}</span>
    },
    {
      header: 'Price',
      render: (row) => <span className="font-bold text-textmain">{formatCurrency(row.price)}</span>
    },
    {
      header: 'Tax Rate',
      render: (row) => <span className="text-xs text-textsub">{row.tax}%</span>
    },
    {
      header: 'Stock Status',
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${row.inStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {row.inStock > 0 ? `${row.inStock} In Stock` : 'Out of Stock'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenEdit(row)} className="p-1 text-textsub hover:text-primary rounded">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1 text-textsub hover:text-rose-600 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-textmain flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Admin Product Catalog Management
          </h1>
          <p className="text-xs text-textsub mt-0.5">Manage SKU prices, margin thresholds, and inventory levels</p>
        </div>
        <Button variant="success" icon={Plus} onClick={handleOpenAdd}>
          Add Product
        </Button>
      </div>

      <Card>
        <div className="mb-4 max-w-xs">
          <Input
            icon={Search}
            placeholder="Search product catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          data={filteredProducts}
          emptyMessage="No products match search query."
        />
      </Card>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProd ? 'Edit Product' : 'Add New Catalog Product'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="success" icon={Check} onClick={handleSave}>Save Product</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Laptop Pro 15"
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'Hardware', label: 'Hardware' },
              { value: 'Accessories', label: 'Accessories' },
              { value: 'Service', label: 'Service' },
              { value: 'Subscription', label: 'Subscription' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="List Price ($)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <Input
              label="Estimated Cost ($)"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tax Rate (%)"
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
            />
            <Input
              label="Max Discount Allowed (%)"
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Products;
