import React, { useState } from 'react'
import { IoAdd } from 'react-icons/io5'
import { BsCalendar3 } from 'react-icons/bs'

const TodoInput = ({ onAdd }) => {
  const [todo, setTodo] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [showOptions, setShowOptions] = useState(false)

  const handleAdd = () => {
    if (todo.trim().length <= 3) return
    onAdd(todo.trim(), priority, dueDate)
    setTodo('')
    setPriority('medium')
    setDueDate('')
    setShowOptions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const priorities = [
    { key: 'high', label: 'High', bg: '#ef4444', shadow: 'rgba(239,68,68,0.3)' },
    { key: 'medium', label: 'Med', bg: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
    { key: 'low', label: 'Low', bg: '#22c55e', shadow: 'rgba(34,197,94,0.3)' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IoAdd style={{ color: '#a78bfa', fontSize: '20px' }} />
        Add a Task
      </h2>

      {/* Input row */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          onChange={(e) => setTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          value={todo}
          type='text'
          placeholder='What needs to be done?'
          className='todo-input'
          style={{ flex: 1, borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: 500 }}
        />
        <button
          onClick={handleAdd}
          disabled={todo.trim().length <= 3}
          className='add-btn'
          style={{ borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <IoAdd style={{ fontSize: '16px' }} />
          <span className='hidden sm:inline'>Add</span>
        </button>
      </div>

      {/* Options toggle */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
      >
        <span style={{ fontSize: '8px' }}>{showOptions ? '▼' : '▶'}</span>
        Priority & due date
      </button>

      {/* Options panel */}
      {showOptions && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px',
            animation: 'fadeInDown 0.2s ease-out',
          }}
        >
          {/* Priority */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Priority:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {priorities.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPriority(p.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ...(priority === p.key
                      ? { background: p.bg, color: 'white', boxShadow: `0 4px 12px ${p.shadow}` }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
                    ),
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BsCalendar3 style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }} />
            <input
              type='date'
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className='todo-input'
              style={{ borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TodoInput
