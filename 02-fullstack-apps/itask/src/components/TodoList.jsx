import React from 'react'
import TodoItem from './TodoItem'
import EmptyState from './EmptyState'

const TodoList = ({ todos, showFinished, onCheckbox, onEdit, onDelete }) => {
  const filteredTodos = todos.filter(item => showFinished || !item.isCompleted)

  if (filteredTodos.length === 0) {
    return <EmptyState hasAnyTodos={todos.length > 0} />
  }

  return (
    <div>
      {filteredTodos.map((item) => (
        <TodoItem
          key={item.id}
          item={item}
          onCheckbox={onCheckbox}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TodoList
