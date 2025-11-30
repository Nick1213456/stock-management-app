import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Package, Settings, Save, X, List, Search, Plus } from 'lucide-react'
import PWAInstallPrompt from './PWAInstallPrompt'
import OfflineIndicator from './OfflineIndicator'
import './index.css'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('list') // 'list' or 'settings'
  const [editingCell, setEditingCell] = useState(null) // { productId, field }
  const [editValue, setEditValue] = useState('')
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category_id: '', notes: '' })
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [settingsMode, setSettingsMode] = useState('product') // 'product' or 'category'
  const [newCategory, setNewCategory] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingProduct, setEditingProduct] = useState({ name: '', sku: '', category_id: '', notes: '' })

  // 載入所有商品
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('載入商品失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('載入分類失敗: ' + error.message)
    }
  }

  // 創建新商品
  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name.trim() || !newProduct.sku.trim()) {
      alert('請輸入商品名稱和 SKU')
      return
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: newProduct.name,
            sku: newProduct.sku,
            category_id: newProduct.category_id || null,
            notes: newProduct.notes || null,
            inventory_1f: 0,
            inventory_2f: 0,
            inventory_warehouse: 0
          }
        ])
        .select()

      if (error) throw error

      setProducts([...data, ...products])
      setNewProduct({ name: '', sku: '', category_id: '', notes: '' })
      setShowAddProductForm(false)
      alert('商品創建成功！')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('創建商品失敗: ' + error.message)
    }
  }

  // 開始編輯商品
  const startEditProduct = (product) => {
    setEditingProductId(product.id)
    setEditingProduct({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id || '',
      notes: product.notes || ''
    })
  }

  // 取消編輯商品
  const cancelEditProduct = () => {
    setEditingProductId(null)
    setEditingProduct({ name: '', sku: '', category_id: '', notes: '' })
  }

  // 儲存編輯商品
  const saveEditProduct = async () => {
    if (!editingProduct.name.trim() || !editingProduct.sku.trim()) {
      alert('請輸入商品名稱和 SKU')
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          sku: editingProduct.sku,
          category_id: editingProduct.category_id || null,
          notes: editingProduct.notes || null
        })
        .eq('id', editingProductId)

      if (error) throw error

      // 更新本地狀態
      setProducts(products.map(p =>
        p.id === editingProductId ? { ...p, ...editingProduct } : p
      ))
      alert('✓ 商品更新成功！')
      cancelEditProduct()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('✗ 更新商品失敗: ' + error.message)
    }
  }

  // 創建新分類
  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.trim()) {
      alert('請輸入分類名稱')
      return
    }

    setIsCreatingCategory(true)
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategory }])

      if (error) throw error

      setNewCategory('')
      alert('✓ 分類創建成功！')
      await fetchCategories() // 重新載入分類列表
    } catch (error) {
      console.error('Error creating category:', error)
      alert('✗ 創建分類失敗: ' + error.message)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  // 開始編輯
  const startEdit = (productId, field, currentValue) => {
    setEditingCell({ productId, field })
    setEditValue(currentValue.toString())
  }

  // 取消編輯
  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  // 保存編輯
  const saveEdit = async () => {
    if (!editingCell) return

    const quantity = parseInt(editValue)
    if (isNaN(quantity) || quantity < 0) {
      alert('請輸入有效的數量（0或正整數，不能是負數）')
      return
    }

    try {
      // 決定要更新的時間戳欄位
      const timestampField = editingCell.field + '_updated_at'

      const { error } = await supabase
        .from('products')
        .update({
          [editingCell.field]: quantity,
          [timestampField]: new Date().toISOString()
        })
        .eq('id', editingCell.productId)

      if (error) throw error

      // 更新本地狀態
      setProducts(products.map(p =>
        p.id === editingCell.productId ? {
          ...p,
          [editingCell.field]: quantity,
          [timestampField]: new Date().toISOString()
        } : p
      ))
      cancelEdit()
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('更新庫存失敗: ' + error.message)
    }
  }

  // 渲染數量單元格
  const renderQuantityCell = (product, field) => {
    const isEditing = editingCell?.productId === product.id && editingCell?.field === field

    if (isEditing) {
      return (
        <div className="quantity-edit-wrapper">
          <input
            type="number"
            className="edit-quantity-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            autoFocus
          />
          <div className="edit-actions">
            <button className="icon-btn save" onClick={saveEdit}>
              <Save size={16} />
            </button>
            <button className="icon-btn cancel" onClick={cancelEdit}>
              <X size={16} />
            </button>
          </div>
        </div>
      )

    }

    // 取得對應的時間戳欄位
    const timestampField = field + '_updated_at'
    const timestamp = product[timestampField]

    // 格式化時間顯示
    const formatTimestamp = (ts) => {
      if (!ts) return ''
      const date = new Date(ts)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${month}/${day} ${hours}:${minutes}`
    }

    return (
      <div
        className="quantity-cell-wrapper"
        onClick={() => startEdit(product.id, field, product[field])}
      >
        <div className="quantity-cell">{product[field]}</div>
        {timestamp && (
          <div className="quantity-timestamp">{formatTimestamp(timestamp)}</div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="app">
        <header className="header">
          <h1>
            <Package size={24} />
            庫存管理系統
          </h1>
        </header>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>
          <Package size={24} />
          庫存管理系統
        </h1>
      </header>

      {/* 商品列表頁 */}
      {currentTab === 'list' && (
        <div>
          <div className="search-filter-container">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="搜尋商品名稱或 SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">所有分類</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
            return matchesSearch && matchesCategory
          }).length === 0 ? (
            <div className="empty-state">
              <h3>尚無商品</h3>
              <p>請前往「商品設定」頁面新增商品</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>商品名稱</th>
                    <th>1F</th>
                    <th>2F</th>
                    <th>倉庫</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => {
                      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
                      return matchesSearch && matchesCategory
                    })
                    .map(product => {
                      const category = categories.find(c => c.id === product.category_id)
                      return (
                        <tr key={product.id}>
                          <td>
                            <div>{product.name}</div>
                            <div className="sku-text">
                              {category ? `分類: ${category.name}` : 'SKU: ' + product.sku}
                            </div>
                          </td>
                          <td>{renderQuantityCell(product, 'inventory_1f')}</td>
                          <td>{renderQuantityCell(product, 'inventory_2f')}</td>
                          <td>{renderQuantityCell(product, 'inventory_warehouse')}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {currentTab === 'settings' && (
        <div className="settings-container">
          <div className="settings-tabs">
            <button
              className={`settings-tab ${settingsMode === 'product' ? 'active' : ''}`}
              onClick={() => setSettingsMode('product')}
            >
              新增商品
            </button>
            <button
              className={`settings-tab ${settingsMode === 'category' ? 'active' : ''}`}
              onClick={() => setSettingsMode('category')}
            >
              新增分類
            </button>
          </div>

          {settingsMode === 'product' ? (
            <>
              <div className="settings-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>編輯商品</h2>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowAddProductForm(!showAddProductForm)}
                  >
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    {showAddProductForm ? '取消新增' : '新增商品'}
                  </button>
                </div>

                {showAddProductForm && (
                  <form onSubmit={handleCreateProduct} style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg)', borderRadius: '8px' }}>
                    <div className="form-group">
                      <label>商品名稱</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="請輸入商品名稱"
                      />
                    </div>
                    <div className="form-group">
                      <label>SKU 編號</label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        placeholder="請輸入 SKU 編號"
                      />
                    </div>
                    <div className="form-group">
                      <label>商品分類</label>
                      <select
                        value={newProduct.category_id}
                        onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                        className={!newProduct.category_id ? 'select-placeholder' : ''}
                      >
                        <option value="">選擇分類 (選填)</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>備註</label>
                      <input
                        type="text"
                        value={newProduct.notes}
                        onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                        placeholder="請輸入備註 (選填)"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                      <Plus size={20} style={{ marginRight: '8px' }} />
                      確認新增
                    </button>
                  </form>
                )}

                {products.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>尚無商品</p>
                ) : (
                  <div className="product-list">
                    {products.map(product => {
                      const category = categories.find(c => c.id === product.category_id)
                      const isEditing = editingProductId === product.id

                      return (
                        <div key={product.id} className={`product-item ${isEditing ? 'editing' : ''}`}>
                          {!isEditing ? (
                            <div
                              className="product-info"
                              onClick={() => startEditProduct(product)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="product-name">{product.name}</div>
                              <div className="product-meta">
                                <span className="product-sku">SKU: {product.sku}</span>
                                {category && <span className="product-category">分類: {category.name}</span>}
                                {product.notes && <span className="product-notes">備註: {product.notes}</span>}
                              </div>
                            </div>
                          ) : (
                            <div className="product-edit-form">
                              <div className="form-group">
                                <label>商品名稱</label>
                                <input
                                  type="text"
                                  value={editingProduct.name}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                  placeholder="請輸入商品名稱"
                                />
                              </div>
                              <div className="form-group">
                                <label>SKU 編號</label>
                                <input
                                  type="text"
                                  value={editingProduct.sku}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                                  placeholder="請輸入 SKU 編號"
                                />
                              </div>
                              <div className="form-group">
                                <label>商品分類</label>
                                <select
                                  value={editingProduct.category_id}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                                  className={!editingProduct.category_id ? 'select-placeholder' : ''}
                                >
                                  <option value="">選擇分類 (選填)</option>
                                  {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group">
                                <label>備註</label>
                                <input
                                  type="text"
                                  value={editingProduct.notes}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                                  placeholder="請輸入備註 (選填)"
                                />
                              </div>
                              <div className="product-edit-actions">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={saveEditProduct}
                                >
                                  <Save size={18} style={{ marginRight: '6px' }} />
                                  儲存
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={cancelEditProduct}
                                >
                                  <X size={18} style={{ marginRight: '6px' }} />
                                  取消
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="settings-card">
                <h2>新增分類</h2>
                <form onSubmit={handleCreateCategory}>
                  <div className="form-group">
                    <label>分類名稱</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="請輸入分類名稱"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isCreatingCategory}
                  >
                    {isCreatingCategory ? (
                      <>
                        <div className="spinner" style={{ marginRight: '8px' }}></div>
                        處理中...
                      </>
                    ) : (
                      <>
                        <Plus size={20} style={{ marginRight: '8px' }} />
                        新增分類
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="settings-card" style={{ marginTop: '20px' }}>
                <h2>現有分類</h2>
                {categories.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>尚無分類</p>
                ) : (
                  <div className="category-list">
                    {categories.map(cat => (
                      <div key={cat.id} className="category-item">
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 底部導航 */}
      <nav className="bottom-nav">
        <div className="nav-container">
          <button
            className={`nav-item ${currentTab === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentTab('list')}
          >
            <List size={24} />
            <span>商品列表</span>
          </button>
          <button
            className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentTab('settings')}
          >
            <Settings size={24} />
            <span>商品設定</span>
          </button>
        </div>
      </nav>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}

export default App
