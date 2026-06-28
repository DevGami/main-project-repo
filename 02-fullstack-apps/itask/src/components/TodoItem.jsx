import React, { useState } from 'react'
import { FaEdit, FaCheck } from 'react-icons/fa'
import { AiFillDelete } from 'react-icons/ai'
import { BsCalendar3 } from 'react-icons/bs'

const TodoItem = ({ item, onCheckbox, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.todo)

  const getDueDateLabel = (dateStr) => {
    if (!dateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dateStr + 'T00:00:00')
    const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { text: 'Overdue', color: '#f87171', bg: 'rgba(239,68,68,0.1)' }
    if (diff === 0) return { text: 'Today', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' }
    if (diff === 1) return { text: 'Tomorrow', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' }
    return {
      text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'rgba(255,255,255,0.4)',
      bg: 'rgba(255,255,255,0.04)'
    }
  }

  const handleSaveEdit = () => {
    if (editText.trim().length > 3) {
      onEdit(item.id, editText.trim())
      setIsEditing(false)
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') {
      setEditText(item.todo)
      setIsEditing(false)
    }
  }

  const dueDateLabel = getDueDateLabel(item.dueDate)

  const dotColors = {
    high: { bg: '#ef4444', shadow: '0 0 8px rgba(239,68,68,0.5)' },
    medium: { bg: '#f59e0b', shadow: '0 0 8px rgba(245,158,11,0.5)' },
    low: { bg: '#22c55e', shadow: '0 0 8px rgba(34,197,94,0.5)' },
  }
  const dot = dotColors[item.priority] || dotColors.medium

  return (
    <div className='todo-card' style={{ borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Checkbox */}
        <input
          name={item.id}
          onChange={onCheckbox}
          type='checkbox'
          checked={item.isCompleted}
          className='custom-checkbox'
        />

        {/* Priority dot */}
        <div
          title={`${item.priority || 'medium'} priority`}
          style={{
            width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
            background: dot.bg, boxShadow: dot.shadow,
          }}
        ></div>

        {/* Todo text or edit input */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              type='text'
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleSaveEdit}
              autoFocus
              className='todo-input'
              style={{ width: '100%', borderRadius: '8px', padding: '6px 12px', fontSize: '14px' }}
            />
          ) : (
            <div>
              <span
                style={{
                  fontSize: '14px', fontWeight: 500, lineHeight: 1.4, wordBreak: 'break-word',
                  ...(item.isCompleted ? { textDecoration: 'line-through', opacity: 0.4 } : {}),
                }}
              >
                {item.todo}
              </span>
              {dueDateLabel && !item.isCompleted && (
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', fontWeight: 500, padding: '2px 8px',
                    borderRadius: '99px', color: dueDateLabel.color, background: dueDateLabel.bg,
                  }}>
                    <BsCalendar3 style={{ fontSize: '8px' }} />
                    {dueDateLabel.text}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className='action-btn action-btn-save'
              style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              title='Save (Enter)'
            >
              <FaCheck style={{ fontSize: '12px' }} />
            </button>
          ) : (
            <button
              onClick={() => { setEditText(item.todo); setIsEditing(true) }}
              className='action-btn action-btn-edit'
              style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              title='Edit'
            >
              <FaEdit style={{ fontSize: '12px' }} />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className='action-btn action-btn-delete'
            style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            title='Delete'
          >
            <AiFillDelete style={{ fontSize: '12px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TodoItem
