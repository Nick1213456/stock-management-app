import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Package, Settings, Save, X, List, Search, Plus, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import Login from './Login'
import SetNickname from './SetNickname'
import PullToRefresh from './PullToRefresh'
import PWAInstallPrompt from './PWAInstallPrompt'
import OfflineIndicator from './OfflineIndicator'
import './index.css'

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('list') // 'list' or 'settings'
  const [editingCell, setEditingCell] = useState(null) // { productId, field }
  const [editValue, setEditValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [settingsMode, setSettingsMode] = useState('product') // 'product', 'category', or 'description'
  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category_id: '', notes: '' })
  const [newCategory, setNewCategory] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingProduct, setEditingProduct] = useState({ name: '', sku: '', category_id: '', notes: '' })
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingCategory, setEditingCategory] = useState({ name: '' })
  const [session, setSession] = useState(null)
  const [needsNickname, setNeedsNickname] = useState(false)
  const [showNicknameEdit, setShowNicknameEdit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [description, setDescription] = useState('')
  const [descriptionUpdatedAt, setDescriptionUpdatedAt] = useState(null)
  const [descriptionUpdatedBy, setDescriptionUpdatedBy] = useState('')
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [editingDescription, setEditingDescription] = useState('')
  const [isSavingDescription, setIsSavingDescription] = useState(false)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', session, 'Error:', error)
      if (error) {
        console.error('Session error:', error)
      }
      setSession(session)
      if (!session) {
        setLoading(false)
      }
    }).catch(err => {
      console.error('Failed to get session:', err)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session)
      setSession(session)

      if (event === 'SIGNED_IN') {
        console.log('User signed in successfully!', session?.user)
        // 檢查使用者是否已設定暱稱
        const nickname = session?.user?.user_metadata?.nickname
        if (!nickname) {
          setNeedsNickname(true)
        } else {
          setNeedsNickname(false)
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setLoading(false)
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      }

      if (event === 'USER_UPDATED') {
        console.log('User updated')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchProducts()
      fetchCategories()
      fetchDescription()
    }
  }, [session])

  const fetchProducts = async () => {
    try {
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

  // 讀取說明文字
  const fetchDescription = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value, updated_at, updated_by')
        .eq('key', 'inventory_description')
        .single()

      if (error) {
        // 如果沒有資料，使用預設值
        if (error.code === 'PGRST116') {
          setDescription('這是千奇庫存管理系統的使用說明。點擊展開查看詳細內容。')
          setDescriptionUpdatedAt(null)
          setDescriptionUpdatedBy('')
        } else {
          throw error
        }
      } else {
        setDescription(data?.value || '這是千奇庫存管理系統的使用說明。點擊展開查看詳細內容。')
        setDescriptionUpdatedAt(data?.updated_at)
        setDescriptionUpdatedBy(data?.updated_by)
      }
    } catch (error) {
      console.error('Error fetching description:', error)
    }
  }

  // 儲存說明文字
  const saveDescription = async () => {
    if (!editingDescription.trim()) {
      alert('請輸入說明內容')
      return
    }

    const userIdentifier = session?.user?.user_metadata?.nickname || session?.user?.email || 'Unknown'

    try {
      setIsSavingDescription(true)
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'inventory_description',
          value: editingDescription,
          updated_at: new Date().toISOString(),
          updated_by: userIdentifier
        }, {
          onConflict: 'key'
        })

      if (error) throw error

      setDescription(editingDescription)
      setDescriptionUpdatedAt(new Date().toISOString())
      setDescriptionUpdatedBy(userIdentifier)
      alert('✓ 說明更新成功！')
    } catch (error) {
      console.error('Error saving description:', error)
      alert('✗ 更新說明失敗: ' + error.message)
    } finally {
      setIsSavingDescription(false)
    }
  }

  // 下拉更新處理函數
  const handleRefresh = async () => {
    await Promise.all([
      fetchProducts(),
      fetchCategories()
    ])
  }

  // 創建新商品
  const handleCreateProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name.trim() || !newProduct.sku.trim()) {
      alert('請輸入商品名稱和 SKU')
      return
    }

    const userIdentifier = session?.user?.user_metadata?.nickname || session?.user?.email || 'Unknown'

    try {
      setIsSaving(true)
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
            inventory_warehouse: 0,
            last_modified_by: userIdentifier,
            last_modified_by: userIdentifier
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
    } finally {
      setIsSaving(false)
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

    const userIdentifier = session?.user?.user_metadata?.nickname || session?.user?.email || 'Unknown'

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          sku: editingProduct.sku,
          category_id: editingProduct.category_id || null,
          notes: editingProduct.notes || null,
          last_modified_by: userIdentifier,
          last_modified_by: userIdentifier
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
    } finally {
      setIsSaving(false)
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

      await fetchCategories()
      setNewCategory('')
      alert('分類創建成功！')
    } catch (error) {
      console.error('Error creating category:', error)
      alert('創建分類失敗: ' + error.message)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  // 開始編輯分類
  const startEditCategory = (category) => {
    setEditingCategoryId(category.id)
    setEditingCategory({ name: category.name })
  }

  // 取消編輯分類
  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditingCategory({ name: '' })
  }

  // 儲存編輯分類
  const saveEditCategory = async () => {
    if (!editingCategory.name.trim()) {
      alert('請輸入分類名稱')
      return
    }

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('categories')
        .update({ name: editingCategory.name })
        .eq('id', editingCategoryId)

      if (error) throw error

      // 更新本地狀態
      setCategories(categories.map(c =>
        c.id === editingCategoryId ? { ...c, name: editingCategory.name } : c
      ))
      alert('✓ 分類更新成功！')
      cancelEditCategory()
    } catch (error) {
      console.error('Error updating category:', error)
      alert('✗ 更新分類失敗: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // 開始編輯庫存
  const startEdit = (productId, field, currentValue) => {
    setEditingCell({ productId, field })
    setEditValue(currentValue.toString())
  }

  // 取消編輯庫存
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

    // 取得使用者暱稱，如果沒有則使用 email
    const userIdentifier = session?.user?.user_metadata?.nickname || session?.user?.email || 'Unknown'

    try {
      setIsSaving(true)
      // 處理欄位名稱映射（資料庫中使用 war 而不是 warehouse）
      let dbFieldPrefix = editingCell.field
      if (editingCell.field === 'inventory_warehouse') {
        dbFieldPrefix = 'inventory_war'
      }

      // 決定要更新的時間戳欄位
      const timestampField = dbFieldPrefix + '_updated_at'
      const userField = dbFieldPrefix + '_updated_by'

      const { error } = await supabase
        .from('products')
        .update({
          [editingCell.field]: quantity,
          [timestampField]: new Date().toISOString(),
          [userField]: userIdentifier,
          last_modified_by: userIdentifier
        })
        .eq('id', editingCell.productId)

      if (error) throw error

      // 更新本地狀態
      setProducts(products.map(p =>
        p.id === editingCell.productId ? {
          ...p,
          [editingCell.field]: quantity,
          [timestampField]: new Date().toISOString(),
          [userField]: userIdentifier,
          last_modified_by: userIdentifier
        } : p
      ))
      cancelEdit()
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('更新庫存失敗: ' + error.message)
    } finally {
      setIsSaving(false)
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
            <button className="icon-btn save" onClick={saveEdit} disabled={isSaving}>
              {isSaving ? <div className="spinner-dark" style={{ width: '16px', height: '16px', borderTopColor: 'white', border: '2px solid rgba(255,255,255,0.3)' }}></div> : <Save size={16} />}
            </button>
            <button className="icon-btn cancel" onClick={cancelEdit} disabled={isSaving}>
              <X size={16} />
            </button>
          </div>
        </div>
      )

    }

    // 處理欄位名稱映射（資料庫中使用 war 而不是 warehouse）
    let dbFieldPrefix = field
    if (field === 'inventory_warehouse') {
      dbFieldPrefix = 'inventory_war'
    }

    // 取得對應的時間戳欄位
    const timestampField = dbFieldPrefix + '_updated_at'
    const timestamp = product[timestampField]
    const userField = dbFieldPrefix + '_updated_by'
    const updatedBy = product[userField]

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
          <div className="quantity-timestamp">
            {formatTimestamp(timestamp)}
            {updatedBy && <span className="updated-by-info">by {updatedBy}</span>}
          </div>
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
            千奇庫存管理系統
          </h1>
        </header>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  if (needsNickname) {
    return <SetNickname onComplete={() => {
      setNeedsNickname(false)
      // 重新載入 session 以取得更新後的 metadata
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
    }} />
  }

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="app">
          {showNicknameEdit && (
            <SetNickname
              initialNickname={session.user.user_metadata.nickname}
              onComplete={() => {
                setShowNicknameEdit(false)
                // 重新載入 session
                supabase.auth.getSession().then(({ data: { session } }) => {
                  setSession(session)
                })
              }}
              onCancel={() => setShowNicknameEdit(false)}
            />
          )}

          {/* Header */}
          <header className="header">
            <h1>
              <Package size={24} />
              千奇庫存管理系統
            </h1>
            <div className="user-profile">
              <div
                className="user-info"
                onClick={() => setShowNicknameEdit(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                  {session.user.user_metadata.nickname || session.user.email}
                </span>
              </div>
              <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* 商品列表頁 */}
          {currentTab === 'list' && (
            <div>
              {/* 說明卡片 */}
              <div
                className="description-card"
                style={{
                  background: 'var(--surface)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px var(--shadow)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: isDescriptionExpanded ? '12px' : '0'
                    }}>
                      <strong style={{ color: 'var(--primary)' }}>詳細說明</strong>
                    </div>
                    {isDescriptionExpanded && (
                      <div style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {description}
                      </div>
                    )}
                  </div>
                  <div style={{ marginLeft: '12px', color: 'var(--primary)' }}>
                    {isDescriptionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

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

              {products
                .filter(p => {
                  const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                  const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
                  return matchesSearch && matchesCategory
                })
                .sort((a, b) => {
                  const catA = categories.find(c => c.id === a.category_id)?.name || 'zzzz' // 未分類排最後
                  const catB = categories.find(c => c.id === b.category_id)?.name || 'zzzz'
                  if (catA !== catB) return catA.localeCompare(catB, 'zh-Hant')
                  return a.name.localeCompare(b.name, 'zh-Hant')
                })
                .length === 0 ? (
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
                        .sort((a, b) => {
                          const catA = categories.find(c => c.id === a.category_id)?.name || 'zzzz'
                          const catB = categories.find(c => c.id === b.category_id)?.name || 'zzzz'
                          if (catA !== catB) return catA.localeCompare(catB, 'zh-Hant')
                          return a.name.localeCompare(b.name, 'zh-Hant')
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
                  編輯商品
                </button>
                <button
                  className={`settings-tab ${settingsMode === 'category' ? 'active' : ''}`}
                  onClick={() => setSettingsMode('category')}
                >
                  編輯分類
                </button>
                <button
                  className={`settings-tab ${settingsMode === 'description' ? 'active' : ''}`}
                  onClick={() => {
                    setSettingsMode('description')
                    setEditingDescription(description)
                  }}
                >
                  編輯說明
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
                        <button type="submit" className="btn btn-primary btn-block" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <div className="spinner" style={{ marginRight: '8px' }}></div>
                              處理中...
                            </>
                          ) : (
                            <>
                              <Plus size={20} style={{ marginRight: '8px' }} />
                              確認新增
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {products.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>尚無商品</p>
                    ) : (
                      <div className="product-list">
                        {products
                          .sort((a, b) => {
                            const catA = categories.find(c => c.id === a.category_id)?.name || 'zzzz'
                            const catB = categories.find(c => c.id === b.category_id)?.name || 'zzzz'
                            if (catA !== catB) return catA.localeCompare(catB, 'zh-Hant')
                            return a.name.localeCompare(b.name, 'zh-Hant')
                          })
                          .map(product => {
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
                                        disabled={isSaving}
                                      >
                                        {isSaving ? (
                                          <>
                                            <div className="spinner" style={{ marginRight: '6px' }}></div>
                                            儲存中...
                                          </>
                                        ) : (
                                          <>
                                            <Save size={18} style={{ marginRight: '6px' }} />
                                            儲存
                                          </>
                                        )}
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
              ) : settingsMode === 'category' ? (
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
                        {categories.map(cat => {
                          const isEditing = editingCategoryId === cat.id

                          return (
                            <div key={cat.id} className={`category-item ${isEditing ? 'editing' : ''}`}>
                              {!isEditing ? (
                                <div
                                  className="category-info"
                                  onClick={() => startEditCategory(cat)}
                                  style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'background 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <span>{cat.name}</span>
                                </div>
                              ) : (
                                <div className="category-edit-form" style={{ padding: '12px' }}>
                                  <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label>分類名稱</label>
                                    <input
                                      type="text"
                                      value={editingCategory.name}
                                      onChange={(e) => setEditingCategory({ name: e.target.value })}
                                      placeholder="請輸入分類名稱"
                                      autoFocus
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      onClick={saveEditCategory}
                                      disabled={isSaving}
                                      style={{ flex: 1 }}
                                    >
                                      {isSaving ? (
                                        <>
                                          <div className="spinner" style={{ marginRight: '6px' }}></div>
                                          儲存中...
                                        </>
                                      ) : (
                                        <>
                                          <Save size={18} style={{ marginRight: '6px' }} />
                                          儲存
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={cancelEditCategory}
                                      style={{ flex: 1 }}
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
              ) : settingsMode === 'description' ? (
                <>
                  <div className="settings-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0 }}>編輯說明</h2>
                      {descriptionUpdatedAt && (
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          最後編輯：{new Date(descriptionUpdatedAt).toLocaleString('zh-TW', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {descriptionUpdatedBy && ` by ${descriptionUpdatedBy}`}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>說明內容</label>
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        placeholder="請輸入系統使用說明..."
                        rows="10"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          minHeight: '200px'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={saveDescription}
                      disabled={isSavingDescription}
                    >
                      {isSavingDescription ? (
                        <>
                          <div className="spinner" style={{ marginRight: '8px' }}></div>
                          儲存中...
                        </>
                      ) : (
                        <>
                          <Save size={20} style={{ marginRight: '8px' }} />
                          儲存說明
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </PullToRefresh>

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
    </>
  )
}

export default App
