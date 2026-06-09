import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import SearchBar from './components/SearchBar'
import StatsBar from './components/StatsBar'
import ConfirmDialog from './components/ConfirmDialog'
import ToastContainer from './components/Toast'
import { v4 as uuidv4 } from 'uuid'
import { IoEye, IoEyeOff, IoTrashBin } from 'react-icons/io5'
import './App.css'

function App() {
  // Initialize state lazily from localStorage to fix React StrictMode wipeout bug
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem('todos')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load todos:', e)
    }
    return []
  })
  const [showFinished, setShowFinished] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null })

  // Save to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Toast system
  const addToast = useCallback((message, type = 'info') => {
    const id = uuidv4()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Add todo
  const handleAdd = (todoText, priority, dueDate) => {
    setTodos(prev => [
      ...prev,
      {
        id: uuidv4(),
        todo: todoText,
        isCompleted: false,
        priority: priority || 'medium',
        dueDate: dueDate || '',
        createdAt: new Date().toISOString(),
      }
    ])
    addToast('Task added successfully!', 'success')
  }

  // Edit todo (inline)
  const handleEdit = (id, newText) => {
    setTodos(prev =>
      prev.map(item =>
        item.id === id ? { ...item, todo: newText } : item
      )
    )
    addToast('Task updated!', 'edit')
  }

  // Delete with confirmation
  const handleDeleteRequest = (id) => {
    setConfirmDialog({ isOpen: true, id })
  }

  const handleDeleteConfirm = () => {
    setTodos(prev => prev.filter(item => item.id !== confirmDialog.id))
    setConfirmDialog({ isOpen: false, id: null })
    addToast('Task deleted', 'delete')
  }

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, id: null })
  }

  // Toggle checkbox
  const handleCheckbox = (e) => {
    const id = e.target.name
    setTodos(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    )
  }

  // Clear all completed
  const handleClearCompleted = () => {
    const count = todos.filter(t => t.isCompleted).length
    if (count === 0) return
    setTodos(prev => prev.filter(item => !item.isCompleted))
    addToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`, 'delete')
  }

  // Toggle show finished
  const toggleFinished = () => {
    setShowFinished(prev => !prev)
  }

  // Filter by search
  const filteredTodos = searchQuery
    ? todos.filter(item => item.todo.toLowerCase().includes(searchQuery.toLowerCase()))
    : todos

  const completedCount = todos.filter(t => t.isCompleted).length

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Main content - Reduced padding to fit 1080p height without scroll */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* Page heading */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
              <span className='bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-400 bg-clip-text text-transparent'>
                Manage Your Tasks
              </span>
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
              Stay organized. Stay productive. Stay ahead.
            </p>
          </div>

          {/* ===== Main card ===== */}
          <div className='main-card' style={{ borderRadius: '20px', padding: '24px' }}>

            {/* Section: Add Todo */}
            <TodoInput onAdd={handleAdd} />

            {/* Divider */}
            <div className='divider' style={{ margin: '16px 0' }}></div>

            {/* Section: Stats */}
            <StatsBar todos={todos} />

            {/* Section: Controls */}
            {todos.length > 0 && (
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <div className='divider' style={{ marginBottom: '16px' }}></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <button
                    onClick={toggleFinished}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    {showFinished
                      ? <><IoEye style={{ color: '#a78bfa', fontSize: '16px' }} /> Showing completed</>
                      : <><IoEyeOff style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }} /> Hiding completed</>
                    }
                  </button>

                  {completedCount > 0 && (
                    <button
                      onClick={handleClearCompleted}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                    >
                      <IoTrashBin style={{ fontSize: '14px' }} />
                      Clear done ({completedCount})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Section: Search */}
            {todos.length > 2 && (
              <div style={{ marginBottom: '16px' }}>
                <SearchBar searchQuery={searchQuery} onSearch={setSearchQuery} />
              </div>
            )}

            {/* Section: Task list */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Your Tasks</h2>
              {searchQuery && (
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                  {filteredTodos.length} result{filteredTodos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <TodoList
              todos={filteredTodos}
              showFinished={showFinished}
              onCheckbox={handleCheckbox}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'rgba(255,255,255,0.12)', fontWeight: 500 }}>
            Built with ❤️ using React & Tailwind CSS
          </div>
        </div>
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default App
